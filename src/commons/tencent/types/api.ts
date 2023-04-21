export namespace res {
  export interface ProductSets {
    ProductSet: ProductSet[];
  }

  export interface ProductSet {
    product: string;
    productDocCatID?: number;
    productName: string;
    aPIBrief?: string;
    productCNDocCatID?: number;
    productVersion?: string;
    productCNDocIntroUrl?: string;
  }
  export interface ActionSet {
    actionName: string;
    product: string;
    description: string;
    isSubscribed?: boolean;
    actionCNDocUrl: string;
    productName: string;
    productVersion: string;
    action: string;
    categoryName: string;
    icon?: string;
  }

  export interface ActionSets {
    ActionSet: ActionSet[];
  }

  export interface SDKInfo {
    SDKInfo: KeyValue[];
  }

  export interface KeyValue {
    Value: string;
    Key: string;
  }

  export interface SdkDemos {
    SdkDemoSet: SdkDemoSet[];
  }

  export interface SdkDemoSet {
    DemoJsonCode: string;
    TypeMapSet: TypeMapSet[];
    DemoCode: string;
    Language: string;
  }

  interface TypeMapSet {
    Postfix: string;
    OriginalType: string;
    SdkType: string;
    DestinationType: string;
  }

  interface SignDemoSet {
    SignCode: string;
    Language: string;
    ParameterCode: string;
  }

  export interface Parameters {
    ActionRegions: string[];
    OutputParameterSet: any[];
    ParameterSet: ParameterSet[];
    RequestId: string;
    ObjectSet: ObjectSet[];
  }

  interface ParameterSet {
    IsArray: boolean;
    IsPublic: boolean;
    Name: string;
    Default: string;
    Required: boolean;
    Visibility: number;
    Type: string;
    Example: string;
    ValueAllowedNull: boolean;
    Desc: string;
  }

  interface ObjectSet {
    ObjectId: number;
    Name: string;
    Members: Member[];
    Description: string;
  }

  interface Member {
    IsArray: boolean;
    IsPublic: boolean;
    Name: string;
    Default: string;
    Required: boolean;
    Visibility: number;
    Type: string;
    Example: string;
    Desc: string;
  }

  export interface Action {
    Document: string;
    ActionRegions: string[];
    ParameterSet: ParameterSet[];
    RequestId: string;
    ObjectSet: ObjectSet[];
  }
}
export namespace req {
  interface BaseParmeter {
    Version: string;
    ProductName: string;
  }
  export interface ProductParmeter extends BaseParmeter {
    ProductVersion: string;
  }
  export interface SDKInfoParmeter extends BaseParmeter {
    SDKType: string;
  }
  export interface Parmeter extends ProductParmeter {
    ProductAction: string;
  }
  export interface SdkParmeter extends BaseParmeter {
    SDKType: string;
  }
}

export interface IApiDoc {
  describeAllProducts(): Promise<res.ProductSets>;
  describeProductActions(
    parame: Partial<req.ProductParmeter>
  ): Promise<res.ActionSets>;
  describeAllActions(): Promise<res.ActionSet[]>;
  describeSdkDemos(parame: req.Parmeter): Promise<res.SdkDemoSet[]>;
  describeSDKInfo(parame: req.SDKInfoParmeter): Promise<res.KeyValue[]>;
  // describeAction(): Promise<res.Action>;
  // describeParameters(parame?: req.Parmeter): Promise<res.Parameters>;
}
