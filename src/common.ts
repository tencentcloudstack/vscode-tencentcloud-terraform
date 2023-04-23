"use strict";

export enum TerraformCommand {
    Init = "terraform init",
    Plan = "terraform plan",
    Apply = "terraform apply",
    Import = "terraform import",
    Refresh = "terraform refresh",
    Destroy = "terraform destroy",
    Validate = "terraform validate",
    Show = "terraform show",
    State = "terraform state"
}

export enum TcCliCommand {
    Login = "tccli configure",
    Service = "tccli service",
}
