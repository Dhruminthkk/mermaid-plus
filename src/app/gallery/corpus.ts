export interface CorpusEntry {
  title: string
  source: string
}

/** Deterministic tree-with-back-edges flowchart of exactly `n` nodes. */
export function stressFlowchart(n: number): string {
  const lines = ['flowchart TD']
  for (let i = 0; i < n; i++) {
    const kind = i % 6
    const label = kind === 0 ? `Service ${i}` : kind === 3 ? `DB ${i}` : kind === 5 ? `Queue ${i}` : `Step ${i}`
    const shape = kind === 3 ? `[(${label})]` : kind === 5 ? `{{${label}}}` : `[${label}]`
    lines.push(`  n${i}${shape}`)
    if (i > 0) lines.push(`  n${Math.floor((i - 1) / 2)} --> n${i}`)
    if (i % 9 === 8) lines.push(`  n${i} --> n${Math.max(0, i - 11)}`)
  }
  return lines.join('\n')
}

export const CORPUS: Record<string, CorpusEntry> = {
  basic: {
    title: 'Basic chain',
    source: `flowchart TD
  a[Start] --> b[Process]
  b --> c{Valid?}
  c -->|yes| d[Done]
  c -->|no| b`,
  },
  shapes: {
    title: 'Every archetype',
    source: `flowchart LR
  svc[Auth Service] --> db[(Postgres)]
  svc --> q{{Kafka Topic}}
  usr([End User]) --> svc
  ext[Stripe API external] --> svc
  svc --> s3[S3 Bucket]
  svc --> dec{Retry?}
  dec --> note>Note: idempotent]
  dec --> plain[Plain step]`,
  },
  subgraphs: {
    title: 'Nested groups',
    source: `flowchart TB
  client[Client] --> lb[Load Balancer]
  subgraph cluster [Kubernetes Cluster]
    lb --> a1[API Pod 1]
    lb --> a2[API Pod 2]
    subgraph data [Data Tier]
      a1 --> pg[(Postgres)]
      a2 --> pg
      a1 --> redis[(Redis Cache)]
    end
  end
  pg --> backup[S3 Backups]`,
  },
  labels: {
    title: 'Edge labels and styles',
    source: `flowchart LR
  a[Producer] -->|publish| b{{Topic}}
  b -.->|consume| c[Consumer A]
  b ==>|consume| d[Consumer B]
  c -->|ack<br/>async| b
  d --> e[(Store)]`,
  },
  architecture: {
    title: 'Showcase: e-commerce platform',
    source: `flowchart LR
%%mp: node api archetype=service
%%mp: node api note="Every request enters here. Terminates TLS, authenticates, and rate limits per tenant."
%%mp: node cdn note="Serves static assets and caches catalogue reads for 60 seconds."
%%mp: node q note="Order events fan out to fulfilment and notifications. At-least-once, so consumers must be idempotent." owner="Platform"
%%mp: node cache note="Read-through cache in front of the catalogue database." owner="Catalog"
%%mp: edge api->orders note="Synchronous. Falls back to a queued write if the order service is unhealthy."
%%mp: group async note="Everything here is off the request path."
  user[Browser Client] -->|HTTPS| cdn[CDN]
  cdn --> api[API Gateway]
  api --> auth[Auth Service]
  api --> orders[Order Service]
  api --> catalog[Catalog Service]
  auth --> udb[(User DB)]
  orders --> odb[(Orders DB)]
  catalog --> cache[(Redis Cache)]
  catalog --> cdb[(Catalog DB)]
  orders --> q{{Order Events}}
  q --> worker[Fulfilment Worker]
  q --> notify[Notification Service]
  worker --> s3[S3 Bucket]
  notify --> email[Email Provider external]
  subgraph edge [Edge]
    cdn
    api
  end
  subgraph platform [Platform Services]
    auth
    orders
    catalog
  end
  subgraph async [Async Processing]
    q
    worker
    notify
  end`,
  },
  sequence: {
    title: 'Tier 2: sequence',
    source: `sequenceDiagram
  autonumber
  participant U as User
  participant A as API
  participant D as Postgres
  U->>A: POST /orders
  activate A
  A->>D: INSERT order
  D-->>A: ok
  A-->>U: 201 Created
  deactivate A
  Note over A,D: Idempotent on retry`,
  },
  pie: {
    title: 'Tier 2: pie',
    source: `pie title Traffic by region
  "EU" : 42
  "US" : 35
  "APAC" : 23`,
  },
  gantt: {
    title: 'Tier 2: gantt',
    source: `gantt
  title Release plan
  dateFormat YYYY-MM-DD
  section Build
    Renderer      :done, r1, 2026-09-01, 5d
    Themes        :active, r2, after r1, 4d
  section Ship
    Exports       :r3, after r2, 3d
    Launch        :milestone, m1, after r3, 0d`,
  },
  class: {
    title: 'Class diagram',
    source: `classDiagram
  direction LR
  class Order {
    +UUID id
    +Money total
    +place() void
    +cancel(reason) void
  }
  class LineItem {
    +SKU sku
    +int qty
  }
  class Payment {
    <<interface>>
    +charge(amount) Receipt
  }
  class CardPayment
  Order "1" *-- "1..*" LineItem : contains
  Order o-- Payment : paid by
  Payment <|.. CardPayment
  Order ..> Inventory : reserves
  namespace Billing {
    class Invoice
  }
  Order --> Invoice : bills`,
  },
  er: {
    title: 'Entity relationships',
    source: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "appears in"
  CUSTOMER {
    uuid id PK
    string email
    string name
  }
  ORDER {
    uuid id PK
    uuid customer_id FK
    timestamp created
  }
  LINE_ITEM {
    int qty
    money price
  }
  PRODUCT {
    uuid id PK
    string sku
  }`,
  },
  mindmap: {
    title: 'Mindmap',
    source: `mindmap
  root((Mermaid Plus))
    Rendering
      ELK layout
      SVG renderer
      Sketch texture
    Themes
      Clean
      Slate
      Blueprint
    Diagrams
      Flowchart
      Class
      State
    Export
      SVG
      PNG
      PDF`,
  },
  requirement: {
    title: 'Requirements',
    source: `requirementDiagram
  requirement fast_render {
    id: R1
    text: Render 200 nodes under 1s.
    risk: medium
    verifymethod: test
  }
  performanceRequirement offthread {
    id: R2
    text: Layout never blocks typing.
    risk: high
    verifymethod: demonstration
  }
  element elk_worker {
    type: module
  }
  element perf_spec {
    type: spec
    docref: e2e/perf.spec.ts
  }
  elk_worker - satisfies -> offthread
  perf_spec - verifies -> fast_render
  offthread - refines -> fast_render`,
  },
  c4: {
    title: 'C4 context',
    source: `C4Context
  title Order platform
  Person(shopper, "Shopper", "Buys things")
  Enterprise_Boundary(shop, "Shop") {
    System(web, "Storefront", "Next.js app")
    System(api, "Order API", "Go service")
    SystemDb(db, "Orders DB", "Postgres")
    SystemQueue(events, "Order events", "Kafka")
  }
  System_Ext(psp, "Payment provider", "Stripe")
  System_Ext(mail, "Email", "SendGrid")
  Rel(shopper, web, "Uses", "HTTPS")
  Rel(web, api, "Calls", "JSON")
  Rel(api, db, "Reads/writes")
  Rel(api, events, "Publishes")
  Rel(api, psp, "Charges", "HTTPS")
  Rel(events, mail, "Triggers")`,
  },
  state: {
    title: 'State machine',
    source: `stateDiagram-v2
  [*] --> Idle
  Idle --> Running : start
  state Running {
    [*] --> Fetching
    Fetching --> Rendering : layout ready
    Rendering --> Fetching : source changed
  }
  Running --> Paused : pause
  Paused --> Running : resume
  Running --> Done : finish
  state check <<choice>>
  Done --> check
  check --> [*] : ok
  check --> Idle : retry
  note right of Paused : Layout result is kept`,
  },
  walkthrough: {
    title: 'Walkthrough: a request end to end',
    source: `flowchart LR
%%mp: step 1 title="A shopper arrives" focus=user,cdn note="The browser hits the CDN first. Most catalogue reads never travel further than this."
%%mp: step 2 title="Into the platform" focus=cdn,gw,auth note="A cache miss reaches the gateway, which terminates TLS and authenticates the request."
%%mp: step 3 title="Placing the order" focus=gw,orders,odb note="The order service writes synchronously, so the shopper sees a confirmed order before the response returns."
%%mp: step 4 title="Everything else is async" focus=async note="Fulfilment and notifications happen off the request path, driven by events."
%%mp: step 5 title="The whole picture" note="Synchronous on the left, asynchronous on the right. The queue is the seam between them."
%%mp: node gw note="Terminates TLS, authenticates, and rate limits per tenant."
%%mp: node q note="At-least-once delivery, so every consumer must be idempotent."
  user[Browser Client] --> cdn[CDN]
  cdn --> gw[API Gateway]
  gw --> auth[Auth Service]
  gw --> orders[Order Service]
  orders --> odb[(Orders DB)]
  orders --> q{{Order Events}}
  subgraph async [Async Processing]
    q --> fulfil[Fulfilment Worker]
    q --> notify[Notification Service]
    notify --> email[Email Provider external]
  end`,
  },
  'stress-200': {
    title: 'Stress: 200 nodes',
    source: stressFlowchart(200),
  },
  'stress-500': {
    title: 'Stress: 500 nodes',
    source: stressFlowchart(500),
  },
  platform: {
    title: 'Showcase: platform with collapsed groups',
    source: `flowchart LR
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
  notify --> email[Email Provider external]`,
  },
}
