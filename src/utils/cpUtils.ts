/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import * as cp from "child_process";
import { terraformChannel } from "../client/terminal/terraformChannel";

export async function executeCommand(command: string, args: string[], options: cp.SpawnOptions): Promise<string> {
    return new Promise((resolve: (res: string) => void, reject: (e: Error) => void): void => {
        let result: string = "";
        const stripAnsi = require('strip-ansi');
        const childProc: cp.ChildProcess = cp.spawn(command, args, options);

        childProc.stdout.on("data", (raw: string | Buffer) => {
            const data = stripAnsi(raw.toString());
            console.debug("[DEBUG]#### executeCommand received data:[%s]", data);

            result = result.concat(data);
            terraformChannel.append(data);
        });

        childProc.stderr.on("data", (raw: string | Buffer) => {
            const data = stripAnsi(raw.toString());
            console.error("Error found in stderr.on: %s", data);
            terraformChannel.append(data);
        });

        childProc.on("error", (err: any) => {
            console.error("Error found in childProc.on error: %s", err);
            // reject(err);
        });

        childProc.on("close", (code: number) => {
            if (code !== 0) {
                reject(new Error(`Command "${command} ${args.toString()}" failed with exit code "${code}".`));
            } else {
                resolve(result);
            }
        });
    });
}

export async function executeCommandByExec(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cp.exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`child_process exec failed: error:[${error}], stderr:[${stderr}]`);
            } else {
                resolve(stdout);
            }
        });
    });
}
