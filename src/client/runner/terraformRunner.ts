/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";

import * as path from "path";
import * as fse from "fs-extra";
import * as vscode from "vscode";
import { BaseRunner } from "./baseRunner";
import { TerraformCommand } from "../../commons/customCmdRegister";
import { terraformShellManager } from "../terminal/terraformShellManager";
import { executeCommand } from "../../utils/cpUtils";
import * as settingUtils from "../../utils/settingUtils";
import { openUrlHintOrNotShowAgain } from "../../utils/uiUtils";


export class TerraformRunner extends BaseRunner {
    private constructor() {
        super();
    }

    private static ins: BaseRunner;

    public static getInstance(): BaseRunner {
        if (!TerraformRunner.ins) {
            TerraformRunner.ins = new TerraformRunner();
        }
        return TerraformRunner.ins;
    }

    public init(): void {
        // throw new Error("Method not implemented.");
    }

    public async executePlan(cwd: string, args: any): Promise<string> {
        console.debug("[DEBUG]#### TerraformRunner executePlan begin.");

        const resAddress = `${args.resource.type}.${args.resource.name}`;

        // reset state
        await this.resetTFState(resAddress);

        terraformShellManager.getIntegratedShell(TerraformRunner.getInstance()).runTerraformCmd(TerraformCommand.Plan);

        return "";
    }

    public async executeShow(cwd: string, args?: any): Promise<string> {
        return await executeCommand(
            "terraform",
            ["show"],
            {
                shell: true,
                cwd,
            }
        );
    }

    public async preImport(cwd: string, args: any, file: string): Promise<{ importArgs: string, tfFile: string }> {
        const fileName = (file === undefined) ? args.resource.type + '.tf' : file;

        const defaultContents = `resource "${args.resource.type}" "${args.resource.name}" {}`;
        const resAddress = `${args.resource.type}.${args.resource.name}`;

        const tfFile: string = path.join(cwd, fileName);

        // reset file
        await this.resetFileContent(tfFile, defaultContents);
        // reset state
        await this.resetTFState(resAddress);

        const importArgs = ['import ', args.resource.type, '.', args.resource.name, ' ', args.resource.id].join('');
        console.debug("[DEBUG]#### import cmd: args=[%s], defaultContents=[%s]", importArgs, defaultContents);
        return { importArgs, tfFile };
    }

    public async executeImport(cwd: string, args?: string): Promise<string> {
        return await executeCommand(
            "terraform",
            [args],
            {
                shell: true,
                cwd,
            }
        );
    }

    /**
     * todo: implement
     * @param cwd 
     * @param args 
     */
    public async postImport(cwd: string, args?: string): Promise<any> {
        console.debug("[DEBUG]#### terraform postImport TODO.");
    }

    public async checkInstalled(): Promise<void> {
        if (settingUtils.isTerminalSetToCloudShell() || !getCheckTerraformCmd()) {
            return;
        }
        try {
            await executeCommand("terraform", ["-v"], { shell: true });
        } catch (error) {
            openUrlHintOrNotShowAgain("Terraform is not installed, please make sure Terraform is in the PATH environment variable.",
                "https://aka.ms/azTerraform-requirement",
                () => {
                    setCheckTerraformCmd(false);
                });
        }
        return;
    }

    private async resetFileContent(tfFile: string, defaultContents: string) {
        if (!fse.existsSync(tfFile)) {
            fse.writeFileSync(tfFile, defaultContents);
        } else {
            await fse.writeFile(tfFile, defaultContents);
        }
    }

    public async resetTFState(resAddress: string) {
        console.debug("[DEBUG]#### TerraformRunner resetTFState begin.");

        await terraformShellManager.getIntegratedShell(TerraformRunner.getInstance())
            .runTerraformCmd(TerraformCommand.State, ['rm', '-lock=false', resAddress]);
    }
}

export function getCheckTerraformCmd(): boolean {
    return vscode.workspace.getConfiguration().get("tcTerraform.checkTerraformCmd");
}

export function setCheckTerraformCmd(checked: boolean): void {
    vscode.workspace.getConfiguration().update("tcTerraform.checkTerraformCmd", checked);
}


