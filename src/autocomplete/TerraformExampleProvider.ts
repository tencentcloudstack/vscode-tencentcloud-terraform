import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem } from "vscode";
import resources from '../../config/tips/tiat-resources.json';
import * as _ from "lodash";

var topLevelTypes = ["output", "provider", "resource", "variable", "data"];
var topLevelRegexes = topLevelTypes.map(o => {
    return {
        type: o,
        regex: new RegExp(o + ' "[A-Za-z0-9\-_]+" "[A-Za-z0-9\-_]*" \{')
    };
});

export class TerraformExampleProvider implements CompletionItemProvider {
    document: TextDocument;
    position: Position;
    token: CancellationToken;

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): CompletionItem[] {
        return [];
    }
}