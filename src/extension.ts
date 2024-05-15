// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { init } from "vscode-nls-i18n";
import { TerraformCommand, TerraformerCommand } from "./commons/customCmdRegister";
import { terraformShellManager } from "./client/terminal/terraformShellManager";
import { DialogOption } from "./utils/uiUtils";
import { TerraformTipsProvider, TIPS_TRIGGER_CHARACTER } from './autocomplete/TerraformTipsProvider';
import { TerraformResDocProvider } from './autocomplete/TerraformResDocProvider';
import { registerExternelCommands, bindExtensionContext } from './commons';
import { registerView } from './views';
import { TerraformRunner } from './client/runner/terraformRunner';
import { TerraformerRunner } from './client/runner/terraformerRunner';
import { GitUtils } from './utils/gitUtils';
import _ from 'lodash';
import * as autocomplete from './autocomplete/TerraformExampleProvider';
import * as loginMgt from './views/login/loginMgt';
import * as context from './commons/context';
import { Constants } from './commons/constants';
import user from "@/commons/tencent/user/index";

const TF_MODE: vscode.DocumentFilter = { language: 'terraform', scheme: 'file' };
const COMPATIBLE_MODE: vscode.DocumentFilter = { scheme: 'file' };

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "TencentCloud Terraform" is now active!');
    bindExtensionContext(context);

    await TerraformRunner.getInstance().checkInstalled();
    await TerraformerRunner.getInstance().checkInstalled();

    // set request client for all of Terminal
    await setRequestClientOnTerminal();
    // terraform cmd
    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.apply', async () => {
        (await terraformShellManager.getShell()).runTerraformCmd(TerraformCommand.Apply);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.refresh', async () => {
        (await terraformShellManager.getShell()).runTerraformCmd(TerraformCommand.Refresh);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.destroy', async () => {
        (await terraformShellManager.getShell()).runTerraformCmd(TerraformCommand.Destroy);
    }));

    // git operations
    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.git.push', async () => {
        if (_.isEmpty(vscode.workspace.workspaceFolders)) {
            vscode.window.showInformationMessage("Please open a workspace in VS Code first.");
            return;
        }
        await GitUtils.getInstance().submitToGit();
    }));

    // terraformer cmd
    let disposableTferImport = vscode.commands.registerCommand('tcTerraformer.import', async () => {
        (await terraformShellManager.getShell()).runTerraformCmd(TerraformerCommand.Import);
    });

    context.subscriptions.push(disposableTferImport);

    let disposableTferPlan = vscode.commands.registerCommand('tcTerraformer.plan', async () => {
        (await terraformShellManager.getShell()).runTerraformCmd(TerraformerCommand.Plan);
    });

    context.subscriptions.push(disposableTferPlan);

    // auto-complete
    console.log('activate the auto-complete(resource and argument) feature');
    const exampleProvider = new autocomplete.TerraformExampleProvider();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, exampleProvider, autocomplete.EXAMPLE_TRIGGER_CHARACTER));

    // tips
    console.log('activate the tips(options and doc) feature');
    const tipsProvider = new TerraformTipsProvider(context.extensionPath);
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            tipsProvider.handleCharacterEvent(event);
        })
    );
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, tipsProvider, ...TIPS_TRIGGER_CHARACTER));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.doc.show', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // no editor opening
        }

        // get the words under current selection
        const doc = editor.document;
        const selection = editor.selection;
        const words = doc.getWordRangeAtPosition(selection.start);
        const resType = doc.getText(words);

        const regex = /^tencentcloud(?:_[^\s]+)*$/;
        if (!regex.test(resType)) {
            return; // not match the regex
        }
        TerraformResDocProvider.createOrShow(context, resType);
    }));

    // example
    console.log('activate the auto complete(example) feature');
    let disposableExample = vscode.commands.registerCommand(autocomplete.EXAMPLE_CMD, autocomplete.handleExampleCmd());
    context.subscriptions.push(disposableExample);

    // import-resource
    console.log('activate the import feature');
    init(context.extensionPath);
    registerExternelCommands();
    registerView();

    // reg login status
    let disposableLoginStatusBar = loginMgt.createStatusBar();
    context.subscriptions.push(disposableLoginStatusBar);

}

async function setRequestClientOnTerminal() {
    const config = vscode.workspace.getConfiguration('terminal.integrated.env');
    const os = getOSPlatform();
    const curConfig = config[os] || {};

    const reqCli = await context.genRequestClient();
    const updatedConfig = { ...curConfig, [Constants.REQUEST_CLIENT]: reqCli }; // set ReqCli for all Terminal

    await config.update(os, updatedConfig, vscode.ConfigurationTarget.Global);
}

function getOSPlatform(): string {
    const platform = process.platform;
    switch (platform) {
        case 'win32':
            return 'windows';
        case 'darwin':
            return 'osx';
        case 'linux':
        default:
            return 'linux';
    }
}

// This method is called when your extension is deactivated
export async function deactivate() {
    await user.clearInfo();
}
