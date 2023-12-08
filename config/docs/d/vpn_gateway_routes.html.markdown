---
subcategory: "VPN Connections(VPN)"
layout: "tencentcloud"
page_title: "TencentCloud: tencentcloud_vpn_gateway_routes"
sidebar_current: "docs-tencentcloud-datasource-vpn_gateway_routes"
description: |-
  Use this data source to query detailed information of VPN gateways.
---

# tencentcloud_vpn_gateway_routes

Use this data source to query detailed information of VPN gateways.

## Example Usage

```hcl
data "tencentcloud_vpn_gateways" "foo" {
  vpn_gateway_id         = "main"
  destination_cidr_block = "vpngw-8ccsnclt"
  instance_type          = "1.1.1.1"
  instance_id            = "ap-guangzhou-3"
  tags = {
    test = "tf"
  }
}
```

## Argument Reference

The following arguments are supported:

* `vpn_gateway_id` - (Required, String) VPN gateway ID.
* `destination_cidr` - (Optional, String) Destination IDC IP range.
* `instance_id` - (Optional, String) Instance ID of the next hop.
* `instance_type` - (Optional, String) Next hop type (type of the associated instance). Valid values: VPNCONN (VPN tunnel) and CCN (CCN instance).
* `result_output_file` - (Optional, String) Used to save results.

## Attributes Reference

In addition to all arguments above, the following attributes are exported:

* `vpn_gateway_route_list` - Information list of the vpn gateway routes.
  * `create_time` - Create time.
  * `route_id` - Route ID.
  * `type` - Route type. Default value: Static.
  * `update_time` - Update time.


