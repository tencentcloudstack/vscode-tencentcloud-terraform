import axios from "axios";
import { window } from "vscode";
import { join } from "path";
import { Credential } from "tencentcloud-sdk-nodejs/tencentcloud/common/interface";

const LOGIN_SERVER = "https://test.ide.cloud.tencent.com";

const client = axios.create({
    baseURL: LOGIN_SERVER,
    proxy: {
        protocol: "http",
        host: "9.135.97.58",
        port: 8899,
    },
});

function getQrState() {
    return client.get("/api/public/qcloud/oauth/qrcode").then((res) => {
        return res.data.data;
    });
}

function getQrUrl(state: string) {
    return `${LOGIN_SERVER}/api/public/qcloud/oauth/scan?state=${state}`;
}

type State = "WAITING" | "SCANNED" | "OK";
function getState(state: string): Promise<State> {
    return client
        .get("/api/public/qcloud/oauth/status", {
            params: {
                state,
            },
        })
        .then((res) => res.data.data)
        .catch((err) => {
            return "WAITING";
        });
}

type TokenInfo = {
    scope: string;
    appId: string;
    requestId: string;
    userAccessToken: string;
    userOpenId: string;
    expiresAt: string;
    userRefreshToken: string;
    userUnionId: string;
};

function getTokenInfo(state: string): Promise<TokenInfo> {
    return client
        .get("/api/public/qcloud/oauth/token", { params: { state } })
        .then((res) => res.data.data);
}

interface CredentialsType {
    credentials: {
        token: string;
        tmpSecretId: string;
        tmpSecretKey: string;
    };
    expiredTime: string;
}

function getSecret(
    userAccessToken: string,
    duration = 7200 * 24
): Promise<CredentialsType> {
    return client
        .get("/api/public/qcloud/oauth/federationToken", {
            params: { userAccessToken, duration },
        })
        .then((res) => res.data.data);
}

function refreshToken(userRefreshToken: string, userOpenId: string) {
    return client
        .get("/api/public/qcloud/oauth/refreshToken", {
            params: { userRefreshToken, userOpenId },
        })
        .then((res) => res.data.data);
}

export async function getCredentailByQr() {
    const stateCode = await getQrState();
    const qrUrl = getQrUrl(stateCode);

    const terminal = window.createTerminal({
        name: "登录腾讯云",
        shellPath: join(__dirname, "bin/qrcode.js"),
        shellArgs: [qrUrl],
        isTransient: true,
    });
    terminal.show();

    let state: State = "WAITING";

    while (state !== "OK") {
        // await delay(500);
        const newState = await getState(stateCode);

        if (state !== "SCANNED" && newState === "SCANNED") {
            terminal.sendText("已扫码,等待授权... \n", true);
        }

        state = newState;
    }

    terminal.sendText("授权成功 \n", true);
    terminal.dispose();

    const u = await getTokenInfo(stateCode);

    const {
        credentials: { token, tmpSecretId, tmpSecretKey },
    } = await getSecret(u.userAccessToken);

    return {
        token,
        secretId: tmpSecretId,
        secretKey: tmpSecretKey,
    };
}
