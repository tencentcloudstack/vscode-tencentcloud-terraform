import { commands, env, Uri } from "vscode";
import { terraformShellManager } from "../terraformShellManager";

"use strict";

export enum TerraformCommand {
    Init = "terraform init",
    Plan = "terraform plan",
    Apply = "terraform apply",
    Import = "terraform import",
    Refresh = "terraform refresh",
    Destroy = "terraform destroy",
    Validate = "terraform validate",
    Show = "terraform show",
    State = "terraform state"
}

export enum TerraformerCommand {
    Plan = "terraformer plan",
    Import = "terraformer import"
}

export enum TcCliCommand {
    Login = "tccli configure",
    Service = "tccli service",
}


const openURL = "tcTerraform.openurl";
// const executeImport = TerraformCommand.Import;
const executeImport = TerraformerCommand.Import;

export function registerHelpCommands() {
    commands.registerCommand(cmds.openURL, function (url: string) {
        env.openExternal(Uri.parse(url));
    });
}

export function registerResourceCommands() {
    commands.registerCommand(cmds.executeImport, function (param: any) {
        // terraformShellManager.getShell().runTerraformCmd(importObject);
        terraformShellManager.getIntegratedShell().import(param, param.fileName);
    });
}

export const cmds = {
    openURL,
    executeImport,
};
