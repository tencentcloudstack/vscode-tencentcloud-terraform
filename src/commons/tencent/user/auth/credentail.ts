import MultiStepInput from "../../../multiStepInput";
import { Credential } from "tencentcloud-sdk-nodejs/tencentcloud/common/interface";
import { localize } from "vscode-nls-i18n";
import constant from "../index";
import * as vscode from "vscode";

export async function getCredentailByInput() {
    const defaultRegion = "ap-guangzhou";
    const title = localize(constant.AKSK_TITLE);
    const regionTitle = localize("TcTerraform.pickup.region");
    async function collectInputs() {
        const state = {} as Partial<Credential> & { region: string };
        await MultiStepInput.run((input) => inputSecretId(input, state));
        // return state as Required<Omit<Credential, "token">>;
        return state as Required<Omit<Credential, "token">> & { region: string };
    }

    async function inputSecretId(
        input: MultiStepInput,
        state: Partial<Credential> & { region: string }
    ) {
        state.secretId = await input.showInputBox({
            title,
            step: 1,
            totalSteps: 3,
            value: state.secretId || "",
            placeholder: localize(constant.AKSK_PLACEHOLD, "SecretId"),
            validate: validateInput.bind({ key: "SecretId " }),
        });
        return (input: MultiStepInput) => inpuSecretKey(input, state);
    }

    async function inpuSecretKey(
        input: MultiStepInput,
        state: Partial<Credential> & { region: string }
    ) {
        state.secretKey = await input.showInputBox({
            title,
            step: 2,
            totalSteps: 3,
            value: state.secretKey || "",
            placeholder: localize(constant.AKSK_PLACEHOLD, "SecretKey"),
            validate: validateInput.bind({ key: "SecretKey " }),
        });
        return (input: MultiStepInput) => inpuRegion(input, state);
    }

    async function inpuRegion(
        input: MultiStepInput,
        state: Partial<Credential> & { region: string }
    ) {

        state.region = await input.showInputBox({
            title: regionTitle,
            step: 3,
            totalSteps: 3,
            value: state.region || "",
            placeholder: defaultRegion,
            prompt: "Input Region",
            validate: validateInput.bind({ key: "Region " }),
        });

    }

    async function validateInput(this: { key: string }, value: string) {
        if (!value) {
            return Promise.reject(localize(constant.AKSK_EMPTY, this.key));
        }

        return undefined;
    }

    return collectInputs();
}
