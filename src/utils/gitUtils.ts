import * as vscode from 'vscode';
import { exec } from 'child_process';
import path from 'path';
import * as fs from 'fs';

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
        const gitRootPath = vscode.workspace.rootPath;
        if (!gitRootPath) {
            vscode.window.showErrorMessage('Please open a workspace folder first!');
            return;
        }

        while (true) {
            if (fs.existsSync(path.join(gitRootPath, '.git'))) {
                vscode.window.showInformationMessage('Trying to fetch from Git, please wait...');
                await this.fetchFromGit();
                break;
            } else {
                vscode.window.showInformationMessage(`You are not in a git repository yet, trying to clone from your Git repo...`);
                await this.cloneFromGit();
                // retry
            }
        }

        exec('git add . && git commit -m "committed by VS Code" && git push', { cwd: gitRootPath }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to submit code: ${error.message}`);
                return;
            }
            if (stderr) {
                vscode.window.showErrorMessage(`Failed to submit code: ${stderr}`);
                return;
            }
            vscode.window.showInformationMessage('Code has been successfully submitted to Git repo!');
        });
        return;
    }

    private async cloneFromGit(): Promise<any> {
        console.debug("[DEBUG]#### GitUtils cloneFromGit begin.");
        await vscode.window.showInputBox({ prompt: 'Please enter the Git repository URL:' }).then((url) => {
            if (url) {
                const folderName = url.split('/').pop()?.replace('.git', '');
                const clonePath = vscode.workspace.rootPath ? `${vscode.workspace.rootPath}/${folderName}` : folderName || '';
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
        return;
    }

    private async fetchFromGit(): Promise<any> {
        console.debug("[DEBUG]#### GitUtils fetchFromGit begin.");
        const gitRootPath = vscode.workspace.rootPath;
        exec('git pull', { cwd: gitRootPath }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to fetch code: ${error.message}`);
                return;
            }
            if (stderr) {
                vscode.window.showErrorMessage(`Failed to fetch code: ${stderr}`);
                return;
            }
            vscode.window.showInformationMessage('Code has been successfully fetched from Git repo!');
        });
    }

}


