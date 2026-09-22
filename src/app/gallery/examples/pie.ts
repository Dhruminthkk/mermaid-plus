import type { Example } from './types'

export const pie: Example[] = [
  { title: 'Cloud spend by service', source: `pie showData title Monthly cloud spend
  "Compute (EKS)" : 42800
  "Managed Postgres" : 18600
  "Object storage" : 9400
  "Data transfer" : 7100
  "Observability" : 6800
  "Managed Kafka" : 5200
  "Everything else" : 3900` },

  { title: 'Where the p99 goes', source: `pie showData title Checkout p99 latency budget, milliseconds
  "Reviews query" : 620
  "Product query" : 180
  "Auth introspection" : 95
  "Tax service call" : 70
  "Serialisation" : 40
  "Network hops" : 35` },

  { title: 'Incident causes this year', source: `pie showData title Root causes across 47 incidents
  "Configuration change" : 14
  "Bad deploy" : 11
  "Capacity exhausted" : 8
  "Third-party outage" : 6
  "Expired certificate" : 4
  "Data corruption" : 3
  "Unknown" : 1` },

  { title: 'Support tickets by area', source: `pie showData title Support tickets, last 30 days
  "Billing and invoices" : 412
  "Login and access" : 388
  "Import and export" : 205
  "Integrations" : 164
  "Performance" : 97
  "Feature requests" : 88` },

  { title: 'Test suite runtime', source: `pie showData title CI pipeline minutes per run
  "End-to-end" : 18
  "Integration" : 11
  "Unit" : 4
  "Build and package" : 6
  "Container scan" : 3
  "Lint and typecheck" : 2` },

  { title: 'Traffic by client', source: `pie showData title Requests by client, weekday average
  "iOS app" : 3820000
  "Android app" : 3110000
  "Web" : 2450000
  "Partner API" : 940000
  "Internal tools" : 210000
  "Crawlers" : 130000` },

  { title: 'Storage by data class', source: `pie showData title Warehouse storage, terabytes
  "Raw events" : 184
  "Staging models" : 62
  "Core marts" : 41
  "Snapshots" : 28
  "Exports and archives" : 17` },

  { title: 'Engineering time', source: `pie showData title Where the quarter went, engineer-weeks
  "Roadmap features" : 128
  "Reliability and on-call" : 46
  "Bug fixes" : 34
  "Migration work" : 30
  "Interviews and onboarding" : 18
  "Meetings and planning" : 16` },

  { title: 'Revenue by plan', source: `pie showData title Annual recurring revenue by plan
  "Enterprise" : 4820000
  "Business" : 2140000
  "Team" : 860000
  "Starter" : 190000` },

  { title: 'Dependency licences', source: `pie showData title Direct dependencies by licence
  "MIT" : 214
  "Apache-2.0" : 63
  "BSD-3-Clause" : 28
  "ISC" : 19
  "MPL-2.0" : 6
  "EPL-2.0" : 2` },
]
