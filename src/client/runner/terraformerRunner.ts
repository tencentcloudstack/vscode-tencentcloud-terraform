/* eslint-disable @typescript-eslint/naming-convention */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
import * as vscode from "vscode";
import * as settingUtils from "../../utils/settingUtils";
import { executeCommand } from "../../utils/cpUtils";
import { BaseRunner } from "./baseRunner";
import { openUrlHintOrNotShowAgain } from "../../utils/uiUtils";

export const defaultProduct = ["vpc", "subnet", "security_group"];

export enum CommandType {
    Import = "import tencentcloud",
    Plan = "plan tencentcloud",
    Version = "version"
}

export enum FlagType {
    Resources = "-r",
    Filter = "-f",
    Bucket = "-b",
    Excludes = "-x",
    Output = "-O",
    Regions = "--regions",
    State = "-s",
    RetryNum = "-n",
    RetrySleep = "-m",
    Redirect = ">"
}

export interface FlagsMap {
    flag: FlagType;
    value: string;
}

export class TerraformerRunner extends BaseRunner {
    static defaultProduct: any;
    private constructor() {
        super();
    }

    private static ins: BaseRunner;

    public static getInstance(): TerraformerRunner {
        if (!TerraformerRunner.ins) {
            TerraformerRunner.ins = new TerraformerRunner();
        }
        return TerraformerRunner.ins;
    }

    public init(): void {
        // throw new Error("Method not implemented.");
    }


    public async preImport(cwd: string, args?: any, file?: string): Promise<any> {
        console.debug("[DEBUG]#### TerraformerRunner.preImport begin, cwd:[%s], args:[%s], path:[%s]", cwd, args, file);
        return await executeCommand(
            "terraform",
            ["init", "-upgrade"],
            {
                shell: true,
                cwd,
            },
        );
    }

    public async executeImport(cwd: string, args?: string, cmd?: CommandType, flags?: FlagsMap[]): Promise<string> {
        console.debug("[DEBUG]#### TerraformerRunner.executeImport begin, cwd:[%s], args:[%s], cmd:[%s], flags:[%s]", cwd, args, cmd.toString(), flags.toString());
        const exeArgs: string[] = [];
        if (args) {
            exeArgs.push(args);
        }

        if (cmd !== null) {
            exeArgs.push(cmd.toString());
        }

        if (flags) {
            flags.forEach((vv) => {
                exeArgs.push(vv.flag.toString(), vv.value);
            });
        }

        const opExeArgs: string = exeArgs.join(" ");

        console.debug("[DEBUG]#### import exeArgs:[%s]", opExeArgs);

        return await executeCommand(
            "terraformer",
            exeArgs,
            {
                shell: true,
                cwd,
            }
        );
    }

    public async postImport(cwd: string, args?: string): Promise<any> {
        console.debug("[DEBUG]#### TerraformerRunner.postImport begin, cwd:[%s], args:[%s]", cwd, args);
        const exeArgs = args.split(",");

        return await executeCommand(
            "terraformer",
            exeArgs,
            {
                shell: true,
                cwd,
            }
        );
    }

    public async executePlan(cwd: string, args?: string): Promise<string> {
        console.debug("[DEBUG]#### TerraformerRunner not need this step, skip it.");
        return "";
    }

    public async executeShow(cwd: string, args?: string): Promise<string> {
        console.debug("[DEBUG]#### TerraformerRunner not need this step, skip it.");
        return "";
    }

    public async checkInstalled(): Promise<void> {
        if (settingUtils.isTerminalSetToCloudShell() || !getCheckTerraformerCmd()) {
            return;
        }
        try {
            await executeCommand("terraformer", ["-v"], { shell: true });
        } catch (error) {
            openUrlHintOrNotShowAgain("Terraformer is not installed, please make sure Terraformer is in the PATH environment variable.",
                "https://github.com/GoogleCloudPlatform/terraformer",
                () => {
                    setCheckTerraformerCmd(false);
                });
        }
        return;
    }
}

export function getCheckTerraformerCmd(): boolean {
    return vscode.workspace.getConfiguration().get("tcTerraform.checkTerraformerCmd");
}

export function setCheckTerraformerCmd(checked: boolean): void {
    vscode.workspace.getConfiguration().update("tcTerraform.checkTerraformerCmd", checked);
}
