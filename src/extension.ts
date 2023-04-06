// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TerraformCommand } from './common';
import { terraformShellManager } from "./terraformShellManager";
import * as settingUtils from './utils/settingUtils';
import { DialogOption } from "./utils/uiUtils";
import { TerraformCompletionProvider } from './autocomplete/TerraformCompletionProvider';
import { TerraformDefinitionProvider } from './autocomplete/TerraformDefinitionProvider';

const TF_MODE: vscode.DocumentFilter = { language: 'terraform', scheme: 'file' };

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "TencentCloud Terraform" is now active!');

	await settingUtils.checkTerraformInstalled();
	await settingUtils.checkTCCLIInstalled();

	let disposableLogin = vscode.commands.registerCommand('tcTerraform.login', async () => {
		// to-do
		// wait for cloudshell and tccli implement ready
		let accessKey = settingUtils.getSecretIdFromUI()
		let secretKey = settingUtils.getSecretKeyFromUI()

		// process.env.TENCENTCLOUD_SECRET_ID=accessKey;
		// process.env.TENCENTCLOUD_SECRET_KEY=secretKey;

		// console.log("TENCENTCLOUD_SECRET_ID:", process.env.TENCENTCLOUD_SECRET_ID);
		// console.log("TENCENTCLOUD_SECRET_KEY:", process.env.TENCENTCLOUD_SECRET_KEY);

		terraformShellManager.getShell().runNormalCmd("export TENCENTCLOUD_SECRET_ID=" + accessKey);
		terraformShellManager.getShell().runNormalCmd("export TENCENTCLOUD_SECRET_KEY=" + secretKey);
	});

	context.subscriptions.push(disposableLogin);

	context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.init', () => {
		terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Init);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('tcTerraform.plan', () => {
		terraformShellManager.getShell().runTerraformCmd(TerraformCommand.Plan);
	}));

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
		await terraformShellManager.getIntegratedShell().visualize();
	});

	context.subscriptions.push(disposableGraph);

	let disposableTest = vscode.commands.registerCommand('tcTerraform.test', async () => {
		// to-do
	});

	context.subscriptions.push(disposableTest);

	let disposablePush = vscode.commands.registerCommand('tcTerraform.push', async () => {
		// to-do
		// wait for cloudshell implement ready
	});

	context.subscriptions.push(disposablePush);

    console.log('activate the auto complete(snippets and lint) feature');
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, new TerraformCompletionProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(TF_MODE, new TerraformDefinitionProvider()));
}

// This method is called when your extension is deactivated
export function deactivate() { }
