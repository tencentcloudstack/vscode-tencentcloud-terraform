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
import { TerraformCommand } from "./commons/commands";
import * as helper from "./utils/helper";
import { command } from "./commons/tencent/commands";
import { promisify } from "util";
import { ChildProcess } from "child_process";
import * as cp from "child_process";
import { TerraformerRunner, CommandType, FlagType, FlagsMap } from "./utils/terraformerRunner";
import { values } from "lodash";

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

        const runner = TerraformerRunner.getInstance();// terraform or terraformer

        await runner.checkInstalled();

        const cwd: string = await selectWorkspaceFolder();
        if (!cwd) {
            TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
            return;
        }

        const cmd = CommandType.Import;
        const flags: FlagsMap[] = [
            {
                flag: FlagType.Resources,
                value: ["mysql", "vpc", "subnet", "security_group"].join(",")
            },
            {
                flag: FlagType.Filter,
                value: ["tencentcloud_mysql_instance", "cdb-fitq5t9h"].join("=")
            },
            {
                flag: FlagType.Regions,
                value: "ap-guangzhou"
            },
            {
                flag: FlagType.Redirect,
                value: "terraformer_default_result"
            },
        ];

        console.debug("[DEBUG]#### Executing import command. cwd:[%s], cmd:[%s], flags:[%s]", cwd, cmd.toString, flags.toString);
        const result = await runner.executeImport(cwd, "", cmd, flags);
        console.debug("[DEBUG]#### Executed import command. result:[%s]", result);



        const content: string = await runner.executeShow(cwd);


        const tfFile: string = result;

        vscode.window.showInformationMessage(`The resource:[${params.resource.type}] has been imported successfully, generated tf file:[${tfFile}].`);

        await commands.executeCommand("vscode.open", Uri.file(tfFile), ViewColumn.Active || ViewColumn.One);
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
