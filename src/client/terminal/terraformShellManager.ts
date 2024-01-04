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
import * as context from "../../commons/context";
import * as settingUtils from "../../utils/settingUtils";
import { Constants } from "../../commons/constants";

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
            return this.getCloudShell();
        }
        return this.getIntegratedShell();
    }

    public getCloudShell(): TencentCloudShell {
        return TerraformShellManager.cloudShell;
    }

    public getIntegratedShell(runner?: any): IntegratedShell {
        if (!TerraformShellManager.integratedShell) {
            // set TencentCloud AKSK, Region and Client info
            const [ak, sk, region] = settingUtils.getAKSKandRegion();
            const tfEnv = {
                [Constants.REQUEST_CLIENT]: context.genRequestClient(),
                [Constants.TENCENTCLOUD_SECRET_ID]: ak,
                [Constants.TENCENTCLOUD_SECRET_KEY]: sk,
                [Constants.TENCENTCLOUD_REGION]: region,
            };
            // default runner is Terraformer
            TerraformShellManager.integratedShell = new IntegratedShell(TerraformerRunner.getInstance(), tfEnv);
            // specify runner
            if (runner) {
                TerraformShellManager.integratedShell = new IntegratedShell(runner, tfEnv);
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
