import {
    DefinitionProvider,
    TextDocument,
    Position,
    CancellationToken,
    Definition
} from "vscode";
import * as _ from "lodash";
// import * as opn from "opn";
import opn from "opn";
import resources from '../../config/tips/tiat-resources.json';

const urlPrefix = "https://www.terraform.io";

export class TerraformResDocProvider implements DefinitionProvider {
    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Definition {
        const words = document.getWordRangeAtPosition(position);
        const resName = document.getText(words);

        const found = _.get(resources, resName);
        const urlSuffix = found.url?.toString() || "";
        var target = <string>(urlPrefix + urlSuffix);
        if (urlSuffix && target) {
            opn(target);
        }
        return null;
    }
}