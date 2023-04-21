import { window } from "vscode";

import { container } from "../../commons/container";
import { HelpProvider } from "./helpExplorer";

export function registerHelp() {
  window.registerTreeDataProvider("tcTerraform.helpExplorer", container.get(HelpProvider));
}