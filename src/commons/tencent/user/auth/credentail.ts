import MultiStepInput from "../../../multiStepInput";
import { Credential } from "tencentcloud-sdk-nodejs/tencentcloud/common/interface";
import { localize } from "vscode-nls-i18n";
import constant from "../index";

export async function getCredentailByInput() {
    const title = localize(constant.AKSK_TITLE);
    async function collectInputs() {
        const state = {} as Partial<Credential>;
        await MultiStepInput.run((input) => inputSecretId(input, state));
        return state as Required<Omit<Credential, "token">>;
    }

    async function inputSecretId(
        input: MultiStepInput,
        state: Partial<Credential>
    ) {
        state.secretId = await input.showInputBox({
            title,
            step: 1,
            totalSteps: 2,
            value: state.secretId || "",
            placeholder: localize(constant.AKSK_PLACEHOLD, "SecretId"),
            validate: validateInput.bind({ key: "SecretId " }),
        });
        return (input: MultiStepInput) => inpuSecretKey(input, state);
    }

    async function inpuSecretKey(
        input: MultiStepInput,
        state: Partial<Credential>
    ) {
        state.secretKey = await input.showInputBox({
            title,
            step: 2,
            totalSteps: 2,
            value: state.secretKey || "",
            placeholder: localize(constant.AKSK_PLACEHOLD, "SecretKey"),
            validate: validateInput.bind({ key: "SecretKey " }),
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
