'use strict';

import { Function } from "lodash";
import { Func } from "mocha";

export async function retryF(func: () => Promise<{ stdout: string, stderr: string }>): Promise<void> {
    const command = "terraform state rm tencentcloud_instance.foo";
    const maxRetry = 3;
    let retryCount = 1;

    while (true) {
        try {
            const result = await func();
            console.log(result.stdout);

            // retry "Error acquiring the state lock"
            if (/Error acquiring the state lock/.test(result.stderr)) {
                if (retryCount < maxRetry) {
                    retryCount++;
                    console.log(`Retrying (${retryCount}/${maxRetry})...`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // wait for 5 seconds before retrying
                    continue;
                } else {
                    console.warn("[WARN]#### Max retry count reached.");
                    return;
                }
            }
            if (/Invalid target address/.test(result.stderr) || /read-only file system/.test(result.stderr)) {
                console.log(`Invalid target address is accepted: ${result.stderr}`);
                return;
            }
        } catch (error) {
            if (/Error acquiring the state lock/.test(error.message)) {
                if (retryCount < maxRetry) {
                    retryCount++;
                    console.log(`An error occurred executing "${command}": ${error.message}. Retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // wait for 5 seconds before retrying
                    continue;
                } else {
                    console.warn("[WARN]#### Max retry count reached.");
                    return;
                }
            } else if (/Invalid target address/.test(error.message) || /read-only file system/.test(error.message)) {
                return;
            } else {
                console.error(error);
                return;
            }
        }
    }
}