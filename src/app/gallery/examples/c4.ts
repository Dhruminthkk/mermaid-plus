import type { Example } from './types'

export const c4: Example[] = [
  { title: 'Internet banking — context', source: `C4Context
  title Internet banking
  Person(customer, "Personal banking customer", "Views accounts and makes payments")
  Person(support, "Support agent", "Answers customer queries")
  System(banking, "Internet banking", "Web and mobile banking")
  System_Ext(mainframe, "Core banking mainframe", "System of record for accounts and balances")
  System_Ext(email, "Email delivery", "Transactional email")
  System_Ext(bureau, "Credit bureau", "Affordability checks")
  Rel(customer, banking, "Views balances, makes payments")
  Rel(support, banking, "Looks up accounts")
  Rel(banking, mainframe, "Reads balances, posts payments", "gRPC over mTLS")
  Rel(banking, email, "Sends statements and alerts", "SMTP")
  Rel(banking, bureau, "Checks affordability", "HTTPS")
  Rel(email, customer, "Delivers to")` },

  { title: 'Internet banking — containers', source: `C4Container
  title Internet banking containers
  Person(customer, "Customer", "Uses web and mobile")
  System_Boundary(banking, "Internet banking") {
    Container(spa, "Web application", "React", "Single page app served from the CDN")
    Container(mobile, "Mobile app", "Swift and Kotlin", "Native clients")
    Container(api, "API gateway", "Kotlin, Spring", "Authentication, routing, rate limits")
    Container(accounts, "Accounts service", "Kotlin", "Balances and transaction history")
    Container(payments, "Payments service", "Kotlin", "Initiates and tracks payments")
    ContainerDb(cache, "Session and read cache", "Redis", "Short-lived session and balance cache")
    ContainerDb(db, "Operational database", "PostgreSQL", "Customers, payees, audit")
  }
  System_Ext(mainframe, "Core banking mainframe", "System of record")
  Rel(customer, spa, "Uses", "HTTPS")
  Rel(customer, mobile, "Uses")
  Rel(spa, api, "Calls", "JSON over HTTPS")
  Rel(mobile, api, "Calls", "JSON over HTTPS")
  Rel(api, accounts, "Routes to")
  Rel(api, payments, "Routes to")
  Rel(accounts, cache, "Reads and writes")
  Rel(accounts, mainframe, "Reads balances")
  Rel(payments, db, "Stores payment state")
  Rel(payments, mainframe, "Posts payments")` },

  { title: 'E-commerce platform — context', source: `C4Context
  title Retail platform
  Person(shopper, "Shopper", "Browses and buys")
  Person(merchandiser, "Merchandiser", "Manages the catalogue")
  Person_Ext(courier, "Courier", "Collects and delivers parcels")
  System(shop, "Retail platform", "Storefront, checkout and fulfilment")
  System_Ext(psp, "Payment provider", "Card and wallet processing")
  System_Ext(tax, "Tax service", "Rates and filing")
  System_Ext(carrier, "Carrier API", "Labels and tracking")
  System_Ext(erp, "ERP", "Stock and finance")
  Rel(shopper, shop, "Browses, buys, tracks orders")
  Rel(merchandiser, shop, "Edits products and prices")
  Rel(shop, psp, "Authorises and captures", "HTTPS")
  Rel(shop, tax, "Calculates tax", "HTTPS")
  Rel(shop, carrier, "Buys labels, polls tracking")
  Rel(carrier, courier, "Assigns collections")
  Rel(shop, erp, "Syncs stock and postings", "nightly batch")` },

  { title: 'Checkout — containers', source: `C4Container
  title Checkout containers
  Person(shopper, "Shopper", "Buys things")
  System_Boundary(shop, "Retail platform") {
    Container(web, "Storefront", "Next.js", "Server-rendered catalogue and checkout")
    Container(bff, "Checkout BFF", "TypeScript", "Aggregates for the checkout screen")
    Container(cart, "Cart service", "Go", "Cart state and pricing")
    Container(order, "Order service", "Java", "Order lifecycle")
    Container(pay, "Payment service", "Java", "Talks to the provider, holds no card data")
    ContainerQueue(bus, "Event bus", "Kafka", "Order and payment events")
    ContainerDb(orders, "Orders database", "PostgreSQL", "Orders and lines")
    ContainerDb(carts, "Cart store", "Redis", "Carts, 30 day TTL")
  }
  System_Ext(psp, "Payment provider", "Card processing")
  Rel(shopper, web, "Uses", "HTTPS")
  Rel(web, bff, "Calls")
  Rel(bff, cart, "Reads and updates the cart")
  Rel(bff, order, "Places the order")
  Rel(cart, carts, "Reads and writes")
  Rel(order, orders, "Reads and writes")
  Rel(order, bus, "Publishes order events")
  Rel(pay, bus, "Consumes and publishes")
  Rel(pay, psp, "Authorises and captures", "HTTPS")` },

  { title: 'Order service — components', source: `C4Component
  title Order service components
  Container_Boundary(order, "Order service") {
    Component(rest, "Order controller", "Spring MVC", "HTTP endpoints for orders")
    Component(placer, "Order placement", "Domain service", "Validates, prices and creates orders")
    Component(state, "Lifecycle state machine", "Domain service", "Legal transitions between order states")
    Component(repo, "Order repository", "Spring Data", "Persistence and optimistic locking")
    Component(pub, "Event publisher", "Kafka producer", "Outbox drain")
    Component(outbox, "Transactional outbox", "Domain service", "Writes events in the same transaction")
  }
  ContainerDb(db, "Orders database", "PostgreSQL")
  ContainerQueue(bus, "Event bus", "Kafka")
  Container(pay, "Payment service", "Java")
  Rel(rest, placer, "Delegates to")
  Rel(placer, state, "Asks for the next state")
  Rel(placer, repo, "Saves")
  Rel(placer, outbox, "Records the event")
  Rel(repo, db, "Reads and writes", "JDBC")
  Rel(outbox, db, "Same transaction as the order")
  Rel(pub, db, "Polls the outbox table")
  Rel(pub, bus, "Publishes")
  Rel(bus, pay, "Delivers order placed")` },

  { title: 'Streaming data platform — context', source: `C4Context
  title Data platform
  Person(analyst, "Analyst", "Builds dashboards and answers questions")
  Person(scientist, "Data scientist", "Trains and evaluates models")
  Person_Ext(dpo, "Data protection officer", "Approves data use")
  System(platform, "Data platform", "Ingestion, warehouse and serving")
  System_Ext(prod, "Production services", "Emit events and expose CDC streams")
  System_Ext(crm, "CRM", "Customer records")
  System_Ext(bi, "BI tool", "Dashboards and exploration")
  Rel(prod, platform, "Streams events and change data")
  Rel(crm, platform, "Nightly extract")
  Rel(platform, bi, "Serves modelled tables")
  Rel(analyst, bi, "Explores")
  Rel(scientist, platform, "Trains on curated datasets")
  Rel(dpo, platform, "Reviews the data catalogue")` },

  { title: 'Identity platform — containers', source: `C4Container
  title Identity platform
  Person(user, "End user")
  Person(admin, "Tenant admin")
  System_Boundary(idp, "Identity platform") {
    Container(login, "Login UI", "React", "Hosted sign-in and consent screens")
    Container(authz, "Authorisation server", "Go", "OAuth 2.1 and OIDC endpoints")
    Container(dir, "Directory service", "Go", "Users, groups and memberships")
    Container(sso, "SSO connector", "Go", "SAML and OIDC federation")
    ContainerDb(store, "Identity store", "PostgreSQL", "Users, credentials, sessions")
    ContainerDb(keys, "Key store", "HSM-backed KMS", "Signing keys, never exported")
  }
  System_Ext(app, "Relying application", "Consumes tokens")
  System_Ext(corp, "Corporate IdP", "Customer's own identity provider")
  Rel(user, login, "Signs in", "HTTPS")
  Rel(login, authz, "Posts credentials")
  Rel(authz, dir, "Looks up the user")
  Rel(authz, keys, "Signs tokens")
  Rel(authz, store, "Reads and writes sessions")
  Rel(sso, corp, "Federates to", "SAML or OIDC")
  Rel(authz, sso, "Delegates when SSO is enforced")
  Rel(app, authz, "Redeems codes, validates tokens")
  Rel(admin, dir, "Manages members and roles")` },

  { title: 'Video platform — containers', source: `C4Container
  title Video platform
  Person(viewer, "Viewer")
  Person(creator, "Creator")
  System_Boundary(video, "Video platform") {
    Container(web, "Web player", "TypeScript", "Adaptive bitrate playback")
    Container(upload, "Upload service", "Go", "Resumable uploads, virus scan")
    Container(transcode, "Transcode workers", "Rust", "Renditions and thumbnails")
    ContainerQueue(jobs, "Transcode queue", "SQS", "One message per rendition")
    Container(catalog, "Catalogue API", "Go", "Metadata and search")
    ContainerDb(meta, "Metadata store", "PostgreSQL")
    ContainerDb(objects, "Object storage", "S3", "Masters and renditions")
  }
  System_Ext(cdn, "CDN", "Edge delivery")
  Rel(creator, upload, "Uploads a master", "HTTPS")
  Rel(upload, objects, "Stores the master")
  Rel(upload, jobs, "Enqueues renditions")
  Rel(jobs, transcode, "Delivers work")
  Rel(transcode, objects, "Writes renditions")
  Rel(transcode, catalog, "Marks the asset ready")
  Rel(catalog, meta, "Reads and writes")
  Rel(viewer, web, "Watches")
  Rel(web, catalog, "Fetches metadata")
  Rel(web, cdn, "Streams segments")
  Rel(cdn, objects, "Pulls on miss")` },

  { title: 'Hospital records — context', source: `C4Context
  title Hospital records
  Person(clinician, "Clinician", "Reads and records care")
  Person(patient, "Patient", "Views their own record")
  Person_Ext(gp, "General practitioner", "Refers and receives discharge summaries")
  System(ehr, "Electronic health record", "Patient records, orders and results")
  System_Ext(lab, "Laboratory system", "Returns test results")
  System_Ext(imaging, "Imaging archive", "PACS")
  System_Ext(national, "National records exchange", "Shared summary care record")
  Rel(clinician, ehr, "Records care, orders tests")
  Rel(patient, ehr, "Views results and appointments")
  Rel(ehr, lab, "Sends orders, receives results", "HL7 v2")
  Rel(ehr, imaging, "Requests and displays studies", "DICOM")
  Rel(ehr, national, "Shares and retrieves summaries", "FHIR")
  Rel(gp, national, "Reads summaries")` },

  { title: 'Deployment — production topology', source: `C4Deployment
  title Production deployment
  Deployment_Node(edge, "Edge", "Global CDN") {
    Container(static, "Static assets", "CDN cache")
  }
  Deployment_Node(aws, "AWS eu-west-1", "Primary region") {
    Deployment_Node(eks, "EKS cluster", "Kubernetes 1.29") {
      Deployment_Node(zonea, "Availability zone A", "Three nodes") {
        Container(apia, "API pods", "Go", "Six replicas")
      }
      Deployment_Node(zoneb, "Availability zone B", "Three nodes") {
        Container(apib, "API pods", "Go", "Six replicas")
      }
    }
    Deployment_Node(rds, "RDS", "Multi-AZ") {
      ContainerDb(primary, "Primary", "PostgreSQL 16")
      ContainerDb(replica, "Read replica", "PostgreSQL 16")
    }
  }
  Deployment_Node(dr, "AWS eu-west-2", "Standby region") {
    ContainerDb(standby, "Warm standby", "PostgreSQL 16", "Streaming replication")
  }
  Rel(static, apia, "Proxies API calls")
  Rel(apia, primary, "Reads and writes")
  Rel(apib, primary, "Reads and writes")
  Rel(apia, replica, "Reads reports")
  Rel(primary, standby, "Streams WAL", "async")` },
]
