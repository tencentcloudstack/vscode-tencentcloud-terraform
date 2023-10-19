import { localize } from "vscode-nls-i18n";
import { ExtensionContext, workspace, ConfigurationTarget, window } from "vscode";
import { terraformShellManager } from "../../../client/terminal/terraformShellManager";
import { AbstractClient } from "tencentcloud-sdk-nodejs/tencentcloud/common/abstract_client";
import { Credential } from "tencentcloud-sdk-nodejs/tencentcloud/common/interface";

import { container } from "../../container";
import { Context } from "../../context";
import { tree } from "../treeDataProvider";
import { getCredentailByInput } from "./auth";

export namespace user {
    interface UserInfo {
        secretId: string;
        secretKey: string;
        token?: string;
        uin: string;
    }

    export const AKSK_TITLE = "TcTerraform.pickup.aksk";
    export const OAUTH_TITLE = "TcTerraform.pickup.oauth";
    export const AKSK_PLACEHOLD = "TcTerraform.pickup.aksk.placeholder";
    export const AKSK_EMPTY = "TcTerraform.pickup.aksk.verify.empty";

    const USER_INFO = "USER_INFO";

    export async function login() {
        const aksk = localize(AKSK_TITLE);
        const oauth = localize(OAUTH_TITLE);
        const pick = await window.showQuickPick([aksk, oauth]);

        if (aksk === pick) {
            const credential = await getCredentailByInput();
            const accessKey = credential.secretId;
            const secretKey = credential.secretKey;

            // get configuration
            const config = workspace.getConfiguration();
            // set in vscode configuration(setting.json)
            config.update('tcTerraform.properties.secretId', accessKey, ConfigurationTarget.Global)
                .then(() => {
                    window.showInformationMessage('设置secretId成功');
                }, (error) => {
                    window.showErrorMessage('设置secretId失败: ' + error);
                });
            config.update('tcTerraform.properties.secretKey', secretKey, ConfigurationTarget.Global)
                .then(() => {
                    window.showInformationMessage('设置secretKey成功');
                }, (error) => {
                    window.showErrorMessage('设置secretKey失败: ' + error);
                });

            // set in system environment
            process.env.TENCENTCLOUD_SECRET_ID = accessKey;
            process.env.TENCENTCLOUD_SECRET_KEY = secretKey;

            tree.refreshTreeData();
            window.showInformationMessage(localize("TcTerraform.login.success"));
        }
    }

    export async function getInfo(): Promise<UserInfo | undefined> {
        const { secrets } = container.get<ExtensionContext>(Context);
        const userinfo = await secrets.get(USER_INFO);

        if (userinfo) {
            return JSON.parse(userinfo) as UserInfo;
        }

        return undefined;
    }

    export async function loginOut() {
        const yes = localize("common.yes");
        const action = await window.showWarningMessage(
            localize("tencent.loginout.title"),
            {
                modal: true,
                detail: localize("tencent.loginout.detail"),
            },
            yes
        );
        if (action !== yes) {
            return;
        }

        const { secrets } = container.get<ExtensionContext>(Context);
        await secrets.delete(USER_INFO);

        tree.refreshTreeData();
    }
}

export default user;
