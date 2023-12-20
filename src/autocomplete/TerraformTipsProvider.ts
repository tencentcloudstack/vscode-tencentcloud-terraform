import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionItemKind } from "vscode";
// import resources from '../../config/tips/tiat-resources.json';
import * as _ from "lodash";
import * as vscode from 'vscode';
import { executeCommandByExec } from "@/utils/cpUtils";
import * as fs from "fs";
import * as path from "path";
import * as workspaceUtils from "@/utils/workspaceUtils";
import * as TelemetryWrapper from "vscode-extension-telemetry-wrapper";

const LATEST_VERSION = "latest";
const versionPattern = /^v\d+(\.\d+){2}\.json$/;
let topLevelTypes = ["output", "provider", "resource", "variable", "data"];
let topLevelRegexes = topLevelTypes.map(o => {
    return {
        type: o,
        regex: new RegExp(o + ' "[A-Za-z0-9\-_]+" "[A-Za-z0-9\-_]*" \{')
    };
});

interface TerraformCompletionContext extends vscode.CompletionContext {
    resourceType?: string;
}

interface Argument {
    name: string;
    description: string;
    options?: Array<string>;
    detail?: Array<Argument>;
}

interface Attribute {
    name: string;
    description: string;
    detail?: Array<Attribute>;
}

interface Tips {
    version: string;
    resource: {
        [key: string]: {
            args: Array<Argument>;
            attrs: Array<Attribute>;
        };
    };
}

const TEXT_MIN_SORT = "a";
const TEXT_FILTER = " ";

export const TIPS_TRIGGER_CHARACTER = [".", "\""];
export const TIPS_OPTIONS_TRIGGER_CHARACTER = '=';

