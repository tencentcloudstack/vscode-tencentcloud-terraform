import { CompletionItemProvider, TextDocument, Position, CancellationToken, CompletionItem } from "vscode";
import examples from '../../config/snippets/tiat-examples.json';
import * as _ from "lodash";
import * as vscode from "vscode";

export const EXAMPLE_TRIGGER_CHARACTER = '{';
export const EXAMPLE_CMD = "tcTerraform.autocomplete.example";

export class TerraformExampleProvider implements CompletionItemProvider {
    document: TextDocument;
    position: Position;
    token: CancellationToken;
    resourceType: string | null = null;

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        this.document = document;
        this.position = position;
        this.token = token;

        const exampleItems: vscode.CompletionItem[] = [];
        const lineText = document.lineAt(position.line).text;
        const lineTillCurrentPosition = lineText.substring(0, position.character);

        const endwithBrace = lineTillCurrentPosition.endsWith(EXAMPLE_TRIGGER_CHARACTER);
        const includeBrace = lineTillCurrentPosition.indexOf(EXAMPLE_TRIGGER_CHARACTER);

        if (endwithBrace) {
            const resourceType = this.getDefinedResourceTypes(document);
            const res = examples[resourceType];
            const text = res.example;
            let c = new CompletionItem(`Auto complete example: {${resourceType}}`, vscode.CompletionItemKind.Snippet);
            c.detail = "Press `ENTER` to insert example.";
            c.command = {
                title: 'Insert Example',
                command: EXAMPLE_CMD,
                arguments: [text],
            };
            exampleItems.push(c);
        }

        return exampleItems;
    }



    getDefinedResourceTypes(document: TextDocument): string {
        let r = /resource "([a-zA-Z0-9\-_]+)"/;
        let found = "";
        for (let i = 0; i < document.lineCount; i++) {
            let line = document.lineAt(i).text;
            let result = RegExp(r).exec(line);
            if (result && result.length > 1) {
                found = result[1];
                return found;
            }
        }
        return found;
    }
}

export function handleExampleCmd(): (...args: any[]) => any {
    return async (insertText: string) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;
        const line = document.lineAt(position.line);
        const lineRange = new vscode.Range(line.range.start, line.range.end);

        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.replace(document.uri, lineRange, insertText);

        await vscode.workspace.applyEdit(workspaceEdit);

        const newPosition = position.with(position.line, (insertText).length);
        editor.selection = new vscode.Selection(newPosition, newPosition);
    };
}