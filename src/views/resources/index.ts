import { window } from "vscode";

import { container } from "../../commons/container";
import { CvmResProvider, TkeResProvider } from "./resExplorer";

export function registerResources() {
    // window.registerTreeDataProvider("tcTerraform.resourcesExplorer", container.get(CvmResProvider));
    window.registerTreeDataProvider("tcTerraform.resourcesExplorer.cvm", container.get(CvmResProvider));
    window.registerTreeDataProvider("tcTerraform.resourcesExplorer.tke", container.get(TkeResProvider));
}