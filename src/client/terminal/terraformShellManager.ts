/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import * as TelemetryWrapper from "vscode-extension-telemetry-wrapper";
import { BaseShell } from "./baseShell";
import { TencentCloudShell } from "./cloudShell";
import { IntegratedShell } from "./integratedShell";
import { isTerminalSetToCloudShell } from "../../utils/settingUtils";
import { TerraformerRunner } from "../runner/terraformerRunner";

export interface ITerraformShellManager {
    getShell(): BaseShell;
    // getCloudShell(): TCCloudShell;
    getIntegratedShell(runner?: any): IntegratedShell;
    dispose(): void;
}

class TerraformShellManager implements ITerraformShellManager {
    private static cloudShell = new TencentCloudShell();
    private static integratedShell: IntegratedShell;

    public getShell(): BaseShell {
        const isCloudShell: boolean = isTerminalSetToCloudShell();

        TelemetryWrapper.addContextProperty("isCloudShell", isCloudShell.toString());
        if (isCloudShell) {
            return TerraformShellManager.cloudShell;
        }
        return TerraformShellManager.integratedShell;
    }

    public getCloudShell(): TencentCloudShell {
        return TerraformShellManager.cloudShell;
    }

    public getIntegratedShell(runner?: any): IntegratedShell {
        if (!TerraformShellManager.integratedShell) {
            if (runner) {
                TerraformShellManager.integratedShell = new IntegratedShell(runner);
            } else {
                // default runner is Terraformer
                TerraformShellManager.integratedShell = new IntegratedShell(TerraformerRunner.getInstance());
            }
        }

        return TerraformShellManager.integratedShell;
    }

    public dispose(): void {
        TerraformShellManager.cloudShell.dispose();
        TerraformShellManager.integratedShell.dispose();
    }
}

export const terraformShellManager: ITerraformShellManager = new TerraformShellManager();
