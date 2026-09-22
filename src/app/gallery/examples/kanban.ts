import type { Example } from './types'

export const kanban: Example[] = [
  { title: 'Sprint board', source: `kanban
  Backlog
    b1[Bulk CSV import]
    b2[Saved views]
    b3[Audit log export]
  Ready
    r1[Rate limit headers on every route]
    r2[Retry-After on 429]
  In progress
    p1[SAML SSO for enterprise tenants]
    p2[Fix export timeout on large accounts]
  In review
    v1[Idempotency keys on write endpoints]
  Done
    d1[Webhook signature verification]
    d2[Cursor pagination on /orders]` },

  { title: 'Incident follow-up', source: `kanban
  Identified
    i1[Pool sizing derived from measured hold time]
    i2[Alert on pool saturation, not just errors]
    i3[Load test with a cold cache]
  Owned
    o1[Runbook rewritten for order-service]
    o2[Rollback drill added to the on-call rota]
  In progress
    p1[Connection pool metrics exported]
  Verified
    v1[Status page automation]
    v2[Postmortem published]` },

  { title: 'Migration tracker', source: `kanban
  Not started
    n1[Legacy admin console]
    n2[Nightly reconciliation batch]
    n3[Partner SFTP importer]
  Containerised
    c1[Search service]
    c2[Notification worker]
  In staging
    s1[Catalogue service]
    s2[Order service]
  In production
    d1[API gateway]
    d2[Auth service]
  Decommissioned
    x1[Old CI runners]` },

  { title: 'Content pipeline', source: `kanban
  Ideas
    i1[Guide: choosing an idempotency key]
    i2[Case study: 40 percent latency cut]
  Outlined
    o1[Reference: webhook retries]
  Drafting
    d1[Quickstart rewrite]
  Review
    r1[Migration guide for API v2]
    r2[Security whitepaper]
  Published
    p1[Rate limiting explained]
    p2[Self-hosting guide]` },

  { title: 'Hiring pipeline', source: `kanban
  Applied
    a1[Backend engineer, 14 candidates]
  Screening
    s1[Backend engineer, 6 candidates]
    s2[Designer, 3 candidates]
  Technical interview
    t1[Backend engineer, 3 candidates]
  Final
    f1[Backend engineer, 1 candidate]
    f2[Designer, 1 candidate]
  Offer
    o1[Designer, offer out]
  Joined
    j1[Data engineer, starts Monday]` },

  { title: 'Security findings', source: `kanban
  Triage
    t1[Dependency CVE in the image base layer]
  Confirmed
    c1[Object-level authorisation missing on invoices]
    c2[Session not rotated after privilege change]
  Fixing
    f1[SSRF in the import feature]
  Awaiting retest
    r1[Leaked API keys rotated]
  Closed
    x1[Security headers added]
    x2[MFA enforced for admins]` },

  { title: 'Design system rollout', source: `kanban
  Audit
    a1[Inventory of one-off buttons]
    a2[Colour usage across the app]
  Tokenised
    t1[Spacing scale]
    t2[Type scale]
  Component built
    b1[Button]
    b2[Input and field]
    b3[Dialog]
  Adopted
    d1[Settings screens]
    d2[Onboarding]
  Legacy removed
    r1[Old modal implementation]` },

  { title: 'Support escalations', source: `kanban
  New
    n1[Export produces empty file, 3 tenants]
    n2[SSO loop after IdP change]
  Investigating
    i1[Slow search for one large tenant]
  Waiting on customer
    w1[Need HAR file for the login issue]
  Engineering
    e1[Timezone off by one on recurring events]
  Resolved
    d1[Invoice PDF missing VAT line]` },

  { title: 'Release checklist', source: `kanban
  Not ready
    n1[Changelog written]
    n2[Migration rehearsed]
  Ready
    r1[Feature flags default off]
    r2[Rollback tested]
  In flight
    f1[Canary at 5 percent]
  Verified
    v1[Error budget unaffected]
    v2[Support briefed]
  Complete
    c1[Flag cleaned up]` },

  { title: 'Research and discovery', source: `kanban
  Questions
    q1[Why do trials stall at import?]
    q2[Which integrations are asked for most?]
  Studies planned
    s1[Eight onboarding interviews]
  Running
    r1[Import usability sessions]
  Analysed
    a1[Pricing sensitivity survey]
  Acted on
    d1[Import wizard rebuilt]
    d2[Two integrations prioritised]` },
]
