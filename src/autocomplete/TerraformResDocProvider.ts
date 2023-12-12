import * as vscode from "vscode";
import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import { marked } from 'marked';

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
    private static tempFile: vscode.TextDocument | null = null;

    public static async createOrShow(context: vscode.ExtensionContext, resType: string) {
        // If we already have a panel, clean it.
        if (TerraformResDocProvider.currentProvider) {
            // TerraformResDocProvider.currentProvider._panel.reveal(targetColumn);
            TerraformResDocProvider.currentProvider.dispose();
        }

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        const targetColumn = column + 1;
        // display the definition beside the current editor-begin++++++
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            TerraformResDocProvider.viewType,
            `Doc Definition: ${resType}`,
            targetColumn,
            getWebviewOptions(context.extensionUri),
        );
        // display the definition beside the current editor-end+++++++

        // construct the _panel
        TerraformResDocProvider.currentProvider = new TerraformResDocProvider(panel, context.extensionUri);
        const current = TerraformResDocProvider.currentProvider;
        const docsRoot = path.join(context.extensionPath, 'config', 'docs', 'r');
        const mdResType = resType.replace('tencentcloud_', '');
        const markdownPath = path.join(docsRoot, `${mdResType}.html.markdown`);
        if (!fs.existsSync(markdownPath)) {
            console.error('Can not find the markdownFile: %s', markdownPath);
            TerraformResDocProvider.currentProvider.dispose();
            return;
        }
        const markdownFile = fs.readFileSync(markdownPath, 'utf8');

        let markdown;
        try {
            const cleanedMarkdownFile = markdownFile.replace(/---[\s\S]*?---/, '');
            markdown = marked(cleanedMarkdownFile);
            const htmlMarkdown = htmlTemplate.replace('{{content}}', markdown);
            current._panel.webview.html = htmlMarkdown;
        } catch (error) {
            console.error('Error processing the Markdown file:', error);
            return;
        }
        // Listen for when the panel is disposed
        current._panel.onDidDispose(() => {
            current.dispose();
        }, null, current._disposables);
    }

    dispose() {
        // Close the WebviewPanel
        if (this._panel) {
            this._panel.dispose();
        }
        // Clean up our resources
        TerraformResDocProvider.currentProvider = undefined;
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

const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                font-size: 14px;
                line-height: 1.5;
                word-wrap: break-word;
            }
            h2 {
                font-size: 1.5em;
                font-weight: 600;
                padding-bottom: 0.3em;
                border-bottom: 1px solid #ccc;
                margin-bottom: 1em;
            }
            pre {
                background-color: #333;
                color: #fff; /* Change the font color to white for higher contrast */
                padding: 16px;
                overflow: auto;
                font-size: 100%;
                line-height: 1.45;
                border-radius: 3px;
            }
            pre code.hcl {
                background-color: transparent; /* Set the background color to transparent */
                color: #fff;
            }
            </style>
        </head>
        <body>
            {{content}}
        </body>
        </html>
    `;

