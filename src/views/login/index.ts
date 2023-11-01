import { window } from "vscode";

import { container } from "../../commons/container";
import { LoginProvider } from "./loginExplorer";

export function registerLogin() {
    window.registerTreeDataProvider("tcTerraform.loginExplorer", container.get(LoginProvider));
}