/* eslint-disable no-throw-literal */
import * as fs from "fs";
import * as marked from "marked";
import * as _ from "lodash";
import { load } from "cheerio";
import { JSDOM } from "jsdom";

// ================================== INTERFACES ==================================

interface ArgumentNodes {
    argumentNodes: cheerio.Cheerio[]
}

interface AttributeNodes {
    attributeNodes: cheerio.Cheerio[]
}

interface SnippetNodes {
    snippetNodes: cheerio.Cheerio[]
}

interface UrlPathNodes {
    urlPathNodes: cheerio.Cheerio[]
}

interface Resource {
    name: string;
    args: variable[];
    attrs: variable[];
    url: string;
}

interface Snippet {
    name: string;
    example: string;
}

interface variable {
    name: string;
    description: string;
}

const resourcesPath = "/Users/luoyin/Code/terraform-provider-tencentcloud/website/docs/r/";
const dataSourcePath = "/Users/luoyin/Code/terraform-provider-tencentcloud/website/docs/d/";
const indexPath = "/Users/luoyin/Code/terraform-provider-tencentcloud/website/tencentcloud.erb";
// ================================== FUNCTIONS ==================================

function getParsed(filename: string): Promise<cheerio.Root> {
    return new Promise((resolve, reject) => {
        let file = fs.readFileSync(resourcesPath + filename) + "";
        marked(file, (err, result) => {
            if (err) {
                return reject(err);
            }
            let $ = load(result);
            resolve($);
        });
    });
}

function getAllParsed(files: string[]): Promise<cheerio.Root>[] {
    return _.map(files, file => {
        return getParsed(file);
    });
}

function getNumWithArgumentReference($s: cheerio.Root[]): number {
    let result = _.map($s, $ => {
        return $("h2").filter((z, el) => {
            return $(el).text() === "Argument Reference";
        }).length;
    });
    return result.length;
}

function getNumWithAttributesReference($s: cheerio.Root[]): number {
    let result = _.map($s, $ => {
        return $("h2").filter((z, el) => {
            return $(el).text() === "Attributes Reference";
        }).length;
    });
    return result.length;
}

/**
 * Returns a list of nodes that follow the "Arguments Reference" h2
 * 
 * @param {*} $ - The full page as a cheerio object
 */
function extractArgumentsContent($: cheerio.Root): ArgumentNodes {
    let argsH2 = $("h2").filter((z, el) => {
        return $(el).text() === "Argument Reference";
    });
    if (argsH2.length !== 1) {
        throw "Didn't find correct number of h2 > Arguments Reference";
    }
    let nodes = [];
    let currentNode: any = argsH2[0];
    while (true) {
        if (!(currentNode.type === "text" && currentNode["data"] === "\n")) {
            nodes.push(currentNode);
        }
        let nextSibling = _.get(currentNode, "nextSibling");
        if (!nextSibling || _.get(nextSibling, "name") === "h2") {
            break;
        }
        currentNode = _.get(currentNode, "nextSibling");
    }
    return { argumentNodes: nodes };
}

function extractAttributesContent($: cheerio.Root): AttributeNodes {
    let argsH2 = $("h2").filter((z, el) => {
        return $(el).text() === "Attribute Reference" || $(el).text() === "Attributes Reference";
    });
    if (argsH2.length !== 1) {
        console.error(`Didn't find any attributes on ${extractResourceName($)}`);
        return { attributeNodes: [] };
        // throw `Didn't find correct number of h2 > Attributes Reference on ${extractResourceName($)}`;
    }
    let nodes = [];
    let currentNode: any = argsH2[0];
    while (true) {
        if (!(currentNode.type === "text" && currentNode["data"] === "\n")) {
            nodes.push(currentNode);
        }
        let nextSibling = _.get(currentNode, "nextSibling");
        if (!nextSibling || _.get(nextSibling, "name") === "h2") {
            break;
        }
        currentNode = _.get(currentNode, "nextSibling");
    }
    return { attributeNodes: nodes };
}

function extractExampleContent($: cheerio.Root): string {
    let expH2 = $("h2").filter((z, el) => {
        return $(el).text() === "Example Usage";
    });
    if (expH2.length !== 1) {
        console.error(`Didn't find any example on ${extractResourceName($)}`);
        return "";
        // throw "Didn't find correct number of h2 > Example Usage";
    }
    let content = "This example will be ready later.";
    let currentNode: any = expH2[0];
    while (true) {
        const nextSibling = _.get(currentNode, 'nextSibling');
        if (!nextSibling || _.get(nextSibling, 'name') === 'h2') {
            break;
        }

        currentNode = _.get(currentNode, 'nextSibling');

        // exsit multiple example
        if (currentNode.type === 'tag' && currentNode.name === 'h3') {
            currentNode = _.get(currentNode, 'nextSibling');
            continue;
        }

        // only extract the first one
        if (currentNode.type === 'tag' && currentNode.name === 'pre') {
            content = $(currentNode).text();
            break;
        }
    }

    return content;
}

