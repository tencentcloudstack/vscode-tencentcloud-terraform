import { commands, env, Uri } from "vscode";
import { terraformShellManager } from "../terraformShellManager";
import { TerraformCommand } from '../common';

const openURL = "tcTerraform.openurl";
const executeImport = TerraformCommand.Import;

export function registerHelpCommands() {
    commands.registerCommand(openURL, function (url: string) {
        env.openExternal(Uri.parse(url));
    });
}

export function registerResourceCommands() {
    commands.registerCommand(executeImport, function (param: any) {
        // terraformShellManager.getShell().runTerraformCmd(importObject);
        terraformShellManager.getIntegratedShell().import(param, param.fileName);
    });
}

export const cmds = {
    openURL,
    executeImport,
};
