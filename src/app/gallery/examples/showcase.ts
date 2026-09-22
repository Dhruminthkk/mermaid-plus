import type { Example } from './types'

/**
 * One diagram per headline capability, for demonstrating the tool rather than
 * the diagram type. Each one is a real system, and each one is chosen because
 * it needs the feature it is showing.
 */
export const showcase: Example[] = [
  { title: 'Collapse: a platform at two levels of detail', source: `flowchart LR
%%mp: group data collapsed
%%mp: group observability collapsed
  users[Customers] --> cdn[CDN]
  cdn --> gw[API Gateway]
  gw --> auth[Auth Service]
  gw --> orders[Order Service]
  gw --> catalog[Catalog Service]
  gw --> search[Search Service]
  subgraph data [Data Platform]
    orders --> odb[(Orders DB)]
    orders --> ocache[(Orders Cache)]
    catalog --> cdb[(Catalog DB)]
    search --> es[(Search Index)]
    auth --> udb[(Users DB)]
    odb --> etl[ETL Worker]
    cdb --> etl
    etl --> lake[S3 Data Lake]
  end
  subgraph observability [Observability]
    auth --> logs[Log Collector]
    orders --> logs
    catalog --> logs
    search --> logs
    logs --> metrics[Metrics Store]
    metrics --> dash[Dashboards]
  end
  orders --> q{{Order Events}}
  q --> fulfil[Fulfilment Worker]
  q --> notify[Notification Service]
  notify --> email[Email Provider external]
%%mp: group data note="Collapsed groups become one node. The edges that crossed the boundary bundle together and carry a count."
%%mp: node gw note="Click the group title to expand it, or the collapsed node to open it in place."` },

  { title: 'Walkthrough: how an order is placed', source: `flowchart LR
%%mp: step 1 title="A shopper arrives" focus=shopper,cdn note="Most catalogue reads never travel further than the edge cache."
%%mp: step 2 title="Into the platform" focus=gw,orders note="The gateway authenticates, rate limits, and routes. Nothing else is public."
%%mp: step 3 title="Money is held, not taken" focus=payments,psp note="Authorisation reserves the funds. Capture waits until the parcel is dispatched."
%%mp: step 4 title="Everything else is asynchronous" focus=events,fulfil,notify note="The shopper's request returns as soon as the order exists. The rest happens on the bus."
%%mp: step 5 title="The whole picture"
  shopper[Shopper] --> cdn[CDN]
  cdn --> gw[API Gateway]
  gw --> orders[Order Service]
  orders --> odb[(Orders DB)]
  orders --> payments[Payment Service]
  payments --> psp[Stripe external]
  orders --> events{{Order Events}}
  events -.-> fulfil[Fulfilment Worker]
  events -.-> notify[Notification Service]
  notify -.-> email[SendGrid external]
  fulfil --> wms[(Warehouse System)]` },

  { title: 'Notes and metadata: who owns what', source: `flowchart TD
  gw[API Gateway] --> auth[Auth Service]
  gw --> orders[Order Service]
  orders --> ledger[(Ledger)]
  orders --> psp[Adyen external]
  auth --> idp[Okta external]
  orders --> events{{Order Events}}
  events --> recon[Reconciliation Job]
  recon --> ledger
%%mp: node gw note="Terminates TLS, authenticates, and rate limits per tenant. Every public request enters here." owner="Platform" oncall="platform-oncall" sla="99.99%"
%%mp: node orders note="Owns the order lifecycle. The only writer to the orders schema." owner="Commerce" tier="1" sla="99.95%"
%%mp: node ledger note="Double-entry. Every row is immutable once written." owner="Finance Eng" retention="7 years"
%%mp: node psp note="Third party. Card data never reaches our systems." owner="Commerce" vendor="Adyen"
%%mp: node recon note="Nightly. Compares provider settlements against the ledger and raises a ticket on any difference." owner="Finance Eng" schedule="02:00 UTC"
%%mp: edge orders->psp note="Authorise only. Capture happens from the fulfilment worker." semantics=async` },

  { title: 'Icons and archetypes: a system that reads itself', source: `flowchart LR
  browser[Browser] --> cdn[Cloudflare CDN]
  cdn --> gw[Kong API Gateway]
  gw --> auth[Auth Service]
  gw --> api[Orders API]
  api --> pg[(PostgreSQL)]
  api --> redis[(Redis Cache)]
  api --> kafka{{Kafka}}
  kafka --> worker[Fulfilment Worker]
  worker --> s3[S3 Bucket]
  worker --> ses[Amazon SES external]
  api --> elastic[(Elasticsearch)]
  auth --> vault[HashiCorp Vault]
  worker --> k8s[Kubernetes Jobs]
%%mp: node browser archetype=user
%%mp: node cdn note="Shapes, colours and icons are inferred from the label and the mermaid shape. Nothing here is annotated by hand except this note."` },

  { title: 'Motion: the flow through a payments system', source: `flowchart LR
  gw[API Gateway] --> orders[Order Service]
  orders --> auth[Authorisation]
  auth --> psp[Card network external]
  psp --> capture[Capture Worker]
  capture --> ledger[(Ledger)]
  orders --> events{{Payment Events}}
  events -.-> receipts[Receipt Service]
  events -.-> risk[Risk Scoring]
  events -.-> analytics[(Analytics)]
  risk -.-> review[Manual Review Queue]
  capture --> events
%%mp: node gw note="The highlight travels in dependency order: an edge lights as the one feeding it lands, so the pulse walks the system the way a request does."
%%mp: node review note="Click any node to leave only its neighbourhood moving."` },

  { title: 'Focus at scale: a 60-service estate', source: `flowchart LR
%%mp: layout direction=RIGHT
  edge[Edge] --> gw[Gateway]
  gw --> auth[Auth] & profile[Profile] & catalog[Catalog] & search[Search] & orders[Orders] & cart[Cart]
  orders --> pricing[Pricing] & tax[Tax] & payments[Payments] & inventory[Inventory]
  payments --> psp1[PSP primary external] & psp2[PSP fallback external] & ledger[(Ledger)]
  inventory --> wms[Warehouse] & reservations[(Reservations)]
  catalog --> media[Media] & recommendations[Recommendations]
  search --> indexer[Indexer] --> index[(Search index)]
  orders --> events{{Order events}}
  events -.-> fulfil[Fulfilment] & notify[Notifications] & analytics[(Analytics)] & fraud[Fraud]
  notify -.-> email[Email external] & sms[SMS external] & push[Push external]
  fulfil --> labels[Label printing] & carriers[Carrier API external]
  profile --> pdb[(Profiles)]
  cart --> cartstore[(Cart store)]
  pricing --> promo[Promotions] --> promodb[(Promotions)]
  fraud --> rules[Rule engine] --> risk[(Risk store)]
%%mp: node payments note="Type a name into Find node, or select a node and set the focus radius, to keep only what matters."` },

  { title: 'Edges that mean something', source: `flowchart TD
  client[Client] -->|synchronous| api[API]
  api -.->|asynchronous| queue{{Work queue}}
  queue -.-> worker[Worker]
  worker ==>|high volume| warehouse[(Warehouse)]
  api --> cache[(Cache)]
  cache -.->|invalidation| api
  worker -->|writes| audit[(Audit log)]
  api -->|reads| audit
  admin[Admin console] --> api
  admin -->|direct, break-glass| warehouse
%%mp: edge admin->warehouse semantics=dependency note="Emergency access only. Every use is alerted on and reviewed the next working day."
%%mp: edge worker->warehouse note="Batched every 30 seconds. A single row write here would cost more than the query it serves."
%%mp: node queue note="Dashed edges are indirect. Thick edges carry volume. The legend, one button away, is built from the shapes this diagram actually uses."` },

  { title: 'Nested boundaries: C4 containers', source: `C4Container
  title Checkout, container view
  Person(shopper, "Shopper", "Buys things")
  System_Boundary(shop, "Retail platform") {
    Container(web, "Storefront", "Next.js", "Server-rendered catalogue and checkout")
    Container(bff, "Checkout BFF", "TypeScript", "Aggregates for one screen")
    Container(cart, "Cart service", "Go", "Cart state and pricing")
    Container(order, "Order service", "Java", "Order lifecycle")
    Container(pay, "Payment service", "Java", "Holds no card data")
    ContainerQueue(bus, "Event bus", "Kafka", "Order and payment events")
    ContainerDb(orders, "Orders database", "PostgreSQL")
    ContainerDb(carts, "Cart store", "Redis", "30 day TTL")
  }
  System_Ext(psp, "Payment provider", "Card processing")
  Rel(shopper, web, "Uses", "HTTPS")
  Rel(web, bff, "Calls")
  Rel(bff, cart, "Reads and updates")
  Rel(bff, order, "Places the order")
  Rel(cart, carts, "Reads and writes")
  Rel(order, orders, "Reads and writes")
  Rel(order, bus, "Publishes")
  Rel(pay, bus, "Consumes and publishes")
  Rel(pay, psp, "Authorises and captures", "HTTPS")` },

  { title: 'Compartments: a domain model that fits', source: `classDiagram
  class Order {
    +UUID id
    +OrderStatus status
    +Money total
    +Instant placedAt
    +place(Cart) Order
    +cancel(Reason) void
    +capture() Payment
  }
  class OrderLine {
    +UUID sku
    +int quantity
    +Money unitPrice
    +Money subtotal()
  }
  class Payment {
    +UUID id
    +Money amount
    +PaymentStatus status
    +capture() void
    +refund(Money) Refund
  }
  class Shipment {
    +UUID id
    +String carrier
    +String tracking
    +markDelivered() void
  }
  class Customer {
    +UUID id
    +String email
    +placeOrder(Cart) Order
  }
  Customer "1" --> "*" Order : places
  Order "1" *-- "1..*" OrderLine : contains
  Order "1" --> "0..1" Payment : settled by
  Order "1" --> "*" Shipment : fulfilled by` },

  { title: 'Every tier-2 kind, themed the same', tier: 2, source: `sequenceDiagram
  autonumber
  actor U as User
  participant A as App
  participant I as Identity provider
  participant R as Resource API
  U->>A: Sign in
  A->>I: /authorize with PKCE challenge
  I-->>A: Authorisation code
  A->>I: /token with the verifier
  I-->>A: Access and refresh tokens
  A->>R: Request with the bearer token
  R->>I: Fetch JWKS (cached)
  R-->>A: 200
  Note over A,I: Sequence, gantt, pie, journey, git, sankey and the rest<br/>are drawn by mermaid.js wearing the same theme,<br/>so every diagram in a document matches.` },
]
