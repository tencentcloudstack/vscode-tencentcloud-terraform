import { localize } from "vscode-nls-i18n";
import { window, ThemeIcon } from "vscode";
import { container, tencent } from "../../commons";
import { getSecretIdFromEnv, getSecretKeyFromEnv } from "../../utils/settingUtils";
import { user } from "../../commons/tencent/user/index";
import * as loginMgt from "./loginMgt";

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
        if (getSecretIdFromEnv() && getSecretKeyFromEnv() && user.getInfo()) {
            return true;
        }
        return false;
    }

    async getChildren(element?: tencent.tree.TreeItem | undefined): Promise<tencent.tree.TreeItem[]> {
        let items: tencent.tree.TreeItem[] = [];
        if (!element) {
            if (!this.isLoggedIn()) {
                window.showInformationMessage(localize("TcTerraform.login.msg.failed"));
                loginMgt.clearStatusBar();
                return items;
            }

            const info = await user.getInfo();
            if (info) {
                let welcome = new tencent.tree.TreeItem(`Current Account: [${info.uin}](${info.type})`, {
                    iconPath: new ThemeIcon("account"),
                });
                items.push(welcome);
                loginMgt.updateStatusBar();

                let logout = new tencent.tree.TreeItem(localize("TcTerraform.view.logout"), {
                    iconPath: new ThemeIcon("log-out"),
                    command: { command: tencent.command.TENCENT_LOGINOUT, title: "Log Out" },
                });
                items.push(logout);
            }
        }
        return items;
    }

}

container.bind(LoginProvider).toSelf().inSingletonScope();

container.bind(tencent.tree.TencentTreeProvider).toService(LoginProvider);
