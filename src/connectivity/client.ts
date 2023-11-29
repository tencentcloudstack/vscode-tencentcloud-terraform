/* eslint-disable @typescript-eslint/naming-convention */
"use strict";

import * as vscode from "vscode";
import { Client as CvmClient } from "tencentcloud-sdk-nodejs-cvm/tencentcloud/services/cvm/v20170312/cvm_client";
import { Client as TkeClient } from "tencentcloud-sdk-nodejs-tke/tencentcloud/services/tke/v20180525/tke_client";
import { Client as StsClient } from "tencentcloud-sdk-nodejs-sts/tencentcloud/services/sts/v20180813/sts_client";
import { Client as CamClient } from "tencentcloud-sdk-nodejs-cam/tencentcloud/services/cam/v20190116/cam_client";
import { AbstractClient } from "tencentcloud-sdk-nodejs/tencentcloud/common/abstract_client";
import * as tencentcloud from "tencentcloud-sdk-nodejs";
import { localize } from "vscode-nls-i18n";
import * as settingUtils from "../utils/settingUtils";


export async function getTkeClient(): Promise<TkeClient> {
    const secretId = process.env.TENCENTCLOUD_SECRET_ID;
    const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null) {
        vscode.window.showErrorMessage("Cannot find TENCENTCLOUD_SECRET_ID and TENCENTCLOUD_SECRET_KEY, please set them first!");
        return null;
    }

    return new TkeClient({
        credential: {
            secretId: process.env.TENCENTCLOUD_SECRET_ID,
            secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
        },
        region: process.env.TENCENTCLOUD_REGION ?? "ap-guangzhou",
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
    // const secretIdConfig = utils.getSecretIdFromUI();
    // const secretKeyConfig = utils.getSecretKeyFromUI();
    // const secretIdEnv = utils.getSecretIdFromEnv();
    // const secretKeyEnv = utils.getSecretKeyFromEnv();

    // const secretId = (secretIdEnv === undefined) ? secretIdConfig : secretIdEnv;
    // const secretKey = (secretKeyEnv === undefined) ? secretKeyConfig : secretKeyEnv;
    const [secretId, secretKey] = settingUtils.getAKSK();

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
        region: process.env.TENCENTCLOUD_REGION ?? "ap-guangzhou",
        // 可选配置实例
        profile: {
            // signMethod: "TC3-HMAC-SHA256", // 签名方法
            httpProfile: {
                reqMethod: "POST", // 请求方法
                // reqTimeout: 60, // 请求超时时间，默认60s
                endpoint: "cvm.tencentcloudapi.com",
            },
        },
    });
}

export async function getCommonClient(region?: string): Promise<AbstractClient> {
    const [secretId, secretKey] = settingUtils.getAKSK();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null) {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        vscode.window.showErrorMessage(msg);
        return null;
    }

    const client = new AbstractClient(
        "open.test.tencentcloudapi.com",
        "2018-12-25",
        {
            credential: {
                secretId: secretId,
                secretKey: secretKey,
            },
            profile: {
                httpProfile: {
                    proxy: "http://9.135.97.58:8899",
                },
            },
        }
    );

    return client;
}

export async function getStsClient(region?: string): Promise<StsClient> {
    const [secretId, secretKey] = settingUtils.getAKSK();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null) {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        vscode.window.showErrorMessage(msg);
        return null;
    }

    return new StsClient({
        credential: {
            secretId: secretId,
            secretKey: secretKey,
        },
        region: process.env.TENCENTCLOUD_REGION ?? "ap-guangzhou",
    });
}

export async function getCamClient(region?: string): Promise<CamClient> {
    const [secretId, secretKey] = settingUtils.getAKSK();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null) {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        vscode.window.showErrorMessage(msg);
        return null;
    }

    return new CamClient({
        credential: {
            secretId: secretId,
            secretKey: secretKey,
        },
        region: process.env.TENCENTCLOUD_REGION ?? "ap-guangzhou",
    });
}
