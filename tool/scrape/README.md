# Terraform Scrape
Scraping tool used to try to extract data from the terraform docs for the Visual Studio Code extension of TencentCloud IaC Terraform.

## Usage
`docker run -it tiat/vscode-terraform-scrape`

This will output any notices to stderr and output the json that needs to go in vscode-tencentcloud-terraform/xxx.json to stdout. 
- To generate resource defination, run: `docker run -it tiat/vscode-terraform-scrape > ../../config/tips/tiat-resources.json`.
