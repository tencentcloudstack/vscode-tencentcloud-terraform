import * as vscode from "vscode";
import { localize } from "vscode-nls-i18n";

import { container, tencent, cmds } from "../../commons";
import { getSecretIdFromEnv, getSecretKeyFromEnv } from "../../utils/settingUtils";

export class LoginProvider extends tencent.tree.TreeDataProvider {
    private loggedIn = false;

    constructor() {
        super();
        this.loggedIn = false;
    }

    setLoggedIn(value: boolean) {
        this.loggedIn = value;
    }

    isLoggedIn(): boolean {
        if (getSecretIdFromEnv() && getSecretKeyFromEnv()) {
            return true;
        }
        return false;
    }

    async getChildren(element?: tencent.tree.TreeItem | undefined): Promise<tencent.tree.TreeItem[]> {
        if (!element) {
            if (this.isLoggedIn()) {
                return [new tencent.tree.TreeItem(localize("TcTerraform.login.success"))];
            }

            const welcome = [
                // new tencent.tree.TreeItem(localize("TcTerraform.view.login.welcome"))
            ];

            // const info = await user.getInfo();
            // if (info) {
            //     elements.push(
            //         new TreeItem(localize("tencent.loginout", info.uin), {
            //             iconPath: Icons.getIcon("account"),
            //             command: { command: tencent.command.TENCENT_LOGINOUT, title: "" },
            //         })
            //     );
            // }

            return welcome;
        }
        return [];
    }

}

container.bind(LoginProvider).toSelf().inSingletonScope();

container.bind(tencent.tree.TencentTreeProvider).toService(LoginProvider);
