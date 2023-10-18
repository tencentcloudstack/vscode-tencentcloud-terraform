// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as settingUtils from "./utils/settingUtils";
import { init } from "vscode-nls-i18n";
import { TerraformCommand, TerraformerCommand } from "./commons/customCmdRegister";
import { terraformShellManager } from "./client/terminal/terraformShellManager";
import { DialogOption } from "./utils/uiUtils";
import { TerraformCompletionProvider } from './autocomplete/TerraformCompletionProvider';
import { TerraformDefinitionProvider } from './autocomplete/TerraformDefinitionProvider';
import { registerExternelCommands } from './commons';
import { registerView } from './views';
import { TerraformRunner } from './client/runner/terraformRunner';
import { TerraformerRunner } from './client/runner/terraformerRunner';
import { GitUtils } from './utils/gitUtils';
import _ from 'lodash';

const TF_MODE: vscode.DocumentFilter = { language: 'terraform', scheme: 'file' };

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "TencentCloud Terraform" is now active!');

    await TerraformRunner.getInstance().checkInstalled();
    await TerraformerRunner.getInstance().checkInstalled();

    // let disposableLogin = vscode.commands.registerCommand('tcTerraform.login', async () => {
    //     // to-do
    //     // wait for cloudshell and tccli implement ready
    //     let accessKey = settingUtils.getSecretIdFromUI();
    //     let secretKey = settingUtils.getSecretKeyFromUI();

    //     terraformShellManager.getShell().runNormalCmd("export TENCENTCLOUD_SECRET_ID=" + accessKey);
    //     terraformShellManager.getShell().runNormalCmd("export TENCENTCLOUD_SECRET_KEY=" + secretKey);
    // });

    // context.subscriptions.push(disposableLogin);
    // terraform cmd
    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.init', () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Init);
    }));

    // move plan to customCmdRegister
    // context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.plan', () => {
    //     await terraformShellManager.getIntegratedShell(TerraformRunner.getInstance()).plan();

    // }));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.apply', () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Apply);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.import', () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Import);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.validate', () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Validate);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.refresh', () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Refresh);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.destroy', () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Destroy);
    }));

    let disposableGraph = vscode.commands.registerCommand('tcTerraform.visualize', async () => {
        if (settingUtils.isTerminalSetToCloudShell()) {
            const choice: vscode.MessageItem = await vscode.window.showInformationMessage(
                "Visualization only works locally. Would you like to run it in the integrated terminal?",
                DialogOption.ok,
                DialogOption.cancel,
            );
            if (choice === DialogOption.cancel) {
                return;
            }
        }
        await terraformShellManager.getIntegratedShell(TerraformRunner.getInstance()).visualize();
    });

    context.subscriptions.push(disposableGraph);

    let disposableTest = vscode.commands.registerCommand('tcTerraform.test', async () => {
        // to-do
    });

    context.subscriptions.push(disposableTest);

    // git operations
    let disposablePush = vscode.commands.registerCommand('tcTerraform.git.push', async () => {
        if (_.isEmpty(vscode.workspace.workspaceFolders)) {
            vscode.window.showInformationMessage("Please open a workspace in VS Code first.");
            return;
        }
        await GitUtils.getInstance().submitToGit();
    });

    context.subscriptions.push(disposablePush);

    // terraformer cmd
    let disposableTferImport = vscode.commands.registerCommand('tcTerraformer.import', async () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformerCommand.Import);
    });

    context.subscriptions.push(disposableTferImport);

    let disposableTferPlan = vscode.commands.registerCommand('tcTerraformer.plan', async () => {
        terraformShellManager.getShell().runTerraformCmd(TerraformerCommand.Plan);
    });

    context.subscriptions.push(disposableTferPlan);

    // auto-complete
    console.log('activate the auto complete(snippets and lint) feature');
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, new TerraformCompletionProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(TF_MODE, new TerraformDefinitionProvider()));

    // import-resource
    console.log('activate the import feature');
    init(context.extensionPath);
    registerExternelCommands();
    registerView();
}

// This method is called when your extension is deactivated
export function deactivate() { }
