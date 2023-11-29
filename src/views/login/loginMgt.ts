import * as vscode from "vscode";
import { user } from "../../commons/tencent/user/index";
import { localize } from "vscode-nls-i18n";

let myStatusBarItem: vscode.StatusBarItem;
const TENCENT_LOGIN_STATUS = 'tcTerraform.login.status';

export async function updateStatusBar(): Promise<void> {
    const info = await user.getInfo();
    if (info) {
        myStatusBarItem.text = localize("TcTerraform.title") + `: [${info.uin}](${info.type})`;
        myStatusBarItem.show();
    } else {
        myStatusBarItem.hide();
    }
}

export function createStatusBar(): vscode.StatusBarItem {
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.command = TENCENT_LOGIN_STATUS;
    return myStatusBarItem;
}