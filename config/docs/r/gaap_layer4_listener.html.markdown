---
subcategory: "Global Application Acceleration(GAAP)"
layout: "tencentcloud"
page_title: "TencentCloud: tencentcloud_gaap_layer4_listener"
sidebar_current: "docs-tencentcloud-resource-gaap_layer4_listener"
description: |-
  Provides a resource to create a layer4 listener of GAAP.
---

# tencentcloud_gaap_layer4_listener

Provides a resource to create a layer4 listener of GAAP.

## Example Usage

```hcl
resource "tencentcloud_gaap_proxy" "foo" {
  name              = "ci-test-gaap-proxy"
  bandwidth         = 10
  concurrent        = 2
  access_region     = "SouthChina"
  realserver_region = "NorthChina"
}

resource "tencentcloud_gaap_realserver" "foo" {
  ip   = "1.1.1.1"
  name = "ci-test-gaap-realserver"
}

resource "tencentcloud_gaap_realserver" "bar" {
  ip   = "119.29.29.29"
  name = "ci-test-gaap-realserver2"
}

resource "tencentcloud_gaap_layer4_listener" "foo" {
  protocol        = "TCP"
  name            = "ci-test-gaap-4-listener"
  port            = 80
  realserver_type = "IP"
  proxy_id        = tencentcloud_gaap_proxy.foo.id
  health_check    = true

  realserver_bind_set {
    id   = tencentcloud_gaap_realserver.foo.id
    ip   = tencentcloud_gaap_realserver.foo.ip
    port = 80
  }

  realserver_bind_set {
    id   = tencentcloud_gaap_realserver.bar.id
    ip   = tencentcloud_gaap_realserver.bar.ip
    port = 80
  }
}
```

## Argument Reference

The following arguments are supported:

* `name` - (Required, String) Name of the layer4 listener, the maximum length is 30.
* `port` - (Required, Int, ForceNew) Port of the layer4 listener.
* `protocol` - (Required, String, ForceNew) Protocol of the layer4 listener. Valid value: `TCP` and `UDP`.
* `proxy_id` - (Required, String, ForceNew) ID of the GAAP proxy.
* `realserver_type` - (Required, String, ForceNew) Type of the realserver. Valid value: `IP` and `DOMAIN`. NOTES: when the `protocol` is specified as `TCP` and the `scheduler` is specified as `wrr`, the item can only be set to `IP`.
* `client_ip_method` - (Optional, Int, ForceNew) The way the listener gets the client IP, 0 for TOA, 1 for Proxy Protocol, default value is 0. NOTES: Only supports listeners of `TCP` protocol.
* `connect_timeout` - (Optional, Int) Timeout of the health check response, should less than interval, default value is 2s. NOTES: Only supports listeners of `TCP` protocol and require less than `interval`.
* `health_check` - (Optional, Bool) Indicates whether health check is enable, default value is `false`. NOTES: Only supports listeners of `TCP` protocol.
* `interval` - (Optional, Int) Interval of the health check, default value is 5s. NOTES: Only supports listeners of `TCP` protocol.
* `realserver_bind_set` - (Optional, Set) An information list of GAAP realserver.
* `scheduler` - (Optional, String) Scheduling policy of the layer4 listener, default value is `rr`. Valid value: `rr`, `wrr` and `lc`.

The `realserver_bind_set` object supports the following:

* `id` - (Required, String) ID of the GAAP realserver.
* `ip` - (Required, String) IP of the GAAP realserver.
* `port` - (Required, Int) Port of the GAAP realserver.
* `weight` - (Optional, Int) Scheduling weight, default value is `1`. The range of values is [1,100].

## Attributes Reference

In addition to all arguments above, the following attributes are exported:

* `id` - ID of the resource.
* `create_time` - Creation time of the layer4 listener.
* `status` - Status of the layer4 listener.


## Import

GAAP layer4 listener can be imported using the id, e.g.

```
  $ terraform import tencentcloud_gaap_layer4_listener.foo listener-11112222
```

