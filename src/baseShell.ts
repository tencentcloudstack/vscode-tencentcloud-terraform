/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import * as vscode from "vscode";
import { terraformChannel } from "./terraformChannel";

export abstract class BaseShell {

    public terminal: vscode.Terminal | undefined;

    constructor() {
        this.initShellInternal();
    }

    public abstract runTerraformCmd(tfCommand: string): void;

    public abstract runNormalCmd(tfCommand: string, newLine?: boolean): void;

    // public abstract runTerraformTests(testType: string, workingDirectory: string);

    public dispose(): void {
        terraformChannel.appendLine(`Terraform terminal: ${this.terminal.name} closed`);
        this.terminal.dispose();
        this.terminal = undefined;
    }

    protected abstract initShellInternal(): void;
}
