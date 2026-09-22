import type { Example } from './types'

export const block: Example[] = [
  { title: 'Request path', source: `block-beta
  columns 4
  cdn["CDN"]:4
  lb["Load balancer"]:4
  api1["API pod"] api2["API pod"] api3["API pod"] api4["API pod"]
  cache[("Redis")]:2 db[("PostgreSQL")]:2
  cdn --> lb
  lb --> api1
  lb --> api2
  lb --> api3
  lb --> api4
  api1 --> cache
  api2 --> cache
  api3 --> db
  api4 --> db` },

  { title: 'Layered application', source: `block-beta
  columns 3
  ui["Presentation"]:3
  app["Application services"]:3
  domain["Domain model"]:3
  repo["Repositories"] gateway["External gateways"] pub["Event publisher"]
  db[("Database")] http["HTTP clients"] bus[("Event bus")]
  ui --> app
  app --> domain
  domain --> repo
  domain --> gateway
  domain --> pub
  repo --> db
  gateway --> http
  pub --> bus` },

  { title: 'Kubernetes namespace', source: `block-beta
  columns 3
  ing["Ingress controller"]:3
  svc1["orders Service"] svc2["payments Service"] svc3["search Service"]
  dep1["orders Deployment"] dep2["payments Deployment"] dep3["search StatefulSet"]
  cm["ConfigMaps"] sec["Secrets"] pvc[("PersistentVolumes")]
  ing --> svc1
  ing --> svc2
  ing --> svc3
  svc1 --> dep1
  svc2 --> dep2
  svc3 --> dep3
  dep1 --> cm
  dep2 --> sec
  dep3 --> pvc` },

  { title: 'Memory hierarchy', source: `block-beta
  columns 4
  reg["Registers, 1 cycle"]:4
  l1["L1, 4 cycles"]:2 l2["L2, 12 cycles"]:2
  l3["L3, 40 cycles"]:4
  dram["DRAM, 200 cycles"]:4
  nvme["NVMe, 100k cycles"]:2 net["Network, 10M cycles"]:2
  reg --> l1
  l1 --> l2
  l2 --> l3
  l3 --> dram
  dram --> nvme
  dram --> net` },

  { title: 'Data platform', source: `block-beta
  columns 3
  src1["CDC streams"] src2["Event topics"] src3["Partner SFTP"]
  ingest["Ingestion"]:3
  bronze[("Raw zone")] silver[("Staging models")] gold[("Core marts")]
  serve["Semantic layer"]:3
  bi["Dashboards"] ml["Model training"] api["Reverse ETL"]
  src1 --> ingest
  src2 --> ingest
  src3 --> ingest
  ingest --> bronze
  bronze --> silver
  silver --> gold
  gold --> serve
  serve --> bi
  serve --> ml
  serve --> api` },

  { title: 'CI pipeline stages', source: `block-beta
  columns 5
  push["Push"]:5
  lint["Lint"] types["Typecheck"] unit["Unit"] audit["Audit"] license["Licences"]
  build["Build and sign image"]:5
  scan["Vulnerability scan"]:2 sbom["SBOM"]:3
  stage["Deploy staging"]:5
  e2e["End to end"]:2 smoke["Smoke"]:3
  prod["Production canary"]:5
  push --> lint
  push --> unit
  lint --> build
  unit --> build
  build --> scan
  scan --> stage
  stage --> e2e
  e2e --> prod` },

  { title: 'Browser rendering', source: `block-beta
  columns 3
  html["HTML"] css["CSS"] js["JavaScript"]
  dom["DOM tree"] cssom["CSSOM"] engine["JS engine"]
  render["Render tree"]:3
  layout["Layout"] paint["Paint"] composite["Composite"]
  screen["Pixels on screen"]:3
  html --> dom
  css --> cssom
  js --> engine
  dom --> render
  cssom --> render
  engine --> dom
  render --> layout
  layout --> paint
  paint --> composite
  composite --> screen` },

  { title: 'Network stack', source: `block-beta
  columns 2
  app["Application: HTTP/3"]:2
  sec["Security: TLS 1.3"]:2
  trans["Transport: QUIC over UDP"]:2
  net["Network: IPv6"] net4["Network: IPv4"]
  link["Link: Ethernet"] wifi["Link: 802.11"]
  phys["Physical"]:2
  app --> sec
  sec --> trans
  trans --> net
  trans --> net4
  net --> link
  net4 --> wifi
  link --> phys
  wifi --> phys` },

  { title: 'Edge and origin', source: `block-beta
  columns 3
  users["Users"]:3
  edge1["Edge, London"] edge2["Edge, Frankfurt"] edge3["Edge, Virginia"]
  shield["Shield cache"]:3
  origin["Origin, eu-west-1"]:2 standby["Standby, eu-west-2"]
  store[("Object storage")]:3
  users --> edge1
  users --> edge2
  users --> edge3
  edge1 --> shield
  edge2 --> shield
  edge3 --> shield
  shield --> origin
  origin --> store
  origin --> standby` },

  { title: 'Team topology', source: `block-beta
  columns 3
  stream1["Checkout stream team"] stream2["Catalogue stream team"] stream3["Growth stream team"]
  platform["Platform team"]:3
  enabling["Enabling: reliability"] enabling2["Enabling: security"] complicated["Search subsystem team"]
  infra["Cloud and networking"]:3
  stream1 --> platform
  stream2 --> platform
  stream3 --> platform
  platform --> infra
  enabling --> stream1
  enabling2 --> stream2
  complicated --> stream2` },
]
