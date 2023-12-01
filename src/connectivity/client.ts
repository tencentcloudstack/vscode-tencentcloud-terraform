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
    const [secretId, secretKey, region] = settingUtils.getAKSKandRegion();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null || secretId === '' || secretKey === '') {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        console.error(msg); 
        return null;
    }

    return new TkeClient({
        credential: {
            secretId: secretId,
            secretKey: secretKey,
        },
        region: region ?? "ap-guangzhou",
        profile: {
            signMethod: "TC3-HMAC-SHA256", // 签名方法
            httpProfile: {
                reqMethod: "POST", // 请求方法
                reqTimeout: 30, // 请求超时时间，默认60s
            },
        },
    });
}

export async function getCvmClient(): Promise<CvmClient> {
    const [secretId, secretKey, region] = settingUtils.getAKSKandRegion();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null || secretId === '' || secretKey === '') {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        console.error(msg); 
        return null;
    }

    return new CvmClient({
        credential: {
            secretId: secretId,
            secretKey: secretKey,
        },
        // 产品地域
        region: region ?? "ap-guangzhou",
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

export async function getCommonClient(): Promise<AbstractClient> {
    const [secretId, secretKey, region] = settingUtils.getAKSKandRegion();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null || secretId === '' || secretKey === '') {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        console.error(msg);
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

export async function getStsClient(): Promise<StsClient> {
    const [secretId, secretKey, region] = settingUtils.getAKSKandRegion();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null || secretId === '' || secretKey === '') {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        console.error(msg);
        return null;
    }

    return new StsClient({
        credential: {
            secretId: secretId,
            secretKey: secretKey,
        },
        region: region ?? "ap-guangzhou",
    });
}

export async function getCamClient(): Promise<CamClient> {
    const [secretId, secretKey, region] = settingUtils.getAKSKandRegion();

    if (secretId === undefined || secretKey === undefined || secretId === null || secretKey === null || secretId === '' || secretKey === '') {
        let msg = localize("TcTerraform.msg.aksk.notfound");
        console.error(msg);
        return null;
    }

    return new CamClient({
        credential: {
            secretId: secretId,
            secretKey: secretKey,
        },
        region: region ?? "ap-guangzhou",
    });
}
