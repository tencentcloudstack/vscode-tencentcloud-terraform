import { ThemeIcon } from "vscode";
import { localize } from "vscode-nls-i18n";

import { container, tencent, cmds} from "../../commons";
import { Icons } from "../../utils/icons";

const { tree } = tencent;

const { TreeDataProvider, TreeItem } = tree;

export class HelpProvider extends TreeDataProvider {
    async getChildren(element?: tencent.tree.TreeItem | undefined): Promise<tencent.tree.TreeItem[]> {
        if (!element) {
            const elements = [
                new TreeItem(localize("TcTerraform.view.help.provider"), {
                    // iconPath: Icons.getIcon("tools"),
                    command: {
                        command: cmds.openURL,
                        title: "",
                        arguments: ["https://registry.terraform.io/providers/tencentcloudstack/tencentcloud/latest"],
                    },
                }),
                new TreeItem(localize("TcTerraform.view.help.doc"), {
                    // iconPath: Icons.getIcon("book"),
                    command: {
                        command: cmds.openURL,
                        title: "",
                        arguments: ["https://cloud.tencent.com/product/tiat"],
                    },
                }),
                new TreeItem(localize("TcTerraform.view.help.repo"), {
                    // iconPath: Icons.getIcon("github"),
                    command: {
                        command: cmds.openURL,
                        title: "",
                        arguments: ["https://github.com/tencentcloudstack/terraform-provider-tencentcloud"],
                    },
                }),
            ];

            // const info = await user.getInfo();
            // if (info) {
            //     elements.push(
            //         new TreeItem(localize("tencent.loginout", info.uin), {
            //             iconPath: Icons.getIcon("account"),
            //             command: { command: tencent.command.TENCENT_LOGINOUT, title: "" },
            //         })
            //     );
            // }

            return elements;
        }
        return [];
    }
}

container.bind(HelpProvider).toSelf().inSingletonScope();

container.bind(tencent.tree.TencentTreeProvider).toService(HelpProvider);
