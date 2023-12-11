import * as vscode from "vscode";
import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import { marked } from 'marked';
import { dispose } from "vscode-extension-telemetry-wrapper";

export class TerraformResDocProvider {
    // public provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Definition {
    //     const words = document.getWordRangeAtPosition(position);
    //     const resName = document.getText(words);

    //     const found = _.get(resources, resName);
    //     const urlSuffix = found.url?.toString() || "";
    //     var target = <string>(urlPrefix + urlSuffix);
    //     if (urlSuffix && target) {
    //         opn(target);
    //     }
    //     return null;
    // }

    public static currentProvider: TerraformResDocProvider | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    public static readonly viewType = 'tcTerraform.doc.show.id';

    public static async createOrShow(context: vscode.ExtensionContext, resType: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;


        const targetColumn = column + 1;
        const rightEditor = vscode.window.visibleTextEditors.find((editor) => editor.viewColumn === targetColumn);

        let newEditor = rightEditor;

        if (!newEditor) {
            // new editor to the right of the current editor
            const tempFile = await vscode.workspace.openTextDocument({ content: '', language: 'plaintext' });
            newEditor = await vscode.window.showTextDocument(tempFile, { viewColumn: targetColumn, preview: false });
        }

        // If we already have a panel, show it.
        if (TerraformResDocProvider.currentProvider) {
            // TerraformResDocProvider.currentProvider._panel.reveal(targetColumn);
            TerraformResDocProvider.currentProvider.dispose();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            TerraformResDocProvider.viewType,
            `Doc Definition: ${resType}`,
            newEditor.viewColumn,
            getWebviewOptions(context.extensionUri),
        );
        // construct the _panel
        TerraformResDocProvider.currentProvider = new TerraformResDocProvider(panel, context.extensionUri);
        const current = TerraformResDocProvider.currentProvider;
        const docsRoot = path.join(context.extensionPath, 'config', 'docs', 'r');
        const mdResType = resType.replace('tencentcloud_', '');
        const markdownPath = path.join(docsRoot, `${mdResType}.html.markdown`);
        if (!fs.existsSync(markdownPath)) {
            console.error('Can not find the markdownFile: %s', markdownPath);
            return;
        }
        const markdownFile = fs.readFileSync(markdownPath, 'utf8');

        let markdown;
        try {
            const cleanedMarkdownFile = markdownFile.replace(/---[\s\S]*?---/, '');
            markdown = marked(cleanedMarkdownFile);
            current._panel.webview.html = markdown;
        } catch (error) {
            console.error('Error processing the Markdown file:', error);
            return;
        }
        // Listen for when the panel is disposed
        current._panel.onDidDispose(() => current.dispose(), null, current._disposables);
    }

    dispose() {
        TerraformResDocProvider.currentProvider = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    public constructor(panel?: vscode.WebviewPanel, extensionUri?: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
    }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    };
}

