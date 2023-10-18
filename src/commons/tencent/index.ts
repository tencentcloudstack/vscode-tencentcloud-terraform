import { commands } from "vscode";
import { registerLoginCmds, command as _command } from "./commands";

import _user from "./user";
import _tree from "./treeDataProvider";

export async function regTencentCommands() {
    registerLoginCmds();
    await initialization();
}

async function initialization() {
    commands.executeCommand(
        "setContext",
        "TcTerraform.login",
        !!(await _user.getInfo())
    );
}

export namespace tencent {
    export import user = _user;
    export import tree = _tree;
    export import command = _command;
}
