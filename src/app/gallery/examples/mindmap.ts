import type { Example } from './types'

export const mindmap: Example[] = [
  { title: 'System design interview', source: `mindmap
  root((Design a URL shortener))
    Requirements
      Functional
        Shorten a long URL
        Redirect within 50ms
        Custom aliases
        Expiry dates
      Non-functional
        100M writes per month
        10:1 read to write
        99.99% availability
        Redirects never wrong
    Data model
      id to long_url
      Base62 of a counter
      Or hash plus collision check
      Metadata: owner, created_at, expires_at
    Storage
      Key-value store
      Cache the hot 20%
      Cold rows to object storage
    Traffic
      CDN at the edge
      301 versus 302
      Rate limit per API key
    Failure
      Cache stampede
      Counter service outage
      Hot key on a viral link
    Analytics
      Async click events
      Aggregate hourly
      Never on the redirect path` },

  { title: 'Service ownership review', source: `mindmap
  root((Payments platform))
    Services
      Authorisation API
        Owner: Payments core
        Tier 1
      Capture worker
        Owner: Payments core
        Tier 1
      Refund service
        Owner: Payments core
        Tier 2
      Reconciliation job
        Owner: Finance eng
        Tier 2
    Dependencies
      Card networks
      Two PSPs
      Fraud scoring
      Ledger
    Risks
      Single PSP for wallets
      Reconciliation is a nightly batch
      No load test since March
    In flight
      Second PSP for wallets
      Move reconciliation to streaming
      Idempotency keys everywhere` },

  { title: 'Quarterly planning', source: `mindmap
  root((Q3 objectives))
    Reliability
      Cut p99 checkout latency to 400ms
      Error budget policy adopted by every tier-1 team
      Chaos day each month
    Growth
      Self-serve onboarding
      Annual billing
      Two new locales
    Platform
      Kill the legacy monolith deploy path
      One CI pipeline for all repos
      Secrets rotation automated
    Cost
      30% off the data warehouse bill
      Right-size the staging cluster
      Drop the unused CDN region
    Explicitly not doing
      Mobile rewrite
      New CRM
      On-prem deployments` },

  { title: 'Incident postmortem', source: `mindmap
  root((Checkout outage, 4 Sept))
    Impact
      47 minutes
      12% of checkouts failed
      Roughly 90k of lost orders
    Timeline
      14:02 deploy of order-service
      14:06 error rate crosses SLO
      14:09 page fires
      14:14 acknowledged
      14:31 rolled back
      14:49 recovered
    Causes
      Connection pool sized for the old query
      New query holds the connection 6x longer
      Load test used a warm cache
    What went well
      Rollback took four minutes
      Status page updated within ten
    Action items
      Pool sizing derived from measured hold time
      Load test with a cold cache
      Alert on pool saturation, not just errors` },

  { title: 'Frontend architecture decisions', source: `mindmap
  root((Web client))
    Rendering
      Server components for the shell
      Client islands for the editor
      No hydration on marketing pages
    State
      Server state via query cache
      URL as the source of truth for filters
      Local state stays local
    Styling
      Design tokens as CSS variables
      No runtime CSS-in-JS
      Dark mode from tokens, not duplicates
    Data
      One typed client generated from the schema
      Optimistic updates only where undo exists
    Performance budget
      170KB JS on first load
      LCP under 2s on a 4G phone
      No third-party script on the critical path` },

  { title: 'Database migration plan', source: `mindmap
  root((Postgres 12 to 16))
    Preparation
      Inventory extensions
      Check deprecated syntax
      Snapshot query plans
    Strategy
      Logical replication
      Cut over with a short read-only window
      Rollback by promoting the old primary
    Risks
      Collation change reorders text indexes
      Extension version gaps
      Replication lag under batch load
    Verification
      Row counts per table
      Checksum sample of large tables
      Replay a day of production queries
    Aftercare
      ANALYZE everything
      Watch plan regressions for a week
      Drop the old cluster after 14 days` },

  { title: 'API design review', source: `mindmap
  root((Public API v2))
    Resources
      Orders
      Shipments
      Refunds
      Webhooks
    Conventions
      Cursor pagination everywhere
      RFC 9457 problem details
      Idempotency-Key on every write
      ISO 8601 in UTC
    Versioning
      Date-based versions
      Two years of support
      Deprecation headers first
    Auth
      OAuth client credentials
      Scopes per resource and action
      Keys scoped to one environment
    Rate limits
      Per key, per route class
      Burst plus sustained
      Retry-After on 429` },

  { title: 'Security review checklist', source: `mindmap
  root((Pre-launch security review))
    Identity
      MFA available and enforceable
      Session fixation tested
      Password reset does not leak accounts
    Authorisation
      Every endpoint checks the tenant
      Object-level checks, not just route-level
      Admin actions audited
    Data
      PII columns catalogued
      Encryption at rest and in transit
      Backups restore-tested
    Supply chain
      Lockfiles committed
      Dependencies scanned in CI
      Images signed and verified
    Operations
      Secrets out of environment dumps
      Least-privilege IAM roles
      Break-glass access is logged and alerted` },

  { title: 'Onboarding a new engineer', source: `mindmap
  root((First two weeks))
    Day one
      Accounts and hardware
      Buddy assigned
      Read the architecture overview
    Week one
      Run the stack locally
      Ship a one-line change to production
      Shadow a support rotation
    Week two
      Take a small bug end to end
      Join a design review
      Write down everything that confused you
    Reference
      Runbooks
      Architecture decision records
      Who owns what
    Success looks like
      Deployed without help
      Knows where to ask
      Filed at least one docs fix` },

  { title: 'Cost reduction programme', source: `mindmap
  root((Cloud spend))
    Compute
      Right-size over-provisioned nodes
      Spot instances for batch
      Kill idle staging overnight
    Storage
      Lifecycle rules to cold tiers
      Delete orphaned snapshots
      Compress cold logs
    Data
      Partition the largest tables
      Materialise the top ten dashboards
      Sample high-cardinality traces
    Network
      Keep chatty services in one zone
      CDN in front of static assets
      Reduce cross-region replication
    Governance
      Every resource carries an owner tag
      Monthly review with each team
      Budget alerts at 60, 80 and 100 percent` },
]
