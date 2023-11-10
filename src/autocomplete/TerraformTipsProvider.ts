import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionItemKind } from "vscode";
import resources from '../../config/tips/tiat-resources.json';
import * as _ from "lodash";
import * as vscode from 'vscode';

var topLevelTypes = ["output", "provider", "resource", "variable", "data"];
var topLevelRegexes = topLevelTypes.map(o => {
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



    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: TerraformCompletionContext): CompletionItem[] {
        this.document = document;
        this.position = position;
        this.token = token;

        // Check if we're on the top level
        let lineText = document.lineAt(position.line).text;
        let lineTillCurrentPosition = lineText.substr(0, position.character);

        // Are we trying to type a resource type?
        if (this.isTopLevelType(lineTillCurrentPosition)) {
            return this.getTopLevelType(lineTillCurrentPosition);
        }

        // Are we trying to type a variable?
        if (this.isTypingTfCode(lineTillCurrentPosition)) {
            // These variables should always just have 3 parts, resource type, resource name, exported field
            var varString = this.getVariableString(lineTillCurrentPosition);
            var parts = varString.split(".");

            if (parts.length === 1) {
                // We're trying to type the resource type
                var resourceTypePrefix = parts[1];

                // Get a list of all the resource types we've defined in this file
                var definedResourceTypes = this.getDefinedResourceTypes(document);
                var finalResourceTypes = _.filter(definedResourceTypes, o => (o.indexOf(resourceTypePrefix) === 0));
                return _.map(finalResourceTypes, o => {
                    return new CompletionItem(o, CompletionItemKind.Field);
                });
            }
            else if (parts.length === 2) {
                // We're trying to type the resource name
                const resourceType = parts[0];

                // Get a list of all the names for this resource type
                var names = this.getNamesForResourceType(document, resourceType);
                return _.map(names, o => new CompletionItem(o, CompletionItemKind.Field));
            }
            else if (parts.length === 3) {
                // We're trying to type the exported field for the var
                const resourceType = parts[0];
                var resourceName = parts[1];
                var attrs = resources[resourceType].attrs;
                var result = _.map(attrs, o => {
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

        // type '='
        if (lineTillCurrentPosition.endsWith('=') && context.resourceType) {

            // const completionItems: CompletionItem[] = [
            //     new CompletionItem('Option1', CompletionItemKind.Value),
            //     new CompletionItem('Option2', CompletionItemKind.Value)
            // ];

            const match = lineTillCurrentPosition.match(/(\w+)\s*=/);
            if (match) {
                // load options
                const name = match[1];
                const strs = this.findArgByName(resources[context.resourceType].args, name);
                return this.packOptionsFormStrings(strs);
            }
            return [];
        }

        // Check if we're in a resource definition
        for (var i = position.line - 1; i >= 0; i--) {
            let line = document.lineAt(i).text;
            let parentType = this.getParentType(line);
            if (parentType && parentType.type === "resource") {
                const resourceType = this.getResourceTypeFromLine(line);
                let ret = this.getItemsForArgs(resources[resourceType].args, resourceType);
                return ret;
            }
            else if (parentType && parentType.type !== "resource") {
                // We don't want to accidentally include some other containers stuff
                return [];
            }
        }

        return [];
    }

    findResourceType(document: vscode.TextDocument, position: vscode.Position): string | undefined {
        const resourceRegex = /resource\s+"([^"]+)"\s+"[^"]+"\s+\{/;

        for (let i = position.line - 1; i >= 0; i--) {
            const line = document.lineAt(i).text;
            const match = line.match(resourceRegex);

            if (match) {
                return match[1];
            }
        }

        return undefined;
    }

    packOptionsFormStrings(strings: string[]): CompletionItem[] {
        return _.map(strings, s => {
            return new CompletionItem(s, CompletionItemKind.Enum);
        });
    }

    findArgByName(args: any, name: string): any {
        return args.find((arg) => arg.name === name);
    }

    getNamesForResourceType(document: TextDocument, resourceType: string): string[] {
        var r = new RegExp('resource "' + resourceType + '" "([a-zA-Z0-9\-_]+)"');
        var found = [];
        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i).text;
            var result = line.match(r);
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
        var r = /resource "([a-zA-Z0-9\-_]+)"/;
        var found = [];
        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i).text;
            var result = line.match(r);
            if (result && result.length > 1) {
                found.push(result[1]);
            }
        }
        return _.uniq(found);
    }

    isTopLevelType(line: string): boolean {
        for (var i = 0; i < topLevelTypes.length; i++) {
            let resourceType = topLevelTypes[i];
            if (resourceType.indexOf(line) === 0) {
                return true;
            }
        }
        return false;
    }

    getTopLevelType(line: string): CompletionItem[] {
        for (var i = 0; i < topLevelTypes.length; i++) {
            let resourceType = topLevelTypes[i];
            if (resourceType.indexOf(line) === 0) {
                return [new CompletionItem(resourceType, CompletionItemKind.Enum)];
            }
        }
        return [];
    }

    isTypingTfCode(line: string): boolean {
        var r = /\$\{[0-9a-zA-Z_\.\-]*$/;
        return r.test(line);
    }

    getVariableString(line: string): string {
        var r = /\$\{([0-9a-zA-Z_\.\-]*)$/;
        var result = line.match(r);
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
            var possibleResources = _.filter(_.keys(resources), k => {
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
        for (var i = 0; i < topLevelRegexes.length; i++) {
            let tl = topLevelRegexes[i];
            if (tl.regex.test(line)) {
                return tl;
            }
        }
        return false;
    }

    getResourceTypeFromLine(line: string): string {
        var lineParts = line.split(" ");
        var type = lineParts[1];
        return type.replace(/"/g, '');
    }

    getItemsForArgs(args, type) {
        return _.map(args, o => {
            let c = new CompletionItem(`${o.name} (${type})`, CompletionItemKind.Property);
            let text = o.name;
            if (o.default) {
                text = text + ' = ' + o.default;
            }
            let desc = o.description;
            if (o.options && o.options.length > 0) {
                let options = "";
                o.options.prototype.forEach(oo => {
                    options = options + oo + ',';
                });
                desc = 'Optional Values: ' + options;
            }
            c.insertText = text;
            c.detail = desc;
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
                setTimeout(() => {
                    const cancellationTokenSource = new vscode.CancellationTokenSource();
                    const context: TerraformCompletionContext = {
                        triggerKind: vscode.CompletionTriggerKind.Invoke,
                        triggerCharacter: undefined,
                        resourceType,
                    };
                    this.provideCompletionItems(event.document, position, cancellationTokenSource.token, context);
                    vscode.commands.executeCommand('editor.action.triggerSuggest');
                }, 10);
            }
        }
    }


}