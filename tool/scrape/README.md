# Terraform Scrape
Scraping tool used to try to extract data from the terraform docs for the Visual Studio Code extension of TencentCloud IaC Terraform.

## Usage
### Build Script
Run `./build.sh tiat/terraform-scrape:vx` to generate the `tiat-resources.json`.
- `vx.x.x` is the docker image version want to generate.

### Docker Cmd
`docker run -it tiat/vscode-terraform-scrape`

This will output any notices to stderr and output the json that needs to go in vscode-tencentcloud-terraform/xxx.json to stdout. 
- To generate resource defination, run: `docker run -it tiat/vscode-terraform-scrape > ../../config/tips/tiat-resources.json`.
