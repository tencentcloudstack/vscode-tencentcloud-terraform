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
import { Constants } from "../../commons/constants";
import { executeCommand } from "../../utils/cpUtils";
import { drawGraph } from "../../utils/dotUtils";
import { isDotInstalled } from "../../utils/dotUtils";
import { selectWorkspaceFolder } from "../../utils/workspaceUtils";
import { promisify } from "util";
import * as cp from "child_process";
import { BaseRunner } from "../runner/baseRunner";
import { TerraformerRunner, CommandType, FlagType, FlagsMap, defaultProduct } from "../../client/runner/terraformerRunner";
import { TerraformRunner } from "../runner/terraformRunner";

// import stripAnsi from 'strip-ansi';

export class IntegratedShell extends BaseShell {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly GRAPH_FILE_NAME = "graph.png";
    private readonly runner: BaseRunner;

    constructor(rr: BaseRunner) {
        super();
        // terraform or terraformer?
        this.runner = rr;
    }

    // Creates a png of terraform resource graph to visualize the resources under management.
    public async visualize(): Promise<void> {
        console.debug("[DEBUG]#### IntegratedShell visualize begin.");

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

    // import a existed resource into terraform
    public async import(params: any, file?: string): Promise<void> {
        console.debug("[DEBUG]#### IntegratedShell import begin.");

        // const runner = TerraformerRunner.getInstance();
        await this.runner.checkInstalled();

        const cwd: string = await selectWorkspaceFolder();
        if (!cwd) {
            TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
            return;
        }

        const preRet = await this.runner.preImport(cwd, params);
        console.debug("[DEBUG]#### Executed pre-import. result:[%s]", preRet);

        const resource = defaultProduct;
        if (!defaultProduct.includes(params.product)) {
            resource.push(params.product);
        }

        const cmd = CommandType.Import;
        const flags: FlagsMap[] = [
            {
                flag: FlagType.Resources,
                value: resource.join(",")
            },
            {
                flag: FlagType.Filter,
                value: [params.resource.type, params.resource.id].join("=")
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

        const importRet = await this.runner.executeImport(cwd, "", cmd, flags);
        console.debug("[DEBUG]#### Executed import command. result:[%s]", importRet);

        // terraform state replace-provider registry.terraform.io/-/tencentcloud tencentcloudstack/tencentcloud
        const args = "";
        const postRet = await this.runner.postImport(cwd, args);

        const content: string = await this.runner.executeShow(cwd);

        const tfFile: string = importRet;

        vscode.window.showInformationMessage(`The resource:[${params.resource.type}] has been imported successfully, generated tf file:[${tfFile}].`);

        await commands.executeCommand("vscode.open", Uri.file(tfFile), ViewColumn.Active || ViewColumn.One);
    }

    // run terraform init command
    public async init(params?: any): Promise<void> {
        console.debug("[DEBUG]#### IntegratedShell init begin. params:[%v]", params);

        await this.runner.checkInstalled();
        if (this.runner instanceof TerraformRunner) {

            const cwd: string = await selectWorkspaceFolder();
            if (!cwd) {
                TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
                return;
            }

            const result = await this.runner.init();
            console.debug("[DEBUG]#### Executed init. result:[%s]", result);
        }
    }

    // run terraform plan command
    public async plan(params: any): Promise<void> {
        console.debug("[DEBUG]#### IntegratedShell plan begin. params:[%v]", params);

        await this.runner.checkInstalled();
        if (this.runner instanceof TerraformRunner) {

            const cwd: string = await selectWorkspaceFolder();
            if (!cwd) {
                TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
                return;
            }

            const result = await this.runner.executePlan(cwd, params);
            console.debug("[DEBUG]#### Executed plan. result:[%s]", result);
        }
    }

    // run terraform push command
    public async push(params: any): Promise<void> {
        console.debug("[DEBUG]#### IntegratedShell push begin. params:[%v]", params);


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

        const tmp: string[] = [tfCommand];
        if (args) {
            args.forEach((arg) => tmp.push(arg));
        }
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
