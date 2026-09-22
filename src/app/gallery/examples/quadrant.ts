import type { Example } from './types'

export const quadrant: Example[] = [
  { title: 'Technical debt triage', source: `quadrantChart
  title Technical debt: pain against effort
  x-axis Low effort --> High effort
  y-axis Low pain --> High pain
  quadrant-1 Plan properly
  quadrant-2 Do next
  quadrant-3 Leave it
  quadrant-4 Quick wins
  Flaky checkout tests: [0.22, 0.85]
  No index on reviews: [0.12, 0.78]
  Monolith deploy path: [0.88, 0.82]
  Hand-rolled auth: [0.80, 0.70]
  Duplicated date parsing: [0.28, 0.30]
  Unused feature flags: [0.15, 0.22]
  Warehouse cost model: [0.65, 0.45]
  Legacy admin console: [0.72, 0.28]` },

  { title: 'Feature prioritisation', source: `quadrantChart
  title Reach against effort
  x-axis Small --> Large
  y-axis Few customers --> Many customers
  quadrant-1 Big bets
  quadrant-2 Ship now
  quadrant-3 Say no
  quadrant-4 Fill-in work
  Bulk import: [0.55, 0.72]
  Saved views: [0.20, 0.68]
  Audit log export: [0.30, 0.35]
  SAML SSO: [0.62, 0.55]
  Mobile app: [0.92, 0.60]
  Dark mode: [0.25, 0.48]
  Custom domains: [0.45, 0.25]
  Offline mode: [0.85, 0.18]` },

  { title: 'Vendor selection', source: `quadrantChart
  title Payment providers
  x-axis Narrow coverage --> Broad coverage
  y-axis Hard to integrate --> Easy to integrate
  quadrant-1 Shortlist
  quadrant-2 Good for one market
  quadrant-3 Discard
  quadrant-4 Worth the work
  Provider A: [0.82, 0.78]
  Provider B: [0.74, 0.45]
  Provider C: [0.35, 0.80]
  Provider D: [0.30, 0.35]
  Provider E: [0.60, 0.62]
  Incumbent: [0.55, 0.88]` },

  { title: 'Service reliability review', source: `quadrantChart
  title Tier-1 services
  x-axis Rarely changes --> Changes daily
  y-axis Low blast radius --> High blast radius
  quadrant-1 Invest in safety
  quadrant-2 Guard carefully
  quadrant-3 Leave alone
  quadrant-4 Watch the change rate
  Order service: [0.78, 0.88]
  Payment service: [0.55, 0.92]
  Search: [0.72, 0.35]
  Catalogue: [0.60, 0.45]
  Auth: [0.30, 0.90]
  Notification worker: [0.65, 0.25]
  Reporting batch: [0.18, 0.20]` },

  { title: 'Skills and interest', source: `quadrantChart
  title Team growth map
  x-axis Low interest --> High interest
  y-axis Low skill --> High skill
  quadrant-1 Give them the hard problems
  quadrant-2 Keep it maintained
  quadrant-3 Buy or train
  quadrant-4 Pair and grow
  Kubernetes: [0.75, 0.40]
  Postgres tuning: [0.35, 0.72]
  Frontend performance: [0.82, 0.68]
  Security review: [0.30, 0.30]
  Data modelling: [0.60, 0.55]
  Incident command: [0.55, 0.25]` },

  { title: 'Content performance', source: `quadrantChart
  title Documentation pages
  x-axis Low traffic --> High traffic
  y-axis Poor rating --> Good rating
  quadrant-1 Keep fresh
  quadrant-2 Hidden gems
  quadrant-3 Retire
  quadrant-4 Fix first
  Quickstart: [0.92, 0.80]
  Authentication: [0.78, 0.32]
  Webhooks: [0.62, 0.28]
  Rate limits: [0.55, 0.20]
  SDK reference: [0.70, 0.72]
  Self-hosting: [0.18, 0.75]
  Legacy v1 guide: [0.22, 0.25]` },

  { title: 'Risk register', source: `quadrantChart
  title Operational risks
  x-axis Unlikely --> Likely
  y-axis Minor impact --> Severe impact
  quadrant-1 Mitigate now
  quadrant-2 Prepare a plan
  quadrant-3 Accept
  quadrant-4 Monitor
  Single payment provider: [0.45, 0.90]
  Certificate expiry: [0.62, 0.70]
  Regional outage: [0.25, 0.95]
  Key person dependency: [0.55, 0.60]
  Third-party licence change: [0.30, 0.35]
  Laptop loss: [0.70, 0.20]` },

  { title: 'Experiment results', source: `quadrantChart
  title Completed experiments
  x-axis Low confidence --> High confidence
  y-axis Negative effect --> Positive effect
  quadrant-1 Ship it
  quadrant-2 Rerun with more traffic
  quadrant-3 Investigate the harm
  quadrant-4 Discard
  One-click checkout: [0.88, 0.82]
  Sticky basket bar: [0.72, 0.62]
  Free delivery banner: [0.55, 0.55]
  Longer trial: [0.35, 0.68]
  Aggressive upsell modal: [0.80, 0.18]
  Autoplay video: [0.62, 0.22]` },

  { title: 'Customer segments', source: `quadrantChart
  title Segments by value and effort
  x-axis Low support cost --> High support cost
  y-axis Low revenue --> High revenue
  quadrant-1 Serve deliberately
  quadrant-2 Protect
  quadrant-3 Automate
  quadrant-4 Reprice or exit
  Enterprise, self-serve: [0.30, 0.88]
  Enterprise, hands-on: [0.85, 0.90]
  Mid-market: [0.45, 0.58]
  Startups: [0.35, 0.28]
  Education: [0.60, 0.15]
  Agencies: [0.72, 0.42]` },

  { title: 'Build versus buy', source: `quadrantChart
  title Capability decisions
  x-axis Commodity --> Differentiating
  y-axis Cheap to buy --> Expensive to buy
  quadrant-1 Build
  quadrant-2 Build if it is cheap
  quadrant-3 Buy
  quadrant-4 Buy and integrate well
  Auth and SSO: [0.25, 0.35]
  Billing: [0.30, 0.72]
  Search ranking: [0.85, 0.55]
  Feature flags: [0.35, 0.25]
  Observability: [0.20, 0.80]
  Pricing engine: [0.90, 0.30]
  Email delivery: [0.12, 0.20]` },
]
