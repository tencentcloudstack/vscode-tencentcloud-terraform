"use strict";

import * as vscode from "vscode";
import * as client from "../connectivity/client";
import { Instance } from "tencentcloud-sdk-nodejs-cvm/tencentcloud/services/cvm/v20170312/cvm_models";
import { ITencentCloudAPI } from "../commons/tencent/sdkApi";
import { error } from "console";


export class CvmService implements ITencentCloudAPI {
    async getConfig(params?: any): Promise<any> {
        return {
            'resource': {
                'name': "tencentcloud_instance",
                //'xxx': "yyy"
            },
            'import': {
                'filename': 'cvm.tf'
            }
        };
    }

    async describeInstances(params?: any): Promise<Instance[]> {
        const res = await (await client.getCvmClient()).DescribeInstances({
            // find all instances   
        }).then(
            (result) => {
                console.debug('[DEBUG]--------------------------------result:', result);
                if (result.TotalCount === 0) {
                    throw new Error('[Warn] DescribeInstances result.TotalCount is 0.');
                }
                return result.InstanceSet;
            },
            (err) => {
                console.error('[Error] DescribeInstances got a error from SDK.', err.message);
                return err;
            }
        );

        return res;
    }



}

// export async function describeInstances(params:any): Promise<Instance[]> {
//     const res = await (await client.getCvmClient()).DescribeInstances({}).then(result => {
//         console.warn('--------------------------------result:', result);
//         if (result.TotalCount === 0) {
//             throw new Error('[Warn] DescribeInstances result.TotalCount is 0.');
//         }

//         return result.InstanceSet;
//     }).catch((error) => {
//         console.error(error);
//         return error;
//     });

//     return res;
// }
