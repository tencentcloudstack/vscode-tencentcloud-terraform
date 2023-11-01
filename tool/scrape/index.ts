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
    args: Variable[];
    attrs: Variable[];
    url: string;
}

interface Variable {
    name: string;
    description: string;
}

const resourcesPath = "terraform-provider-tencentcloud/website/docs/r/";
const dataSourcePath = "terraform-provider-tencentcloud/website/docs/d/";
const indexPath = "terraform-provider-tencentcloud/website/tencentcloud.erb";
// ================================== FUNCTIONS ==================================

function getParsed(filename: string): Promise<cheerio.Root> {
    return new Promise((resolve, reject) => {
        var file = fs.readFileSync(resourcesPath + filename) + "";
        marked(file, (err, result) => {
            if (err) {
                return reject(err);
            }
            var $ = load(result);
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
    var result = _.map($s, $ => {
        return $("h2").filter((z, el) => {
            return $(el).text() === "Argument Reference";
        }).length;
    });
    return result.length;
}

function getNumWithAttributesReference($s: cheerio.Root[]): number {
    var result = _.map($s, $ => {
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
    var argsH2 = $("h2").filter((z, el) => {
        return $(el).text() === "Argument Reference";
    });
    if (argsH2.length !== 1) {
        throw "Didn't find correct number of h2 > Arguments Reference";
    }
    var nodes = [];
    var currentNode: any = argsH2[0];
    while (true) {
        if (!(currentNode.type === "text" && currentNode["data"] === "\n")) {
            nodes.push(currentNode);
        }
        var nextSibling = _.get(currentNode, "nextSibling");
        if (!nextSibling || _.get(nextSibling, "name") === "h2") {
            break;
        }
        currentNode = _.get(currentNode, "nextSibling");
    }
    return { argumentNodes: nodes };
}

function extractAttributesContent($: cheerio.Root): AttributeNodes {
    var argsH2 = $("h2").filter((z, el) => {
        return $(el).text() === "Attribute Reference" || $(el).text() === "Attributes Reference";
    });
    if (argsH2.length !== 1) {
        console.error(`Didn't find any attributes on ${extractResourceName($)}`);
        return { attributeNodes: [] };
        // throw `Didn't find correct number of h2 > Attributes Reference on ${extractResourceName($)}`;
    }
    var nodes = [];
    var currentNode: any = argsH2[0];
    while (true) {
        if (!(currentNode.type === "text" && currentNode["data"] === "\n")) {
            nodes.push(currentNode);
        }
        var nextSibling = _.get(currentNode, "nextSibling");
        if (!nextSibling || _.get(nextSibling, "name") === "h2") {
            break;
        }
        currentNode = _.get(currentNode, "nextSibling");
    }
    return { attributeNodes: nodes };
}

// function extractExampleContents($: cheerio.Root): SnippetNodes {
//     var argsH2 = $("h2").filter((z, el) => {
//         return $(el).text() == "Example Usage";
//     });
//     if (argsH2.length != 1) {
//         console.error(`Didn't find any example on ${extractResourceName($)}`);
//         throw "Didn't find correct number of h2 > Example Usage";
//     }
// }

// function extractExamples(argNodes: SnippetNodes, $: cheerio.Root): Variable[] {
//     if (argNodes.snippetNodes.length == 0) return [];

//     let nodes = argNodes.snippetNodes;

//     // Find the first ul
//     var firstUl = _.find(nodes, (o: any) => o.name == "ul");
//     if (!firstUl) {
//         console.error(`Didn't find a UL when searching through snippets on ${extractResourceName($)}`);
//     }
// }

function extractArguments(argNodes: ArgumentNodes, $: cheerio.Root): Variable[] {
    let nodes = argNodes.argumentNodes;

    // Find the first ul
    var firstUl = _.find(nodes, (o: any) => o.name === "ul");

    if (!firstUl) {
        // throw "Didn't find a UL when searching through arguments";
        // console.error(`Didn't find a UL when searching through arguments on ${extractResourceName($)}`);
        return [];
    }
    return _.map($(firstUl).find("li"), li => {
        let text = $(li).text();
        let regex = /([a-zA-Z0-9_]+) (.+)/;
        let result = text.match(regex);
        var name, description;
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

function extractAttributes(argNodes: AttributeNodes, $: cheerio.Root): Variable[] {
    if (argNodes.attributeNodes.length === 0) {
        return [];
    }

    let nodes = argNodes.attributeNodes;
    // Find the first ul
    var firstUl = _.find(nodes, (o: any) => o.name === "ul");
    if (!firstUl) {
        // console.error(`Didn't find a UL when searching through attributes on ${extractResourceName($)}`);
        return [];
    }
    return _.map($(firstUl).find("li"), li => {
        let text = $(li).text();
        let regex = /([a-zA-Z0-9_]+) (.+)/;
        let result = text.match(regex);
        var name, description;
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
    let transformed = _.transform(resources, (result, value, key) => {
        result[value.name] = {
            args: value.args,
            attrs: value.attrs,
            url: value.url
        };
    }, {});

    console.log(JSON.stringify(transformed));
});