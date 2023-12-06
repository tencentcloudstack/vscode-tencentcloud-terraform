import * as vscode from 'vscode';
import { exec } from 'child_process';
import path from 'path';
import * as fs from 'fs';
import * as workspaceUtils from "./workspaceUtils";

export class GitUtils {
    private static instance: GitUtils;

    public static getInstance(): GitUtils {
        if (!GitUtils.instance) {
            GitUtils.instance = new GitUtils();
        }
        return GitUtils.instance;
    }

    public async submitToGit(): Promise<any> {
        console.debug("[DEBUG]#### GitUtils submitToGit begin.");
        const activeDocumentPath = workspaceUtils.getActiveEditorPath();
        const gitRootPath = path.dirname(activeDocumentPath);
        if (!gitRootPath) {
            vscode.window.showErrorMessage('Please open a workspace folder first!');
            return;
        }

        if (fs.existsSync(path.join(gitRootPath, '.git'))) {
            vscode.window.showInformationMessage('Trying to fetch from Git, please wait...');
            await this.fetchFromGit(gitRootPath);
        } else {
            vscode.window.showInformationMessage(`You are not in a git repository yet, trying to clone from your Git repo...`);
            await this.cloneFromGit(gitRootPath);
        }

        console.debug("[DEBUG]#### GitUtils pushToGit begin.");
        try {
            const output = await this.gitPush(gitRootPath);
            vscode.window.showInformationMessage(`Code has been successfully submitted to Git repo!\nDetail:[${output}]`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to submit code: ${error.message}`);
        }
    }

    private async cloneFromGit(rootPath: string): Promise<any> {
        console.debug("[DEBUG]#### GitUtils cloneFromGit begin.");
        await vscode.window.showInputBox({ prompt: 'Please enter the Git repository URL:' }).then(async (url) => {
            if (url) {
                const folderName = url.split('/').pop()?.replace('.git', '');
                const clonePath = rootPath ? `${rootPath}/${folderName}` : folderName || '';
                if (fs.existsSync(clonePath)) {
                    console.debug("[DEBUG]#### GitUtils cloneFromGit: clean and remove the clonePath before cloning the repository.");
                    fs.rm(clonePath, { recursive: true }, () => { });
                }

                console.debug("[DEBUG]#### GitUtils cloneFromGit exec:[git clone %s %s].", url, clonePath);
                exec(`git clone ${url} ${clonePath}`, {}, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Failed to clone code: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        vscode.window.showErrorMessage(`Failed to clone code: ${stderr}`);
                        return;
                    }
                    vscode.window.showInformationMessage('Code has been successfully cloned from Git repo!');
                });
            }
        });
    }

    private gitPush(rootPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec('git add . && git commit -m "committed by VS Code" && git push', { cwd: rootPath }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stdout) {
                    resolve(stdout);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                }
            });
        });
    }

    private gitPull(rootPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            exec('git pull', { cwd: rootPath }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }
                resolve();
            });
        });
    }

    private async fetchFromGit(rootPath: string): Promise<any> {
        console.debug("[DEBUG]#### GitUtils fetchFromGit begin.");
        try {
            await this.gitPull(rootPath);
            vscode.window.showInformationMessage('Code has been successfully fetched from Git repo!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch code: ${error.message}`);
        }
    }

}


