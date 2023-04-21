import { commands } from "vscode";

export function registerCommands() {
//   commands.registerCommand(command.TENCENT_LOGIN, user.login);

//   commands.registerCommand(command.TENCENT_LOGINOUT, user.loginOut);
}

export namespace command {
  export const TENCENT_LOGIN = "toolkit.tencent.login";
  /** 退出登录 */
  export const TENCENT_LOGINOUT = "toolkit.tencent.loginout";
}
