// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as settingUtils from "./utils/settingUtils";
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

const TF_MODE: vscode.DocumentFilter = { language: 'terraform', scheme: 'file' };
const COMPATIBLE_MODE: vscode.DocumentFilter = { scheme: 'file' };

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "TencentCloud Terraform" is now active!');
    bindExtensionContext(context);

    await TerraformRunner.getInstance().checkInstalled();
    await TerraformerRunner.getInstance().checkInstalled();

    // terraform cmd
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
    console.log('activate the tips(resource and options) feature');
    const tipsProvider = new TerraformTipsProvider();
    const exampleProvider = new autocomplete.TerraformExampleProvider();
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            tipsProvider.handleCharacterEvent(event);
        })
    );
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, tipsProvider, ...TIPS_TRIGGER_CHARACTER));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(TF_MODE, new TerraformResDocProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, exampleProvider, autocomplete.EXAMPLE_TRIGGER_CHARACTER));

    // example
    console.log('activate the auto complete(example) feature');
    let disposableExample = vscode.commands.registerCommand(autocomplete.EXAMPLE_CMD, autocomplete.handleExampleCmd());
    context.subscriptions.push(disposableExample);

    // import-resource
    console.log('activate the import feature');
    init(context.extensionPath);
    registerExternelCommands();
    registerView();
}



// This method is called when your extension is deactivated
export function deactivate() {
    /* TODO document why this function 'deactivate' is empty */
}
