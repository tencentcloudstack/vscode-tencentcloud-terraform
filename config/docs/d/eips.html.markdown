---
subcategory: "Cloud Virtual Machine(CVM)"
layout: "tencentcloud"
page_title: "TencentCloud: tencentcloud_eips"
sidebar_current: "docs-tencentcloud-datasource-eips"
description: |-
  Use this data source to query eip instances.
---

# tencentcloud_eips

Use this data source to query eip instances.

## Example Usage

```hcl
data "tencentcloud_eips" "foo" {
  eip_id = "eip-ry9h95hg"
}
```

## Argument Reference

The following arguments are supported:

* `eip_id` - (Optional, String) ID of the EIP to be queried.
* `eip_name` - (Optional, String) Name of the EIP to be queried.
* `public_ip` - (Optional, String) The elastic ip address.
* `result_output_file` - (Optional, String) Used to save results.
* `tags` - (Optional, Map) The tags of EIP.

## Attributes Reference

In addition to all arguments above, the following attributes are exported:

* `eip_list` - An information list of EIP. Each element contains the following attributes:
  * `create_time` - Creation time of the EIP.
  * `eip_id` - ID of the EIP.
  * `eip_name` - Name of the EIP.
  * `eip_type` - Type of the EIP.
  * `eni_id` - The eni id to bind with the EIP.
  * `instance_id` - The instance id to bind with the EIP.
  * `public_ip` - The elastic ip address.
  * `status` - The EIP current status.
  * `tags` - Tags of the EIP.


