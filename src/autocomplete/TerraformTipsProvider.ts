import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionItemKind } from "vscode";
import resources from '../../config/tips/tiat-resources.json';
import * as _ from "lodash";
import * as vscode from 'vscode';

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

export class TerraformTipsProvider implements CompletionItemProvider {
    document: TextDocument;
    position: Position;
    token: CancellationToken;
    resourceType: string | null = null;

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: TerraformCompletionContext): CompletionItem[] {
        this.document = document;
        this.position = position;
        this.token = token;

        // Check if we're on the top level
        const lineText = document.lineAt(position.line).text;
        const lineTillCurrentPosition = lineText.substring(0, position.character);

        // Are we trying to type a resource type?
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
                    return new CompletionItem(o, CompletionItemKind.Field);
                });
            }
            else if (parts.length === 2) {
                // We're trying to type the resource name
                const resourceType = parts[0];

                // Get a list of all the names for this resource type
                let names = this.getNamesForResourceType(document, resourceType);
                return _.map(names, o => new CompletionItem(o, CompletionItemKind.Field));
            }
            else if (parts.length === 3) {
                // We're trying to type the exported field for the let
                const resourceType = parts[0];
                let resourceName = parts[1];
                let attrs = resources[resourceType].attrs;
                let result = _.map(attrs, o => {
                    let c = new CompletionItem(`${o.name} (${resourceType})`, CompletionItemKind.Property);
                    c.detail = o.description;
                    c.insertText = o.name;
                    return c;
                });
                return result;
            }

            // Which part are we completing for?
            return [];
        }

        // Are we trying to type a parameter to a resource?
        let possibleResources = this.checkTopLevelResource(lineTillCurrentPosition);
        if (possibleResources.length > 0) {
            return this.getHintsForStrings(possibleResources);
        }

        const endwithEqual = lineTillCurrentPosition.endsWith('=');
        const includeEqual = lineTillCurrentPosition.indexOf('=');
        // handle options
        if (this.resourceType) {
            // when we typing a '=' character
            if (endwithEqual) {
                const lineBeforeEqualSign = lineTillCurrentPosition.substring(0, includeEqual).trim();
                // load options
                const name = lineBeforeEqualSign;
                const argStrs = this.findArgByName(resources[this.resourceType].args, name);
                const options = this.getOptionsFormArg(argStrs);
                // clear resource type
                this.resourceType = "";
                return (options).length ? options : [];
            }
            return [];
        }

        // Check if we're in a resource definition
        if (includeEqual < 0 && !endwithEqual) {
            // we're not in options case
            for (let i = position.line - 1; i >= 0; i--) {
                let line = document.lineAt(i).text;
                let parentType = this.getParentType(line);
                if (parentType && parentType.type === "resource") {
                    const resourceType = this.getResourceTypeFromLine(line);
                    const ret = this.getItemsForArgs(resources[resourceType].args, resourceType);
                    return ret;
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
            c.insertText = "\"" + opt + "\"";
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
            let result = line.match(r);
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
            let resourceType = element;
            if (resourceType.startsWith(line)) {
                return [new CompletionItem(resourceType, CompletionItemKind.Enum)];
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

    checkTopLevelResource(lineTillCurrentPosition: string): any[] {
        let parts = lineTillCurrentPosition.split(" ");
        if (parts.length === 2 && parts[0] === "resource") {
            let r = parts[1].replace(/"/g, '');
            let regex = new RegExp("^" + r);
            let possibleResources = _.filter(_.keys(resources), k => {
                if (regex.test(k)) {
                    return true;
                }
                return false;
            });
            return possibleResources;
        }
        return [];
    }

    getHintsForStrings(strings: string[]): CompletionItem[] {
        return _.map(strings, s => {
            return new CompletionItem(s, CompletionItemKind.Enum);
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
            return c;
        });
    }

    public handleCharacterEvent(event: vscode.TextDocumentChangeEvent) {
        const activeEditor = vscode.window.activeTextEditor;

        if (!activeEditor || event.document !== activeEditor.document) {
            return;
        }

        const changes = event.contentChanges[0];
        if (changes.text === '=') {
            const position = activeEditor.selection.active;
            const resourceType = this.findResourceType(event.document, position);

            if (resourceType) {
                this.resourceType = resourceType;
                vscode.commands.executeCommand('editor.action.triggerSuggest');
            }
        }
    }
}