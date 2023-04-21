import * as tencentcloud from "tencentcloud-sdk-nodejs";

export interface ITencentCloudAPI {
    describeInstances(params?: any): Promise<any>;
    getConfig(params?: any): Promise<any>;
}

