import * as customerCmd from "./customCmdRegister";
import { regTencentCommands } from "./tencent";
export { tencent } from "./tencent";
export * from "./container";
export * from "./context";
export { cmds } from "./customCmdRegister";

export function registerExternelCommands() {
    regTencentCommands();
    customerCmd.regHelpCommands();
    customerCmd.regResourceRelatedCommands();
}