export class TerraformTipsProvider implements CompletionItemProvider {
    document: TextDocument;
    position: Position;
    token: CancellationToken;
    resourceType: string | null = null;
    private extensionPath: string;
    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
    }

    public async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: TerraformCompletionContext): Promise<CompletionItem[]> {
        this.document = document;
        this.position = position;
        this.token = token;

        // Check if we're on the top level
        const lineText = document.lineAt(position.line).text;
        const lineTillCurrentPosition = lineText.substring(0, position.character);

        // handle top level definition
        if (this.isTopLevelType(lineTillCurrentPosition)) {
            return this.getTopLevelType(lineTillCurrentPosition);
        }

        // Are we trying to type a variable?
        if (this.isTypingTfCode(lineTillCurrentPosition)) {
            // These variables should always just have 3 parts, resource type, resource name, exported field
            let varString = this.getVariableString(lineTillCurrentPosition);
            let parts = varString.split(".");

            if (parts.length === 1) {
                // We're trying to type the resource type
                let resourceTypePrefix = parts[1];

                // Get a list of all the resource types we've defined in this file
                let definedResourceTypes = this.getDefinedResourceTypes(document);
                let finalResourceTypes = _.filter(definedResourceTypes, o => (o.indexOf(resourceTypePrefix) === 0));
                return _.map(finalResourceTypes, o => {
                    const c = new CompletionItem(o, CompletionItemKind.Field);
                    c.sortText = TEXT_MIN_SORT;
                    return c;
                });
            }
            else if (parts.length === 2) {
                // We're trying to type the resource name
                const resourceType = parts[0];

                // Get a list of all the names for this resource type
                let names = this.getNamesForResourceType(document, resourceType);
                return _.map(names, o => {
                    const c = new CompletionItem(o, CompletionItemKind.Field);
                    c.sortText = TEXT_MIN_SORT;
                    return c;
                });
            }
            else if (parts.length === 3) {
                // We're trying to type the exported field for the let
                const resourceType = parts[0];
                let resourceName = parts[1];
                try {
                    // async load resource config 
                    const tips = await loadResource(this.extensionPath);
                    const resources = tips.resource;
                    let attrs = resources[resourceType].attrs;
                    let result = _.map(attrs, o => {
                        let c = new CompletionItem(`${o.name}(${resourceType})`, CompletionItemKind.Property);
                        c.detail = o.description;
                        c.insertText = o.name;
                        c.sortText = TEXT_MIN_SORT;
                        return c;
                    });
                    return result;

                } catch (error) {
                    console.error(`Can not load resource from json. error:[${error}]`);
                }
            }

            // Which part are we completing for?
            return [];
        }

        // Are we trying to type a parameter to a resource?
        let possibleResources = await this.checkTopLevelResource(lineTillCurrentPosition);
        // handle resource type
        if (possibleResources.length > 0) {
            return this.getHintsForStrings(possibleResources);
        }

        const endwithEqual = lineTillCurrentPosition.endsWith(TIPS_OPTIONS_TRIGGER_CHARACTER);
        const includeEqual = lineTillCurrentPosition.indexOf(TIPS_OPTIONS_TRIGGER_CHARACTER);
        // handle options
        if (this.resourceType) {
            // typing a '=' character
            if (endwithEqual) {
                const lineBeforeEqualSign = lineTillCurrentPosition.substring(0, includeEqual).trim();
                // load options
                try {
                    // async load resource config 
                    const tips = await loadResource(this.extensionPath);
                    const name = lineBeforeEqualSign;
                    const resources = tips.resource;
                    const argStrs = this.findArgByName(resources[this.resourceType].args, name);
                    const options = this.getOptionsFormArg(argStrs);
                    // clear resource type
                    this.resourceType = "";
                    return (options).length ? options : [];
                } catch (error) {
                    console.error(`Can not load resource from json when loading options. error:[${error}]`);
                }
            }
            this.resourceType = "";
            return [];
        }

        // handle argument
        if (includeEqual < 0 && !endwithEqual) {
            // we're not in options case
            for (let i = position.line - 1; i >= 0; i--) {
                let line = document.lineAt(i).text;
                let parentType = this.getParentType(line);
                if (parentType && parentType.type === "resource") {
                    // typing a argument in resource
                    const resourceType = this.getResourceTypeFromLine(line);
                    try {
                        // async load resource config 
                        const tips = await loadResource(this.extensionPath);
                        const resources = tips.resource;
                        const ret = this.getItemsForArgs(resources[resourceType].args, resourceType);
                        return ret;
                    } catch (error) {
                        console.error(`Can not load resource from json when loading argument. error:[${error}]`);
                        return [];
                    }
                }
                else if (parentType && parentType.type !== "resource") {
                    // We don't want to accidentally include some other containers stuff
                    return [];
                }
            }
        }

        return [];
    }

    findResourceType(document: vscode.TextDocument, position: vscode.Position): string | undefined {
        const resourceRegex = /resource\s+"([^"]+)"\s+"[^"]+"\s+\{/;

        for (let i = position.line - 1; i >= 0; i--) {
            const line = document.lineAt(i).text;
            const match = RegExp(resourceRegex).exec(line);

            if (match) {
                return match[1];
            }
        }

        return undefined;
    }

    getOptionsFormArg(opts: string[]): CompletionItem[] {
        return _.map(opts, opt => {
            let c = new CompletionItem(opt, CompletionItemKind.Value);
            const text = "\ \"" + opt + "\"";
            c.insertText = text;
            c.sortText = TEXT_MIN_SORT;
            c.filterText = TEXT_FILTER;
            return c;
        });
    }

    findArgByName(args: any, name: string): any {
        const arg = args.find((arg) => arg.name === name);
        return arg.options;
    }

    getNamesForResourceType(document: TextDocument, resourceType: string): string[] {
        let r = new RegExp('resource "' + resourceType + '" "([a-zA-Z0-9\-_]+)"');
        let found = [];
        for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i).text;
            let result = RegExp(r).exec(line);
            if (result && result.length > 1) {
                found.push(result[1]);
            }
        }
        return _.uniq(found);
    }

    /**
     * Returns a list of resource type strings
     */
    getDefinedResourceTypes(document: TextDocument) {
        let r = /resource "([a-zA-Z0-9\-_]+)"/;
        let found = [];
        for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i).text;
            let result = RegExp(r).exec(line);
            if (result && result.length > 1) {
                found.push(result[1]);
            }
        }
        return _.uniq(found);
    }

    isTopLevelType(line: string): boolean {
        for (const element of topLevelTypes) {
            let resourceType = element;
            if (resourceType.startsWith(line)) {
                return true;
            }
        }
        return false;
    }

    getTopLevelType(line: string): CompletionItem[] {
        for (const element of topLevelTypes) {
            let topType = element;
            if (topType.startsWith(line)) {
                const c = new CompletionItem(`${topType}(tencentcloud)`, CompletionItemKind.Enum);
                c.insertText = topType;
                c.sortText = TEXT_MIN_SORT;
                return [c];
            }
        }
        return [];
    }

    isTypingTfCode(line: string): boolean {
        let r = /\$\{[0-9a-zA-Z_\.\-]*$/;
        return r.test(line);
    }

    getVariableString(line: string): string {
        let r = /\$\{([0-9a-zA-Z_\.\-]*)$/;
        let result = RegExp(r).exec(line);
        // let result = line.match(r);
        if (result.length > 1) {
            return result[1];
        }
        return "";
    }

    async checkTopLevelResource(lineTillCurrentPosition: string): Promise<any[]> {
        let parts = lineTillCurrentPosition.split(" ");
        if (parts.length === 2 && parts[0] === "resource") {
            let r = parts[1].replace(/"/g, '');
            let regex = new RegExp("^" + r);
            // handle resource
            try {
                // async load resource config 
                const tips = await loadResource(this.extensionPath);
                const resources = tips.resource;
                let possibleResources = _.filter(_.keys(resources), k => {
                    if (regex.test(k)) {
                        return true;
                    }
                    return false;
                });
                return possibleResources;
            } catch (error) {
                console.error(`Can not load resource from json when loading resource type. error:[${error}]`);
                return [];
            }
        }
        return [];
    }

    getHintsForStrings(strings: string[]): CompletionItem[] {
        return _.map(strings, s => {
            const c = new CompletionItem(s, CompletionItemKind.Enum);
            c.sortText = TEXT_MIN_SORT;
            return c;
        });
    }

    getParentType(line: string): boolean | any {
        for (const element of topLevelRegexes) {
            let tl = element;
            if (tl.regex.test(line)) {
                return tl;
            }
        }
        return false;
    }

    getResourceTypeFromLine(line: string): string {
        let lineParts = line.split(" ");
        let type = lineParts[1];
        return type.replace(/"/g, '');
    }

    getItemsForArgs(args, type) {
        return _.map(args, o => {
            let c = new CompletionItem(`${o.name} (${type})`, CompletionItemKind.Property);
            c.detail = o.description;
            c.insertText = o.name;
            c.sortText = TEXT_MIN_SORT;
            return c;
        });
    }

    public handleCharacterEvent(event: vscode.TextDocumentChangeEvent) {
        const activeEditor = vscode.window.activeTextEditor;

        if (!activeEditor || event.document !== activeEditor.document) {
            return;
        }

        const changes = event.contentChanges[0];
        if (changes && changes.text === TIPS_OPTIONS_TRIGGER_CHARACTER) {
            const position = activeEditor.selection.active;
            const resourceType = this.findResourceType(event.document, position);

            if (resourceType) {
                this.resourceType = resourceType;
                vscode.commands.executeCommand('editor.action.triggerSuggest');
            }
        }
    }
}

async function sortJsonFiles(dir: string) {
    let jsonFiles: string[];
    try {
        const files = fs.readdirSync(dir);
        jsonFiles = files.filter(file => path.extname(file) === '.json' && versionPattern.test(file));
        // const jsonFiles: string[] = ["v1.81.50.json", "v1.81.54.json"]; // debug data
    } catch (error) {
        console.error(`read dir failed. error:[${error}]`);
        return null;
    }

    // import files
    const versions = await Promise.all(jsonFiles.map(async file => {
        const jsonPath = path.join("../config/tips/", file);
        // const json = await import(jsonPath);
        const json = require(jsonPath);
        const version = json.version as string;
        return {
            json,
            version
        };
    }));

    // sort with version desc
    versions.sort((a, b) => compareVersions(b.version, a.version));
    return versions;
}

function compareVersions(a, b) {
    if (a && !b) { return 1; }
    if (!a && b) { return -1; }
    if (a === 'latest') { return 1; }
    if (b === 'latest') { return -1; }
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < aParts.length; i++) {
        if (aParts[i] > bParts[i]) {
            return 1;
        } else if (aParts[i] < bParts[i]) {
            return -1;
        }
    }
    //equal
    return 0;
}

// load resource config from json files based on the appropriate version
async function loadResource(extPath: string): Promise<Tips> {
    let tfVersion: string;
    const cwd = workspaceUtils.getActiveEditorPath();
    if (!cwd) {
        TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
        console.error(`can not get path from active editor`);
    }

    await executeCommandByExec("terraform version", cwd).then(output => {
        let match = RegExp(/tencentcloudstack\/tencentcloud (v\d+\.\d+\.\d+)/).exec(output);

        if (match) {
            tfVersion = match[1];
        } else {
            // gives the latest JSON if not tf provider version found
            tfVersion = LATEST_VERSION;
        }
        console.log(`tf provider version:[${tfVersion}], cwd:[${cwd}]`);
    }).catch(error => {
        console.error(`execute terraform version failed: ${error}`);
    });

    let result: Tips | null = null;
    const tipsDir = path.join(extPath, 'config', 'tips');
    const tipFiles = await sortJsonFiles(tipsDir);

    tipFiles.some(file => {
        if (compareVersions(tfVersion, file.version) >= 0) {
            result = file.json as Tips;
            return true;
        }
        // gives the latest JSON if not one JSON files matched
        result = file.json as Tips;
        return false;
    });

    console.log(`Loaded json. tf version:[${tfVersion}], json version:[${result.version}]`);
    // vscode.window.showInformationMessage(`Loaded json. tf version:[${tfVersion}], json version:[${result.version}]`);

    return result;
}
