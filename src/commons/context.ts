/* eslint-disable @typescript-eslint/naming-convention */
import { container } from './container';
import * as vscode from 'vscode';
import * as workspaceUtils from "@/utils/workspaceUtils";
import * as cpUtils from "@/utils/cpUtils";
import * as TelemetryWrapper from "vscode-extension-telemetry-wrapper";

export const Context = Symbol('ExtensionContext');
export const REQUEST_CLIENT_PREFIX = "Terraform-";//Terraform-1.81.61@vscode";
const LATEST_VERSION = "latest";

export function bindExtensionContext(ctx: vscode.ExtensionContext) {
    container.bind(Context).toConstantValue(ctx);
}

export function getExtensionVersion(): string {
    let extension = vscode.extensions.getExtension('Tencent-Cloud.vscode-tencentcloud-terraform');
    let currentVersion = extension.packageJSON.version;
    return currentVersion;
}

export async function genRequestClient(): Promise<string> {
    const extVersion = getExtensionVersion();
    const tfVersion = await getTfVersion() || LATEST_VERSION;
    const reqCli = `${REQUEST_CLIENT_PREFIX}${tfVersion}@vscode-v${extVersion}`;
    return reqCli;
}

export async function getTfVersion(): Promise<string> {
    let tfVersion = '';
    const cwd = workspaceUtils.getActiveEditorPath();
    if (!cwd) {
        TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
        console.error(`can not get path from active editor`);
    }

    await cpUtils.executeCommandByExec("terraform version", cwd).then(output => {
        let match = RegExp(/tencentcloudstack\/tencentcloud (v\d+\.\d+\.\d+)/).exec(output);

        if (match) {
            tfVersion = match[1];
        } else {
            // gives the latest JSON if not tf provider version found
            tfVersion = LATEST_VERSION;
        }
        console.log(`[DEBUG]getTfVersion tf provider version:[${tfVersion}], cwd:[${cwd}]`);
    }).catch(error => {
        console.error(`execute terraform version failed: ${error}`);
    });
    return tfVersion;
}