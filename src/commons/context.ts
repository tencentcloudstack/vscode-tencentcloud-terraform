import { container } from './container';
import * as vscode from 'vscode';

export const Context = Symbol('ExtensionContext');
export const REQUEST_CLIENT_PREFIX = "Terraform-Vscode-";//Terraform-1.81.61@vscode";

export function bindExtensionContext(ctx: vscode.ExtensionContext) {
    container.bind(Context).toConstantValue(ctx);
}

export function getExtensionVersion(): string {
    let extension = vscode.extensions.getExtension('Tencent-Cloud.vscode-tencentcloud-terraform');
    let currentVersion = extension.packageJSON.version;
    return currentVersion;
}

export function genRequestClient(): string {
    const currentVersion = getExtensionVersion();
    const reqCli = `${REQUEST_CLIENT_PREFIX}v${currentVersion}`;
    return reqCli;
}