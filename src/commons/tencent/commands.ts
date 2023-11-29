import { commands } from "vscode";
import user from "./user";

export function registerLoginCmds() {
    commands.registerCommand(command.TENCENT_LOGIN, user.login);

    commands.registerCommand(command.TENCENT_LOGINOUT, user.loginOut);

}

export namespace command {
    // login command
    export const TENCENT_LOGIN = "tcTerraform.login";
    // logout command
    export const TENCENT_LOGINOUT = "tcTerraform.logout";
}
