"use strict";

import * as vscode from "vscode";
import { Client as CvmClient } from "tencentcloud-sdk-nodejs-cvm/tencentcloud/services/cvm/v20170312/cvm_client";
import { Client as TkeClient } from "tencentcloud-sdk-nodejs-tke/tencentcloud/services/tke/v20180525/tke_client";
import { localize } from "vscode-nls-i18n";
import * as utils from "../utils/settingUtils";

const tkeClient = TkeClient;
const cvmClient = CvmClient;

export async function getTkeClient(): Promise<TkeClient> {
    const secretId = process.env.TENCENTCLOUD_SECRET_ID;
    const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null) {
        vscode.window.showErrorMessage("Cannot find TENCENTCLOUD_SECRET_ID and TENCENTCLOUD_SECRET_KEY, please set them first!");
        return null;
    }

    return new tkeClient({
        credential: {
            secretId: process.env.TENCENTCLOUD_SECRET_ID,
            secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
        },
        region: (process.env.TENCENTCLOUD_REGION === undefined) ?
            "ap-guangzhou" : process.env.TENCENTCLOUD_REGION,
        profile: {
            signMethod: "TC3-HMAC-SHA256", // 签名方法
            httpProfile: {
                reqMethod: "POST", // 请求方法
                reqTimeout: 30, // 请求超时时间，默认60s
            },
        },
    });
}

export async function getCvmClient(region?: string): Promise<CvmClient> {
    const config = vscode.workspace.getConfiguration();
    const secretIdConfig = utils.getSecretIdFromUI();
    const secretKeyConfig = utils.getSecretKeyFromUI();
    const secretIdEnv = utils.getSecretIdFromEnv();
    const secretKeyEnv = utils.getSecretKeyFromEnv();

    const secretId = (secretIdEnv === undefined) ? secretIdConfig : secretIdEnv;
    const secretKey = (secretKeyEnv === undefined) ? secretKeyConfig : secretKeyEnv;

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null) {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        vscode.window.showErrorMessage(msg);
        return null;
    }

    return new CvmClient({
        credential: {
            secretId: secretId,
            secretKey: secretKey,
        },
        // 产品地域
        region: (process.env.TENCENTCLOUD_REGION === undefined) ?
            "ap-guangzhou" : process.env.TENCENTCLOUD_REGION,
        // 可选配置实例
        profile: {
            // signMethod: "TC3-HMAC-SHA256", // 签名方法
            httpProfile: {
                reqMethod: "POST", // 请求方法
                // reqTimeout: 60, // 请求超时时间，默认60s
                endpoint: "cvm.tencentcloudapi.com",
            },
        },
    })
}
