import * as vscode from "vscode";
import { user } from "../../commons/tencent/user/index";
import { localize } from "vscode-nls-i18n";

let myStatusBarItem: vscode.StatusBarItem;

export async function updateStatusBar(): Promise<void> {
    const info = await user.getInfo();
    if (info) {
        myStatusBarItem.text = localize("TcTerraform.title") + ` / APPID: ${info.appid}`;
        myStatusBarItem.tooltip =
            `User Details:
Uin: [${info.uin}]
User type: [${info.type}]
Region: [${info.region}]
Arn: [${info.arn}]`;
        myStatusBarItem.show();
    } else {
        myStatusBarItem.hide();
    }
}

export function clearStatusBar() {
    myStatusBarItem.hide();
}

export function createStatusBar(): vscode.StatusBarItem {
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.hoverBackground");
    // myStatusBarItem.command = TENCENT_LOGIN_STATUS;
    return myStatusBarItem;
}