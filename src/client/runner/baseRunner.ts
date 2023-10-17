/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Tencent Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";

export abstract class BaseRunner {

    public tfExecutor: any;

    constructor() {
        this.init();
    }

    public abstract init(): void;
    /**
     * execute this command to prepare the terraform import.
     * @param cwd 
     * @returns 
     */
    public abstract preImport(cwd: string, args?: any, file?: string): Promise<any>;

    /**
     * execute this command to import the existing resource from tencentcloud
     * @param cwd 
     * @param args 
     * @returns 
     */
    public abstract executeImport(cwd: string, args?: any, cmd?: any, flags?: any): Promise<any>;

    /**
     * execute this command to handle post of the terraform import.
     * @param cwd 
     * @param executor Choose who will execute this command? terraform or terraformer 
     * @param cmd 
     * @param flags 
     * @returns 
     */
    public abstract postImport(cwd: string, executor?: string, args?: string): Promise<any>;

    /**
     * execute this command to plan the tf code
     * @param cwd 
     * @param args 
     * @param cmd 
     * @param flags 
     */
    public abstract executePlan(cwd: string, args?: any, cmd?: any, flags?: any): Promise<any>;

    /**
     * check binary whether ready or not
     */
    public abstract checkInstalled(): Promise<void>;

    /**
    * execute this command to display/output the terraform state.
    * @param cwd 
    * @returns 
    */
    public abstract executeShow(cwd: string, args?: any): Promise<any>;
}
