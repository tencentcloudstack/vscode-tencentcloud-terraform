import { injectable } from "inversify";
import {
    window,
    Event,
    EventEmitter,
    TreeDataProvider as BaseTreeDataProvider,
    TreeItem as BaseTreeItem,
} from "vscode";
import { container } from "../container";
import { localize } from "vscode-nls-i18n";

export namespace tree {
    export const TencentTreeProvider = Symbol("TencentTreeProvider");

    export function refreshTreeData() {
        const treeDataProvider =
            container.getAll<TreeDataProvider>(TencentTreeProvider);

        treeDataProvider.map((item) => item.refresh());
        window.showInformationMessage(localize("TcTerraform.refresh.success"));
    }

    // @ts-ignore
    @injectable()
    export abstract class TreeDataProvider
        implements BaseTreeDataProvider<TreeItem>
    {
        private _onDidChangeTreeData: EventEmitter<TreeItem | undefined> =
            new EventEmitter<TreeItem | undefined>();

        readonly onDidChangeTreeData: Event<TreeItem | undefined> =
            this._onDidChangeTreeData.event;

        refresh(): void {
            this._onDidChangeTreeData.fire(undefined);
        }

        getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
            return element;
        }

        async getChildren(element?: TreeItem | undefined): Promise<TreeItem[]> {
            //   if (!element && (await user.getInfo())) {
            if (!element) {
                return [new TreeItem("暂无数据")];
            }
            return [];
        }
    }

    export type TreeItemType = Omit<TreeItem, "label">;

    export class TreeItem extends BaseTreeItem {
        constructor(public readonly label: string, params: TreeItemType = {}) {
            super(label);

            Object.entries(params).forEach(([k, v]) => {
                // @ts-ignore
                this[k] = v;
            });
        }
    }
}
export default tree;
