import * as command from "./commands";
export { tencent } from "./tencent";
export * from "./container";
export * from "./context";
export {cmds} from "./commands";

export function registerCommon() {
    //   registerTencent();
    command.registerHelpCommands();
    command.registerResourceCommands();
}
