import * as customerCmd from "./customCmdRegister";
export { tencent } from "./tencent";
export * from "./container";
export * from "./context";
export { cmds } from "./customCmdRegister";

export function registerCommon() {
    //   registerTencent();
    customerCmd.regHelpCommands();
    customerCmd.regResourceRelatedCommands();
}
