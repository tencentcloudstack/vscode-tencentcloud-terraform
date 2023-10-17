/* eslint-disable @typescript-eslint/naming-convention */
import { commands, env, Uri } from "vscode";
import { terraformShellManager } from "../client/terminal/terraformShellManager";
import { TerraformerRunner } from "../client/runner/terraformerRunner";
import { TerraformRunner } from "../client/runner/terraformRunner";

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
const executeTfImport = TerraformCommand.Import;
const executeTferImport = TerraformerCommand.Import;

export function regHelpCommands() {
    commands.registerCommand(cmds.openURL, function (url: string) {
        env.openExternal(Uri.parse(url));
    });
}

export function regResourceRelatedCommands() {
    commands.registerCommand(cmds.executeTferImport, function (param: any) {
        // terraformShellManager.getShell().runTerraformCmd(importObject);
        terraformShellManager.getIntegratedShell(TerraformerRunner.getInstance()).import(param, param.fileName);
    });

    commands.registerCommand("tcTerraform.plan", function (param: any) {
        // terraformShellManager.getShell().runTerraformCmd(importObject);
        terraformShellManager.getIntegratedShell(TerraformRunner.getInstance()).plan(param);
    });
}

export const cmds = {
    openURL,
    executeTfImport,
    executeTferImport
};
