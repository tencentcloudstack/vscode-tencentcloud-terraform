import { HoverProvider, TextDocument, Position, CancellationToken, CompletionItem, CompletionItemKind, Hover, ProviderResult } from "vscode";
import resources from '../../config/tips/tiat-resources.json';
import * as _ from "lodash";

var topLevelTypes = ["output", "provider", "resource", "variable", "data"];
var topLevelRegexes = topLevelTypes.map(o => {
    return {
        type: o,
        regex: new RegExp(o + ' "[A-Za-z0-9\-_]+" "[A-Za-z0-9\-_]*" \{')
    };
});

export class TerraformHoverProvider implements HoverProvider {
    provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
        throw new Error("Method not implemented.");
    }

}