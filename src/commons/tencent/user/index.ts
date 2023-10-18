import { localize } from "vscode-nls-i18n";
import { ExtensionContext, ProgressLocation, window } from "vscode";
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

    export const AKSK_TITLE = "TcTerraform.AKSK.title";
    export const AKSK_PLACEHOLD = "TcTerraform.AKSK.title.placeholder";
    export const AKSK_EMPTY = "TcTerraform.AKSK.title.verify.empty";

    const USER_INFO = "USER_INFO";

    export async function login() {
        const api = localize(AKSK_TITLE);
        const pick = await window.showQuickPick(["xxxxxxx", api]);

        if (pick) {
            const credential = await getCredentailByInput();
            // api === pick ? await getCredentailByInput() : await getCredentailByQr();
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
