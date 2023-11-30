import { inject } from "inversify";
import { ThemeIcon, TreeItem, TreeItemCollapsibleState, window } from "vscode";
import { readFile } from "fs/promises";
import { join } from "path";
import * as vscode from "vscode";

import { container, tencent, cmds } from "../../commons";
import { res, IApiDoc } from "../../commons/tencent/types";
import { Icons } from "../../utils/icons";
import { CvmService } from "../../import/cvm";

export const defaultResourceName = "foo";

export class CvmResProvider extends tencent.tree.TreeDataProvider {
    private icons: { [key: string]: any };

    async getChildren(element?: tencent.tree.TreeItem | undefined): Promise<tencent.tree.TreeItem[]> {
        if (!element) {
            try {
                // TODO: replace with specified resource type
                const service = new CvmService();
                const instances = await service.describeInstances();
                const config = await service.getConfig();

                const items: tencent.tree.TreeItem[] = Array.isArray(instances)
                    ? instances.map(instance => ({
                        label: `${instance.InstanceName}(${instance.InstanceId})`,
                        id: instance.InstanceId,
                        // iconPath: Icons.getIcon("book"),
                        command: {
                            command: cmds.executeTferImport,
                            title: "",
                            arguments: [{
                                resource: {
                                    type: config.resource.name,
                                    name: defaultResourceName,
                                    id: instance.InstanceId
                                },
                                product: config.product,
                                fileName: config.import.file,
                                this: config
                            }],
                        },
                    }))
                    : [];// return [] if instances nil

                return items;
            } catch (error) {
                console.error('[Error]#### getChildren got a error:[%s] from CvmService. stack:%s', error.message, error.stack);
                return error;
            }

        } else {
            if ("getChildren" in element) {
                return (element as ParentItem).getChildren(element);
            }
        }

        return [];
    }

    private async getFontIcons() {
        return readFile(join(__dirname, "../package.json")).then((buff) => {
            const { icons } = JSON.parse(buff.toString()).contributes;
            this.icons = icons;
        });
    }

    private async getIcon(name: string): Promise<ThemeIcon> {
        const iconName = `${name}-icon`;

        return Icons.getIcon(this.icons[iconName] ? iconName : "default-icon");
    }
}

export class TkeResProvider extends tencent.tree.TreeDataProvider {
    private icons: { [key: string]: any };
    // vscode.window.showInformationMessage(`TkeResProvider is called`);

    async getChildren(element?: tencent.tree.TreeItem | undefined): Promise<tencent.tree.TreeItem[]> {
        vscode.window.showInformationMessage(`TkeResProvider is called`);

        return [];
    }
}

class ResourcesItem extends tencent.tree.TreeItem {
    constructor(private action: res.ActionSet, _iconPath: ThemeIcon) {
        // action.icon = iconPath.id;
        super(action.actionName, {
            command: {
                command: "OPEN_API_DOC",
                arguments: [action],
                title: "",
            },
        });
    }
}

interface ParentItem {
    getChildren(element: tencent.tree.TreeItem): Promise<tencent.tree.TreeItem[]>;
}

container.bind(CvmResProvider).toSelf().inSingletonScope();

container.bind(tencent.tree.TencentTreeProvider).toService(CvmResProvider);
