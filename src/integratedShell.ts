/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import * as fse from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { commands, Uri, ViewColumn } from "vscode";
import * as TelemetryWrapper from "vscode-extension-telemetry-wrapper";
import { BaseShell } from "./baseShell";
import { Constants } from "./constants";
import { executeCommand } from "./utils/cpUtils";
import { drawGraph } from "./utils/dotUtils";
import { isDotInstalled } from "./utils/dotUtils";
import { selectWorkspaceFolder } from "./utils/workspaceUtils";
import { checkTerraformInstalled } from "./terraformUtils";
import { TerraformCommand } from "./common";
import * as helper from "./utils/helper";
import { command } from "./commons/tencent/commands";
import { promisify } from "util";
import { ChildProcess } from "child_process";
import * as cp from "child_process";

// import stripAnsi from 'strip-ansi';

export class IntegratedShell extends BaseShell {
    private static readonly GRAPH_FILE_NAME = "graph.png";

    // Creates a png of terraform resource graph to visualize the resources under management.
    public async visualize(): Promise<void> {
        if (!await isDotInstalled()) {

            TelemetryWrapper.sendError(Error("dotNotInstalled"));
            return;
        }
        const cwd: string = await selectWorkspaceFolder();
        if (!cwd) {
            TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
            return;
        }
        await this.deletePng(cwd);
        await executeCommand(
            "terraform",
            ["init"],
            {
                shell: true,
                cwd,
            },
        );
        const output: string = await executeCommand(
            "terraform",
            ["graph"],
            {
                shell: true,
                cwd,
            },
        );
        const tmpFile: string = path.join(os.tmpdir(), "terraformgraph.output");
        await fse.writeFile(tmpFile, output);
        await drawGraph(cwd, tmpFile);
        await commands.executeCommand("vscode.open", Uri.file(path.join(cwd, IntegratedShell.GRAPH_FILE_NAME)), ViewColumn.Two);
    }

    public async import(params: any, file?: string): Promise<void> {
        // const fileName = "cvm.tf";
        await checkTerraformInstalled();

        const cwd: string = await selectWorkspaceFolder();
        if (!cwd) {
            TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
            return;
        }

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

        const importRet: string = await executeCommand(
            "terraform",
            [importArgs],
            {
                shell: true,
                cwd,
            },
        );

        // await this.runTerraformCmd("terraform " + importArgs);

        const content: string =
            await executeCommand(
                "terraform",
                ["show"],
                {
                    shell: true,
                    cwd,
                }
            );

        console.debug("[DEBUG]#### import content:[%s]", content);
        fse.writeFileSync(tfFile, content);

        vscode.window.showInformationMessage(`The resource:[${params.resource.type}] has been imported successfully, generated tf file:[${tfFile}].`);
        await commands.executeCommand("vscode.open", Uri.file(tfFile), ViewColumn.Active || ViewColumn.One);
    }

    private async resetFileContent(tfFile: string, defaultContents: string) {
        if (!fse.existsSync(tfFile)) {
            fse.writeFileSync(tfFile, defaultContents);
        } else {
            await fse.writeFile(tfFile, defaultContents);
        }
    }

    private async resetTFState(resAddress: string) {
        // const runFunc = () => this.runTerraformCmdWithoutTerminal(TerraformCommand.State, ['rm', '-lock=false', resAddress]);
        // await helper.retryF(runFunc);

        await this.runTerraformCmd(TerraformCommand.State, ['rm', '-lock=false', resAddress]);
    }

    public async runTerraformCmdWithoutTerminal(tfCommand: string, args?: string[]) {
        const cmd = [tfCommand, ...(args || [])].join(' ');
        const { stdout, stderr } = await promisify(cp.exec)(cmd);
        return { stdout, stderr };
    }

    public async runTerraformCmd(tfCommand: string, args?: string[]) {
        this.checkCreateTerminal();
        this.terminal.show();

        // const cmd= [tfCommand, args.values].join(' ');
        let tmp: string[] = [tfCommand];
        args.forEach((arg) => tmp.push(arg));
        const cmd = tmp.join(' ');
        this.terminal.sendText(cmd);
    }

    public async runNormalCmd(tfCommand: string, newLine = true) {
        this.checkCreateTerminal();
        this.terminal.show();
        this.terminal.sendText(tfCommand, newLine);
    }

    protected initShellInternal() {
        vscode.window.onDidCloseTerminal((terminal) => {
            if (terminal === this.terminal) {
                this.dispose();
            }
        });
    }

    private async deletePng(cwd: string): Promise<void> {
        const graphPath: string = path.join(cwd, IntegratedShell.GRAPH_FILE_NAME);
        if (await fse.pathExists(graphPath)) {
            await fse.remove(graphPath);
        }
    }

    private async deleteFile(cwd, file: string): Promise<void> {
        const filePath: string = path.join(cwd, file);
        if (await fse.pathExists(filePath)) {
            await fse.remove(filePath);
        }
    }

    private checkCreateTerminal(): void {
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal(Constants.TerraformTerminalName);
        }
    }
}
