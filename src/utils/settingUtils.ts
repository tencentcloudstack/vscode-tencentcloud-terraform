/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import * as cpUtils from "./cpUtils";
import * as uiUtils from "./uiUtils";

export function isTerminalSetToCloudShell(): boolean {
    return vscode.workspace.getConfiguration().get("tcTerraform.terminal") === "cloudshell";
}

export function getSyncFileBlobPattern(): vscode.GlobPattern {
    return vscode.workspace.getConfiguration().get("tcTerraform.files");
}

export function getPathForTest(): string {
    return vscode.workspace.getConfiguration().get("tcTerraform.test.path");
}

export function getSecretIdCmd(): string {
    return vscode.workspace.getConfiguration().get("tcTerraform.secretid.cmd");
}

export function getSecretKeyCmd(): string {
    return vscode.workspace.getConfiguration().get("tcTerraform.secretkey.cmd");
}

export function getSecretIdFromUI(): string {
    return vscode.workspace.getConfiguration().get("tcTerraform.secretid");
}

export function getSecretKeyFromUI(): string {
    return vscode.workspace.getConfiguration().get("tcTerraform.secretkey");
}

export function getCheckTCCLI(): boolean {
    return vscode.workspace.getConfiguration().get("tcTerraform.checkTCCLI");
}

export function setCheckTCCLI(checked: boolean): void {
    vscode.workspace.getConfiguration().update("tcTerraform.checkTCCLI", checked);
}

export async function checkTCCLIInstalled(): Promise<void> {
    if (isTerminalSetToCloudShell() || !getCheckTCCLI()) {
        return;
    }
    try {
        await cpUtils.executeCommand("tccli", ["help"], { shell: true });
    } catch (error) {
        uiUtils.openUrlHintOrNotShowAgain("TCCLI is not installed, please install it before use extension.",
            "https://www.tencentcloud.com/document/product/1013/33464",
            () => {
                // setCheckTerraformCmd(false);
            });
    }
}

// export function getSecretId(): Promise<void> {
//     if (isTerminalSetToCloudShell() || !checkTCCLIInstalled()) {
//         return;
//     }
//     let cmd=getSecretIdCmd();

//     try {
//         cpUtils.executeCommand(cmd, null, { shell: true });
//     } catch (error) {
//         uiUtils.openUrlHintOrNotShowAgain("Get Secret Id failed, please check your `tcTerraform.secretid.cmd` in setting.json.",
//             "./setting.json",
//             () => {
//                 vscode.window.showErrorMessage("Get Secret Id failed, please check your `tcTerraform.secretid.cmd` in setting.json.")
//             });
//     }
// }

// export function getSecretKey(): Promise<void> {
//     if (isTerminalSetToCloudShell() || !checkTCCLIInstalled()) {
//         return;
//     }
//     let cmd=getSecretIdCmd();

//     try {
//         cpUtils.executeCommand(cmd, null, { shell: true });
//     } catch (error) {
//         uiUtils.openUrlHintOrNotShowAgain("Get Secret Id failed, please check your `tcTerraform.secretid.cmd` in setting.json.",
//             "./setting.json",
//             () => {
//                 vscode.window.showErrorMessage("Get Secret Id failed, please check your `tcTerraform.secretid.cmd` in setting.json.")
//             });
//     }
// }
