import { ITencentCloudAPI } from "@/commons/tencent/sdkApi";

export class MysqlService implements ITencentCloudAPI {
    describeInstances(params?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getConfig(params?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

}