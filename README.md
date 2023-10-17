# TencentCloud Terraform

The VSCode TIAT（Tencent Infrastructure Automation for Terraform）Terraform extension is designed to increase developer productivity authoring, testing and using Terraform with Tencent Cloud. The extension provides terraform command support, resource graph visualization and CloudShell integration inside VSCode.

## Features

This extension supports the following features:

- Terraform commands: init, plan, apply, validate, refresh and destroy.
- Auto complete: Autocomplete resource types, parameters, and resource definitions.
- Import resource: display the existing `CVM` resource and then import it as a tf file by [Terraformer](https://github.com/GoogleCloudPlatform/terraformer).

*TO-DO(Features to be supported in the future):*
- Visualize: graph the terraform resources and modules.
- Autocomplete: provider code snippets of the specified resource.
- Connect to Tencent Cloud: login to Tencent Cloud and sync your account info(eg: obtain AKSK/Token automatically).

## Commands

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
        <li>TencentCloud Terraform: validate</li>
        <li>TencentCloud Terraform: refresh</li>
        <li>TencentCloud Terraform: destroy</li>
      </ul>
    </td>
    <td>
      Execute terraform command against the current project workspace.
      If run with terminal set to Cloud Shell, will run the command in Cloud Shell.
    </td>
  </tr>
  <tr>
    <td>TencentCloud Terraform: visualize(TO-DO)</td>
    <td>Create a visual representation of the components of the module and save it in <code>graph.png</code>.</td>
  </tr>
  <tr>
    <td>TencentCloud Terraform: push(TO-DO)</td>
    <td>Push workspace files that meet the filter <code>azureTerraform.files</code> setting in your configuration to Cloud Shell.</td>
  </tr>
  <tr>
    <td>TencentCloud Terraform: Execute Test(TO-DO)</td>
    <td>
      Run one of the following test against the current module using a test container: <br>
      <ul>
        <li>lint: This command will check the formating of the code of the Terraform module.</li>
        <li>e2e: This command will deploy the current module with the settings specified in the .tfvars file, verify that the deployment pass the controls and destroy the resources that have been created.</li>
      </ul>
    </td>
  </tr>
  </tbody>
</table>


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
