# TencentCloud Terraform

The VSCode TIAT（Tencent Infrastructure Automation for Terraform）Terraform extension is designed to improve the efficiency of DevOps when using Terraform with Tencent Cloud. The extension provides TencentCloud Account login, resource explorer, code auto-complete, argument tips, and command support inside VSCode.

## Features

This extension supports the following features:

- Login: log in Tencent Cloud with AKSK.
- Terraform Commands: init, plan, apply, and destroy through the VSCode command Palette.
- Auto Complete: provides code suggestions and auto-complete resource types, arguments, and options. Provides ways to go to resource documents.
- Code Snippets/Example: provides a completed example code when typing the specified resource type.
- Import Resource: display the existing `CVM` resource and then import it as a tf file by [Terraformer](https://github.com/GoogleCloudPlatform/terraformer).

*TO-DO(Features to be supported in the future):*
- Visualize: graph the terraform resources and modules.
- Autocomplete: provider code snippets explorer of the specified resource.
- Validate: code check under security and compliance.

## Quick Start
### 1.Login Tencent Cloud
Provide Log in entry to Tencent Cloud.
![login](./images/readme/login.png)
After logged, you can see your account and detail when hovering the status bar.
![account_status](./images/readme/account_status.png)

### 2.Terraform Commands
Open the Command Palette (`Command`+`Shift`+`P` on macOS and `Ctrl`+`Shift`+`P` on Windows/Linux) and type in one of the following commands:

<table>
  <thead>
  <tr>
    <th>Command</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td width="35%">
      Basic commands:<br>
      <ul>
        <li>TencentCloud Terraform: init</li>
        <li>TencentCloud Terraform: plan</li>
        <li>TencentCloud Terraform: apply</li>
        <li>TencentCloud Terraform: refresh</li>
        <li>TencentCloud Terraform: destroy</li>
      </ul>
    </td>
    <td>
      Execute terraform command against the current project workspace.
    </td>
  </tr>
  <tr>
    <td width="35%">
      Login commands:<br>
      <ul>
        <li>TencentCloud Terraform: Login</li>
        <li>TencentCloud Terraform: Logout</li>
      </ul>
    </td>
    <td>
      The shortcut of log in and log out with Tencent Cloud.
    </td>
  </tr>
  </tbody>
</table>


### 3.Auto Complete
When you typing the resource type, attribute, and options, there is a suggestions dialog.
#### Resource Type
![auto_complete_resourcetype](./images/readme/auto_complete_resourcetype.png)
#### Attribute
![auto_complete_resourcetype](./images/readme/auto_complete_attr.png)
#### Options(demo)
> NOTE: only support on `tencentcloud_instance` resource.
![auto_complete_resourcetype](./images/readme/auto_complete_attr_options.png)

### 4.Code Snippets/Example
When you typing the `{` after a resource type and name, there is a example suggestions.
![example](./images/readme/example.png)

Press `Enter` to insert the whole example.

### 5.Import Resource(demo)
> NOTE: only support on `tencentcloud_instance` resource.
When you logged into Tencent Cloud Account, you may see the resources under this account.
![import](./images/readme/import.png)

Choose one resource to import it.
After a few minutes, the import resource will be in the `generated` folder.

### 6.Resource definition
When you place the cursor on a resource type, use the `go to definition` (`Command` on macOS) button to jump to this resource document of the terraform provider website.

![doc_definition](./images/readme/doc_definition.png)
Or, put cursor under the resource type, press `Command`.
![doc](./images/readme/doc.png)

## Requirements

This extension requires:

- [Terraform](https://www.terraform.io/downloads.html) - If you are executing terraform commands in integrated teminal.
- [Node.js 6.0+](https://nodejs.org) - If you are using Cloud Shell.
- [GraphViz](http://www.graphviz.org) - If you are using the visualize feature.

> NOTE: Please make sure these requirements are in your PATH environment variable.

## Extension Settings

- `tcTerraform.secretid` and `tcTerraform.secretkey`: specify the your tencentcloud secret id and key.
- `tcTerraform.terminal`: Specifies terminal used to run Terraform commands. Valid settings are `cloudshell`(TO-DO) or `integrated`.
- `tcTerraform.checkTCCLI`: specifies whether or not TCCLI installed in the PATH. 


## License
[MIT](LICENSE.md)

## Reference
- [Source code of the tencentcloud terraform provider ](https://github.com/tencentcloudstack/terraform-provider-tencentcloud)
- [Document of the tencentcloud terraform](https://registry.terraform.io/providers/tencentcloudstack/tencentcloud/latest)

**Enjoy!**