function extractExamples(expNodes: SnippetNodes, $: cheerio.Root): string {
    let nodes = expNodes.snippetNodes;

    // const snippetText = nodes.map((nn) => $(nn).text()).join('');
    const textArray = _.map(nodes, node => {
        return $(node).text();
    });

    console.debug("[DEBUG]#### len:[%d], textArray:[%v]", textArray.length, textArray);

    const snippetTexts = textArray.join("");
    console.debug("[DEBUG]#### snippetTexts:[%s]", snippetTexts);

    return snippetTexts;
}

function extractArguments(argNodes: ArgumentNodes, $: cheerio.Root): variable[] {
    let nodes = argNodes.argumentNodes;

    // Find the first ul
    let firstUl = _.find(nodes, (o: any) => o.name === "ul");

    if (!firstUl) {
        // throw "Didn't find a UL when searching through arguments";
        // console.error(`Didn't find a UL when searching through arguments on ${extractResourceName($)}`);
        return [];
    }
    return _.map($(firstUl).find("li"), li => {
        let text = $(li).text();
        let regex = /([a-zA-Z0-9_]+) (.+)/;
        let result = text.match(regex);
        let name, description;
        if (!result) {
            name = text;
            //console.error(`Didn't find a description for ${text} on ${extractResourceName($)}`);
        }
        else {
            name = result[1];
            description = result[2];
        }
        return { name, description };
    });
}

function extractAttributes(argNodes: AttributeNodes, $: cheerio.Root): variable[] {
    if (argNodes.attributeNodes.length === 0) {
        return [];
    }

    let nodes = argNodes.attributeNodes;
    // Find the first ul
    let firstUl = _.find(nodes, (o: any) => o.name === "ul");
    if (!firstUl) {
        // console.error(`Didn't find a UL when searching through attributes on ${extractResourceName($)}`);
        return [];
    }
    return _.map($(firstUl).find("li"), li => {
        let text = $(li).text();
        let regex = /([a-zA-Z0-9_]+) (.+)/;
        let result = text.match(regex);
        let name, description;
        if (!result) {
            name = text;
            // console.error(`Didn't find a description for ${text} on ${extractResourceName($)}`);
        }
        else {
            name = result[1];
            description = result[2];
        }
        return { name, description };
    });
}

function extractResourceName($: cheerio.Root): string {
    let name = $("h1").text();
    if (!name) {
        throw "Couldn't extract name";
    }
    return name;
}

function findAnchorElementByText(doc: Document, text: string): HTMLAnchorElement | null {
    const aTags = doc.querySelectorAll("a");

    for (const aTag of aTags) {
        if (aTag.textContent?.trim() === text) {
            return aTag;
        }
    }

    return null;
}

function extractHrefToMap(aTags: HTMLAnchorElement[], hrefsMap: Map<string, string>): void {
    for (const aTag of aTags) {
        const key = aTag.textContent;
        const url = aTag.getAttribute("href");
        if (key && url) {
            hrefsMap.set(key, url);
        }
    }
}

function findAllAnchorElementsByText(doc: Document, text: string): HTMLAnchorElement[] {
    const aTags = doc.querySelectorAll("a");
    return Array.from(aTags).filter((aTag) => aTag.textContent?.trim() === text);
}

function extractResourceUrl(html: string): Map<string, string> {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const hrefsMap = new Map<string, string>();

    const dataSourcesATags = findAllAnchorElementsByText(doc, "Data Sources");
    const resourcesATags = findAllAnchorElementsByText(doc, "Resources");

    // process data source tags
    for (const dataSourceATag of dataSourcesATags) {
        const dataSourceUL = dataSourceATag.nextElementSibling;
        const dsLiATags = dataSourceUL?.querySelectorAll("a") || [];
        extractHrefToMap(Array.from(dsLiATags), hrefsMap);
    }

    // process resource tags
    for (const resourceATag of resourcesATags) {
        const resourceUL = resourceATag.nextElementSibling;
        const resLiATags = resourceUL?.querySelectorAll("a") || [];
        extractHrefToMap(Array.from(resLiATags), hrefsMap);
    }

    return hrefsMap;
}

// ================================== generate process ==================================

const files = fs.readdirSync(resourcesPath);
const indexHtml = fs.readFileSync(indexPath, "utf-8");
Promise.all(getAllParsed(files)).then($s => {
    const args = process.argv.slice(2);
    let type = "";
    if (args.length > 0) {
        type = args[0];
    }

    let transformed: any;
    if (type === "example") {
        // example collection
        const examples: Snippet[] = _.map($s, $ => {
            const resName = extractResourceName($);
            return {
                name: resName,
                example: extractExampleContent($),
            };
        });
        transformed = _.transform(examples, (result, value) => {
            result[value.name] = {
                example: value.example
            };
        }, {});

    } else {
    // resource collection
        const resIndexMap = extractResourceUrl(indexHtml);
        const resources: Resource[] = _.map($s, $ => {
            const resName = extractResourceName($);
            return {
                name: resName,
                args: extractArguments(extractArgumentsContent($), $),
                attrs: extractAttributes(extractAttributesContent($), $),
                url: resIndexMap.get(resName)
            };
        });
        transformed = _.transform(resources, (result, value, key) => {
            result[value.name] = {
                args: value.args,
                attrs: value.attrs,
                url: value.url
            };
        }, {});
    }

    console.log(JSON.stringify(transformed));
});

function fun(v: any, i: any, array: any): (value: string, index: number, array: string[]) => void {
    throw new Error("Function not implemented.");
}
