---
title: "Creating a Monitoring Stack With Docker Swarm, Grafana, InfluxDB and
Telegraf"
author: "William Martins"
date: 2017-10-03T21:00:00-03:00
tags: ["docker", "docker swarm", "grafana", "influxdb", "telegraf",
"monitoring"]
---

Monitoring your infrastructure is one of the most important aspects of
successfully launching a product. It's really important to know when your
machines/applications are under heavy load. Moreover, if it happens, you would
want to quickly know what's going on and what you can do to recover your
infrastructure.

This blog post explains how you can configure setup a monitoring stack easily
using [**Docker Swarm**](https://docs.docker.com/engine/swarm/),
[**Grafana**](https://github.com/grafana/grafana),
[**InfluxDB**](https://github.com/influxdata/influxdb) and
[**Telegraf**](https://github.com/influxdata/telegraf).

## Docker Swarm

This tutorial requires you to be running a **Swarm cluster**. You can also setup
this monitoring infrastructure without using Swarm, but it might become hard to
manage when you add or remove nodes on your cluster.

> You can achieve the same using another deployment/orchestration tool, like
> [**Nomad**](https://www.nomadproject.io/).

We'll be using the version **3.3** of `docker-compose.yml` file.

## Telegraf

[**Telegraf**](https://github.com/influxdata/telegraf) is an awesome tool to
extract metrics.

You can customize what data to extract and how **Telegraf** will do that by
providing a `telegraf.conf` file. The one we'll be using is this one:

```conf
[[inputs.net]]
  interfaces = ["eth0,eth1,lo"]

[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false

[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs"]

[[inputs.diskio]]

[[inputs.kernel]]

[[inputs.mem]]

[[inputs.processes]]

[[inputs.swap]]
[[inputs.system]]
[[inputs.netstat]]

[[inputs.docker]]
  endpoint = "unix:///var/run/docker.sock"
  container_names = []
  timeout = "5s"
  perdevice = true
  total = false
  docker_label_include = []
  docker_label_exclude = []

[[outputs.influxdb]]
  urls = ["http://influxdb:8086"]
  database = "telegraf"
  retention_policy = ""
  write_consistency = "any"
  timeout = "5s"
```

If you want to get the default **Telegraf** config (with all options commented)
you can use the following command to get it:

```bash
docker pull telegraf:1.4.0-alpine
docker run --rm telegraf:1.4.0-alpine telegraf config > telegraf.conf
```

After getting a `telegraf.conf` file, we're able to define our service
configuration in `docker-compose.yml`:

```yml
version: "3.3"

services:
  telegraf:
    image: telegraf:1.4.0
    hostname: "{{.Node.ID}}"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    configs:
      - source: telegraf.conf
        target: /etc/telegraf/telegraf.conf
    deploy:
      mode: global

configs:
  telegraf.conf:
    file: ./telegraf/telegraf.conf
```

It's pretty simple. The trick here is to add `deploy mode` as **`global`**. This
will make **Telegraf** run on every machine in **Swarm** cluster, and that's how
we're going to be able to monitor the cluster machines.

> We're not using Telegraf's Alpine image because Alpine doesn't include
> all the dependencies to be able to collect `[[inputs.system]]`.

## InfluxDB

[**InfluxDB**](https://github.com/influxdata/influxdb) is a time series database
that allows us to store the metrics provided by **Telegraf**.

As **InfluxDB** is our database, we'll first need to define where it would be
located. As we'll need the data to be persistent, it's a bad idea to have the
database popping out in different places (and, as a consequence, losing the
data if it's deployed to a newer place). So, grab one of your swarm nodes and
add a label to it:

```bash
docker node update --label-add influxdb=true <NODE-ID>
```

This will add the node `influxdb` with value as `true` to the node `NODE-ID`.
It'll be used to know where we can add `influxdb` container.

Then, we'll also be able to provide a configuration file, named `influxdb.conf`.
**InfluxDB** also provides a way to get a config file template by running:

```bash
docker run --rm influxdb:1.3.5-alpine influxd config > influxdb.conf
```

Then, we can declare the `influxdb` service:

```yml
services:
  influxdb:
    image: influxdb:1.3.5-alpine
    configs:
      - source: influxdb.conf
        target: /etc/influxdb/influxdb.conf
    volumes:
      - /data/influxdb:/var/lib/influxdb
    deploy:
      placement:
        constraints:
          - node.labels.influxdb == true

configs:
  influxdb.conf:
    file: ./influxdb/influxdb.conf
```

We'll use the following `influxdb.conf` file:

```conf
[meta]
  dir = "/var/lib/influxdb/meta"
  retention-autocreate = true
  logging-enabled = true

[data]
  dir = "/var/lib/influxdb/data"
  index-version = "inmem"
  wal-dir = "/var/lib/influxdb/wal"
  wal-fsync-delay = "0s"
  query-log-enabled = true
  cache-max-memory-size = 1073741824
  cache-snapshot-memory-size = 26214400
  cache-snapshot-write-cold-duration = "10m0s"
  compact-full-write-cold-duration = "4h0m0s"
  max-series-per-database = 1000000
  max-values-per-tag = 100000
  max-concurrent-compactions = 0
  trace-logging-enabled = false

[http]
  enabled = true
  bind-address = ":8086"
  auth-enabled = false
  log-enabled = true
  write-tracing = false
  pprof-enabled = true
  https-enabled = false
  https-certificate = "/etc/ssl/influxdb.pem"
  https-private-key = ""
  max-row-limit = 0
  max-connection-limit = 0
  shared-secret = ""
  realm = "InfluxDB"
  unix-socket-enabled = false
  bind-socket = "/var/run/influxdb.sock"
```

## Grafana

We'll use **Grafana** to visualize data coming from **InfluxDB**.

First, we'll need to choose a node where we'll be running **Grafana**. After that,
we need to update its label in order to deploy grafana to the correct host:

```bash
docker node update --label-add grafana=true <NODE-ID>
```

**Grafana** service is pretty straightforward to configure, we just need to add its
service to `docker-compose.yml`:

```yml
services:
  grafana:
    image: grafana/grafana:4.5.2
    ports:
      - 3000:3000
    volumes:
      - /data/grafana:/var/lib/grafana
    deploy:
      placement:
        constraints:
          - node.labels.grafana == true
```

## Deployment Time!

It's time to deploy our monitoring stack. To do so, we'll use `docker stack`
command:

```bash
docker stack deploy -c docker-compose.yml MONITORING
```

You can check if your stack is running by typing:

```bash
docker stack services MONITORING
```

You should see something like the following:

```
ID                  NAME                  MODE                REPLICAS            IMAGE                   PORTS
a9l5bzodswai        MONITORING_grafana    replicated          1/1                 grafana/grafana:4.5.2   *:3000->3000/tcp
vmrob3iveofr        MONITORING_telegraf   global              1/1                 telegraf:1.4.0-alpine
wllxmffrsxd7        MONITORING_influxdb   replicated          1/1                 influxdb:1.3.5-alpine
```

### Configuring Grafana

Now, it's time to configure a new `Data Source`. Go to **Grafana** admin page
(http://localhost:3000) and create a new `Data Source` with the following
fields:

- Name: `InfluxDB`
- Type: `InfluxDB`
- Http settings:
  - Url: `http://influxdb:8086` (`Swarm` provides a DNS for us)
  - Access: `proxy`
- InfluxDB Details:
  - Database: `telegraf`

Then, we can create our dashboards and add data to them. If you don't know where
to start, there are some nice dashboards in https://grafana.com/dashboards. The
following dashboards are nice ones to use with **Docker Swarm**:

- https://grafana.com/dashboards/1443
- https://grafana.com/dashboards/1150

Now, you'll have a nice and powerful monitoring stack for your Docker containers
and for your machines!

Hope you enjoyed!
