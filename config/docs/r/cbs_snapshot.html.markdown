---
subcategory: "Cloud Block Storage(CBS)"
layout: "tencentcloud"
page_title: "TencentCloud: tencentcloud_cbs_snapshot"
sidebar_current: "docs-tencentcloud-resource-cbs_snapshot"
description: |-
  Provides a resource to create a CBS snapshot.
---

# tencentcloud_cbs_snapshot

Provides a resource to create a CBS snapshot.

## Example Usage

```hcl
resource "tencentcloud_cbs_snapshot" "snapshot" {
  snapshot_name = "unnamed"
  storage_id    = "disk-kdt0sq6m"
}
```

## Argument Reference

The following arguments are supported:

* `snapshot_name` - (Required, String) Name of the snapshot.
* `storage_id` - (Required, String, ForceNew) ID of the the CBS which this snapshot created from.
* `tags` - (Optional, Map, **Deprecated**) cbs snapshot do not support tag now. The available tags within this CBS Snapshot.

## Attributes Reference

In addition to all arguments above, the following attributes are exported:

* `id` - ID of the resource.
* `create_time` - Creation time of snapshot.
* `disk_type` - Types of CBS which this snapshot created from.
* `percent` - Snapshot creation progress percentage. If the snapshot has created successfully, the constant value is 100.
* `snapshot_status` - Status of the snapshot.
* `storage_size` - Volume of storage which this snapshot created from.


## Import

CBS snapshot can be imported using the id, e.g.

```
$ terraform import tencentcloud_cbs_snapshot.snapshot snap-3sa3f39b
```

