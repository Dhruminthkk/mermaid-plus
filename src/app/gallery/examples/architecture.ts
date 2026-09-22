import type { Example } from './types'

export const architecture: Example[] = [
  { title: 'Three-tier web application', source: `architecture-beta
  group vpc(cloud)[Production VPC]
  group public(cloud)[Public subnet] in vpc
  group private(cloud)[Private subnet] in vpc
  service users(internet)[Users]
  service lb(server)[Load balancer] in public
  service api(server)[API servers] in private
  service db(database)[PostgreSQL] in private
  service cache(database)[Redis] in private
  users:R --> L:lb
  lb:R --> L:api
  api:B --> T:db
  api:R --> L:cache` },

  { title: 'Static site with a CDN', source: `architecture-beta
  service visitors(internet)[Visitors]
  service cdn(server)[CDN]
  service bucket(disk)[Object storage]
  service build(server)[Build pipeline]
  service repo(server)[Git repository]
  visitors:R --> L:cdn
  cdn:R --> L:bucket
  build:T --> B:bucket
  repo:R --> L:build` },

  { title: 'Event-driven microservices', source: `architecture-beta
  group platform(cloud)[Order platform]
  service gateway(server)[API gateway] in platform
  service orders(server)[Order service] in platform
  service payments(server)[Payment service] in platform
  service shipping(server)[Shipping service] in platform
  service bus(server)[Event bus] in platform
  service orderdb(database)[Orders DB] in platform
  service paydb(database)[Payments DB] in platform
  gateway:B --> T:orders
  orders:R --> L:bus
  bus:R --> L:payments
  bus:B --> T:shipping
  orders:B --> T:orderdb
  payments:B --> T:paydb` },

  { title: 'Multi-region failover', source: `architecture-beta
  group primary(cloud)[eu-west-1 primary]
  group standby(cloud)[eu-west-2 standby]
  service dns(internet)[Global DNS]
  service lb1(server)[Load balancer] in primary
  service app1(server)[App tier] in primary
  service db1(database)[Primary database] in primary
  service lb2(server)[Load balancer] in standby
  service app2(server)[App tier] in standby
  service db2(database)[Warm standby] in standby
  dns:B --> T:lb1
  dns:B --> T:lb2
  lb1:B --> T:app1
  app1:B --> T:db1
  lb2:B --> T:app2
  app2:B --> T:db2
  db1:R --> L:db2` },

  { title: 'Data platform', source: `architecture-beta
  group ingest(cloud)[Ingestion]
  group warehouse(cloud)[Warehouse]
  service sources(internet)[Production services]
  service cdc(server)[Change data capture] in ingest
  service stream(server)[Event stream] in ingest
  service lake(disk)[Raw zone] in warehouse
  service dwh(database)[Columnar warehouse] in warehouse
  service bi(server)[BI tool]
  sources:R --> L:cdc
  sources:B --> T:stream
  cdc:R --> L:lake
  stream:R --> L:lake
  lake:R --> L:dwh
  dwh:R --> L:bi` },

  { title: 'Container platform', source: `architecture-beta
  group cluster(cloud)[Kubernetes cluster]
  group nodes(cloud)[Worker nodes] in cluster
  service registry(disk)[Image registry]
  service ingress(server)[Ingress controller] in cluster
  service pods(server)[Application pods] in nodes
  service jobs(server)[Batch jobs] in nodes
  service storage(disk)[Persistent volumes] in cluster
  service secrets(database)[Secrets manager]
  ingress:B --> T:pods
  registry:R --> L:pods
  pods:B --> T:storage
  jobs:B --> T:storage
  secrets:T --> B:pods` },

  { title: 'Media pipeline', source: `architecture-beta
  group pipeline(cloud)[Transcode pipeline]
  service creators(internet)[Creators]
  service upload(server)[Upload service] in pipeline
  service queue(server)[Transcode queue] in pipeline
  service workers(server)[Transcode workers] in pipeline
  service masters(disk)[Masters bucket] in pipeline
  service renditions(disk)[Renditions bucket] in pipeline
  service cdn(server)[CDN]
  creators:R --> L:upload
  upload:B --> T:masters
  upload:R --> L:queue
  queue:B --> T:workers
  masters:R --> L:workers
  workers:R --> L:renditions
  renditions:R --> L:cdn` },

  { title: 'Hybrid connectivity', source: `architecture-beta
  group onprem(cloud)[On-premises datacentre]
  group cloud(cloud)[Cloud VPC]
  service erp(server)[ERP] in onprem
  service files(disk)[File server] in onprem
  service vpn1(server)[VPN endpoint] in onprem
  service vpn2(server)[VPN endpoint] in cloud
  service apps(server)[Application tier] in cloud
  service db(database)[Managed database] in cloud
  erp:R --> L:vpn1
  files:R --> L:vpn1
  vpn1:R --> L:vpn2
  vpn2:R --> L:apps
  apps:B --> T:db` },

  { title: 'Observability stack', source: `architecture-beta
  group obs(cloud)[Observability]
  service services(server)[Application services]
  service agent(server)[Collector agents] in obs
  service metrics(database)[Metrics store] in obs
  service logs(database)[Log store] in obs
  service traces(database)[Trace store] in obs
  service dash(server)[Dashboards] in obs
  service pager(internet)[Paging]
  services:R --> L:agent
  agent:R --> L:metrics
  agent:B --> T:logs
  agent:T --> B:traces
  metrics:R --> L:dash
  metrics:T --> B:pager` },

  { title: 'Edge inference', source: `architecture-beta
  group edge(cloud)[Edge sites]
  group core(cloud)[Core cloud]
  service cameras(internet)[Cameras]
  service gateway(server)[Edge gateway] in edge
  service inference(server)[Inference runtime] in edge
  service buffer(disk)[Local buffer] in edge
  service registry(disk)[Model registry] in core
  service lake(disk)[Training data lake] in core
  service trainer(server)[Training jobs] in core
  cameras:R --> L:gateway
  gateway:R --> L:inference
  inference:B --> T:buffer
  buffer:R --> L:lake
  lake:R --> L:trainer
  trainer:T --> B:registry
  registry:L --> R:inference` },
]
