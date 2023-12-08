---
subcategory: "Application Performance Management(APM)"
layout: "tencentcloud"
page_title: "TencentCloud: tencentcloud_apm_instance"
sidebar_current: "docs-tencentcloud-resource-apm_instance"
description: |-
  Provides a resource to create a apm instance
---

# tencentcloud_apm_instance

Provides a resource to create a apm instance

## Example Usage

```hcl
resource "tencentcloud_apm_instance" "instance" {
  name                = "terraform-test"
  description         = "for terraform test"
  trace_duration      = 15
  span_daily_counters = 20
  tags = {
    "createdBy" = "terraform"
  }
}
```

## Argument Reference

The following arguments are supported:

* `name` - (Required, String) Name Of Instance.
* `description` - (Optional, String) Description Of Instance.
* `span_daily_counters` - (Optional, Int) Quota Of Instance Reporting.
* `tags` - (Optional, Map) Tag description list.
* `trace_duration` - (Optional, Int) Duration Of Trace Data.

## Attributes Reference

In addition to all arguments above, the following attributes are exported:

* `id` - ID of the resource.



## Import

apm instance can be imported using the id, e.g.

```
terraform import tencentcloud_apm_instance.instance instance_id
```

