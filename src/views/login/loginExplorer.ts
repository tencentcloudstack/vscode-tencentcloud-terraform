import { localize } from "vscode-nls-i18n";
import { window } from "vscode";
import { container, tencent, cmds } from "../../commons";
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
        if (getSecretIdFromEnv() && getSecretKeyFromEnv()) {
            return true;
        }
        return false;
    }

    async getChildren(element?: tencent.tree.TreeItem | undefined): Promise<tencent.tree.TreeItem[]> {
        let welcome: tencent.tree.TreeItem[] = [];
        if (!element) {
            if (!this.isLoggedIn()) {
                window.showInformationMessage(localize("TcTerraform.login.failed"));
                return welcome;
            }

            const info = await user.getInfo();
            if (info) {
                welcome.push(new tencent.tree.TreeItem(
                    `Welcome to use ` + localize("TcTerraform.title"),
                    new tencent.tree.TreeItem(
                        `Current Account: [${info.uin}](${info.type})`
                    )
                ));
                loginMgt.updateStatusBar();
            }
        }
        return welcome;
    }

}

container.bind(LoginProvider).toSelf().inSingletonScope();

container.bind(tencent.tree.TencentTreeProvider).toService(LoginProvider);
