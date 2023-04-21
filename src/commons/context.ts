import { container } from './container';
import * as vscode from 'vscode';

export const Context = Symbol('ExtensionContext');

export function bindExtensionContext(ctx: vscode.ExtensionContext) {
    container.bind(Context).toConstantValue(ctx);
}