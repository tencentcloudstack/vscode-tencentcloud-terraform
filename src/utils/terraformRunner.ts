/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";

import * as path from "path";
import * as fse from "fs-extra";
import * as vscode from "vscode";
import { executeCommand } from "./cpUtils";
import { BaseRunner } from "./baseRunner";
import { TerraformCommand } from "../commons/commands";
import { terraformShellManager } from "../terraformShellManager";
import * as settingUtils from "./settingUtils";
import { openUrlHintOrNotShowAgain } from "./uiUtils";


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

    public async executeShow(cwd: string, args?: string): Promise<string> {
        return await executeCommand(
            "terraform",
            ["show"],
            {
                shell: true,
                cwd,
            }
        );
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

    public async preImport(cwd: string, params: any, file: string): Promise<{ importArgs: string, tfFile: string }> {
        const fileName = (file === undefined) ? params.resource.type + '.tf' : file;

        const defaultContents = `resource "${params.resource.type}" "${params.resource.name}" {}`;
        const resAddress = `${params.resource.type}.${params.resource.name}`;

        const tfFile: string = path.join(cwd, fileName);

        // reset file
        await this.resetFileContent(tfFile, defaultContents);
        // reset state
        await this.resetTFState(resAddress);

        const importArgs = ['import ', params.resource.type, '.', params.resource.name, ' ', params.resource.id].join('');
        console.debug("[DEBUG]#### import cmd: args=[%s], defaultContents=[%s]", importArgs, defaultContents);
        return { importArgs, tfFile };
    }


    private async resetFileContent(tfFile: string, defaultContents: string) {
        if (!fse.existsSync(tfFile)) {
            fse.writeFileSync(tfFile, defaultContents);
        } else {
            await fse.writeFile(tfFile, defaultContents);
        }
    }

    private async resetTFState(resAddress: string) {
        await terraformShellManager.getIntegratedShell().runTerraformCmd(TerraformCommand.State, ['rm', '-lock=false', resAddress]);
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
}

export function getCheckTerraformCmd(): boolean {
    return vscode.workspace.getConfiguration().get("tcTerraform.checkTerraformCmd");
}

export function setCheckTerraformCmd(checked: boolean): void {
    vscode.workspace.getConfiguration().update("tcTerraform.checkTerraformCmd", checked);
}


