import { localize } from "vscode-nls-i18n";
import { ExtensionContext, workspace, ConfigurationTarget, window, ProgressLocation } from "vscode";

import { container } from "../../container";
import { Context } from "../../context";
import { tree } from "../treeDataProvider";
import { getCredentailByInput } from "./auth";
import { AbstractClient } from "tencentcloud-sdk-nodejs/tencentcloud/common/abstract_client";
import { Credential } from "tencentcloud-sdk-nodejs/tencentcloud/common/interface";
import { LoginProvider } from "../../../views/login/loginExplorer";
import { terraformShellManager } from "../../../client/terminal/terraformShellManager";
import { getStsClient } from "@/connectivity/client";
import { StreamingStatistics } from "tencentcloud-sdk-nodejs/tencentcloud/services/dlc/v20210125/dlc_models";

export namespace user {
    interface UserInfo {
        secretId: string;
        secretKey: string;
        token?: string;
        uin: string;
        subuin?: string;
        type?: string;
        appid?: string;
        region?: string;
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

        // only support aksk way right now
        if (aksk === pick) {
            const credential = await getCredentailByInput();
            const accessKey = credential.secretId;
            const secretKey = credential.secretKey;

            // get configuration
            const config = workspace.getConfiguration();
            // set in vscode configuration(setting.json)
            config.update('tcTerraform.properties.secretId', accessKey, ConfigurationTarget.Global)
                .then(() => {
                }, (error) => {
                    window.showErrorMessage('设置secretId失败: ' + error);
                });
            config.update('tcTerraform.properties.secretKey', secretKey, ConfigurationTarget.Global)
                .then(() => {
                }, (error) => {
                    window.showErrorMessage('设置secretKey失败: ' + error);
                });

            // set in system environment
            process.env.TENCENTCLOUD_SECRET_ID = accessKey;
            process.env.TENCENTCLOUD_SECRET_KEY = secretKey;

            // query user info
            const resp = await (await getStsClient()).GetCallerIdentity({}).
                then(
                    (result) => {
                        console.debug('[DEBUG]--------------------------------result:', result);
                        if (!result) {
                            throw new Error('[Warn] GetCallerIdentity result.TotalCount is 0.');
                        }
                        return result;
                    },
                    (err) => {
                        console.error('[TencentCloudSDKError] GetCallerIdentity got a error from SDK.', err.message);
                        window.showErrorMessage('Login Failed. Reason:' + err.message);
                        return err;
                    }
            );

            // set user info
            let userinfo: UserInfo = {
                secretId: accessKey,
                secretKey: secretKey,
                uin: resp.PrincipalId ?? resp.UserId ?? "-",
                type: resp.Type ?? "unknow"
            };
            setInfo(userinfo);

            // tree.refreshTreeData();
        }
        if (oauth === pick) {
            // to do 
        }
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

    async function loginBySecret(credential: Credential) {
        const client = new AbstractClient(
            "open.test.tencentcloudapi.com",
            "2018-12-25",
            {
                credential,
                profile: {
                    httpProfile: {
                        proxy: "http://9.135.97.58:8899",
                    },
                },
            }
        );
        try {
            const res = await client.request("GetUserAuthInfo", {});

            const { Error: error, ...rest } = res;

            if (error) {
                const err = new Error(error.Message);
                err.stack = JSON.stringify(error);

                return Promise.reject(err);
            }

            return rest;
        } catch (e) {
            throw e;
        }
    }

    async function loginByCredentail() {
        let userInfo: UserInfo | undefined;
        const credential = await getCredentailByInput();

        if (credential) {
            try {
                await window.withProgress(
                    {
                        title: localize("login.title"),
                        location: ProgressLocation.Notification,
                    },
                    async () => {
                        const res = await loginBySecret(credential);
                        if (res) {
                            userInfo = {
                                uin: res.Uin,
                                secretId: credential.secretId,
                                secretKey: credential.secretKey,
                                token: res.token,
                            };
                            setInfo(userInfo);
                        }
                    }
                );
            } catch (error) {
                console.error("loginByCredentail", error);

                const message = error instanceof Error ? `: ${error.message}` : "";
                window.showErrorMessage(localize("login.fail", message));
            }
        }

        return userInfo;
    }

    async function setInfo(info: UserInfo) {
        const { secrets } = container.get<ExtensionContext>(Context);

        await secrets.store(USER_INFO, JSON.stringify(info));
        tree.refreshTreeData();
    }

    export async function getInfo(): Promise<UserInfo | undefined> {
        const { secrets } = container.get<ExtensionContext>(Context);
        const userinfo = await secrets.get(USER_INFO);

        if (userinfo) {
            return JSON.parse(userinfo) as UserInfo;
        }

        return undefined;
    }
}

export default user;
