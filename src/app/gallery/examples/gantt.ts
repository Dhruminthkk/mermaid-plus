import type { Example } from './types'

export const gantt: Example[] = [
  { title: 'Platform migration to Kubernetes', source: `gantt
  title Platform migration to Kubernetes
  dateFormat YYYY-MM-DD
  axisFormat %b %d
  excludes weekends

  section Foundations
  Cluster provisioning        :done, k1, 2026-01-05, 10d
  Network policy and mTLS     :done, k2, after k1, 8d
  Secrets management          :active, k3, after k2, 6d
  Observability stack         :k4, after k2, 10d

  section First service
  Containerise the API        :done, s1, 2026-01-12, 8d
  Staging deploy              :s2, after s1 k3, 4d
  Load test against staging   :s3, after s2, 3d
  Production canary           :crit, s4, after s3 k4, 5d

  section Rest of the estate
  Batch jobs                  :b1, after s4, 15d
  Internal tools              :b2, after s4, 12d
  Legacy monolith             :crit, b3, after b1, 25d

  section Decommission
  Freeze the old platform     :milestone, m1, after b3, 0d
  Drain and delete            :d1, after m1, 10d` },

  { title: 'Product launch', source: `gantt
  title Autumn launch
  dateFormat YYYY-MM-DD
  axisFormat %d %b

  section Discovery
  Customer interviews     :done, d1, 2026-02-02, 12d
  Concept testing         :done, d2, after d1, 8d
  Pricing research        :done, d3, after d1, 10d

  section Build
  Design system updates   :done, b1, 2026-02-23, 10d
  Onboarding flow         :active, b2, after b1, 15d
  Billing integration     :active, b3, after b1, 18d
  Admin console           :b4, after b2, 12d

  section Go to market
  Positioning and copy    :g1, 2026-03-16, 10d
  Launch site             :g2, after g1, 8d
  Sales enablement        :g3, after g1, 12d
  Press briefings         :g4, after g2, 5d

  section Launch
  Feature freeze          :milestone, m1, after b4, 0d
  Beta to 200 customers   :crit, l1, after m1, 10d
  Public launch           :milestone, m2, after l1 g4, 0d` },

  { title: 'Security audit remediation', source: `gantt
  title Penetration test remediation
  dateFormat YYYY-MM-DD
  axisFormat %b %d

  section Critical
  Fix IDOR on invoices        :crit, done, c1, 2026-04-06, 3d
  Rotate leaked API keys      :crit, done, c2, 2026-04-06, 1d
  Patch the SSRF in imports   :crit, active, c3, after c1, 4d

  section High
  Enforce MFA for admins      :h1, after c2, 8d
  Object-level authorisation  :h2, after c3, 12d
  Session fixation            :h3, after c3, 5d

  section Medium
  Security headers            :m1, 2026-04-20, 4d
  Dependency upgrades         :m2, after m1, 10d
  Rate limiting on auth       :m3, after h3, 6d

  section Verification
  Retest by the vendor        :v1, after h2 m3, 5d
  Report to the board         :milestone, v2, after v1, 0d` },

  { title: 'Database upgrade', source: `gantt
  title Postgres 12 to 16
  dateFormat YYYY-MM-DD
  axisFormat %b %d

  section Preparation
  Extension inventory       :done, p1, 2026-05-04, 4d
  Deprecated syntax sweep   :done, p2, after p1, 5d
  Capture baseline plans    :done, p3, after p1, 3d

  section Rehearsal
  Restore into a v16 clone  :active, r1, after p2, 3d
  Replay a day of queries   :r2, after r1, 4d
  Compare plans             :r3, after r2, 3d
  Fix regressions           :crit, r4, after r3, 8d

  section Cutover
  Logical replication up    :c1, after r4, 2d
  Catch-up and verify       :c2, after c1, 3d
  Read-only window          :crit, milestone, c3, after c2, 0d
  Promote and switch DNS    :crit, c4, after c3, 1d

  section Aftercare
  ANALYZE and watch plans   :a1, after c4, 7d
  Decommission the old node :a2, after a1, 3d` },

  { title: 'Quarterly roadmap', source: `gantt
  title Engineering roadmap Q3
  dateFormat YYYY-MM-DD
  axisFormat %b

  section Reliability
  Error budget policy      :done, r1, 2026-07-01, 14d
  Checkout latency work    :active, r2, 2026-07-07, 45d
  Monthly chaos day        :r3, 2026-07-20, 60d

  section Platform
  One CI pipeline          :active, p1, 2026-07-01, 40d
  Secrets rotation         :p2, after p1, 20d
  Kill the legacy deploy   :crit, p3, after p2, 15d

  section Growth
  Self-serve onboarding    :g1, 2026-07-14, 35d
  Annual billing           :g2, after g1, 20d
  Two new locales          :g3, 2026-08-11, 30d

  section Cost
  Warehouse spend          :c1, 2026-07-01, 60d
  Staging right-sizing     :c2, 2026-08-01, 20d` },

  { title: 'Incident response and follow-up', source: `gantt
  title SEV-1 checkout outage
  dateFormat HH:mm
  axisFormat %H:%M

  section Detection
  Deploy of order-service   :done, d1, 14:02, 4m
  Error rate crosses SLO    :crit, done, d2, 14:06, 3m
  Page fires                :milestone, d3, 14:09, 0m

  section Response
  Acknowledged              :done, r1, 14:14, 1m
  Incident channel opened   :done, r2, 14:15, 2m
  Status page updated       :done, r3, 14:17, 3m
  Hypothesis and triage     :done, r4, 14:17, 14m

  section Mitigation
  Rollback started          :crit, done, m1, 14:31, 8m
  Error rate recovering     :done, m2, 14:39, 10m
  Declared resolved         :milestone, m3, 14:49, 0m

  section Follow-up
  Draft the postmortem      :f1, 15:30, 90m
  Review with the team      :f2, after f1, 60m` },

  { title: 'Mobile app release train', source: `gantt
  title Mobile release 8.4
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  excludes weekends

  section Development
  Feature work            :done, d1, 2026-06-01, 15d
  Code freeze             :milestone, d2, after d1, 0d

  section Stabilisation
  Regression suite        :done, s1, after d2, 3d
  Bug bash                 :done, s2, after d2, 2d
  Fix pass                :active, s3, after s1, 4d

  section Release
  Internal build          :r1, after s3, 1d
  TestFlight beta         :r2, after r1, 5d
  Play internal track     :r3, after r1, 5d
  App review submission   :crit, r4, after r2 r3, 1d
  Review wait             :crit, r5, after r4, 3d
  Staged rollout 10%      :r6, after r5, 2d
  Staged rollout 100%     :r7, after r6, 3d

  section After
  Crash triage window     :a1, after r6, 7d
  Retro                   :milestone, a2, after r7, 0d` },

  { title: 'Data warehouse build-out', source: `gantt
  title Warehouse foundations
  dateFormat YYYY-MM-DD
  axisFormat %b %d

  section Ingestion
  CDC from the primary DB   :done, i1, 2026-03-02, 12d
  Event stream landing      :done, i2, after i1, 8d
  Partner SFTP drops        :active, i3, after i1, 10d

  section Modelling
  Staging models            :active, m1, after i2, 10d
  Core dimensions           :m2, after m1, 14d
  Fact tables               :m3, after m2, 16d
  Data tests and contracts  :m4, after m2, 20d

  section Serving
  Semantic layer            :s1, after m3, 12d
  Top ten dashboards        :s2, after s1, 15d
  Self-serve training       :s3, after s2, 5d

  section Governance
  Data catalogue            :g1, 2026-03-16, 30d
  Retention rules           :g2, after g1, 10d
  Access review             :milestone, g3, after g2, 0d` },

  { title: 'Compliance certification', source: `gantt
  title SOC 2 Type II
  dateFormat YYYY-MM-DD
  axisFormat %b

  section Readiness
  Gap assessment          :done, r1, 2026-01-06, 20d
  Policy authoring        :done, r2, after r1, 30d
  Control implementation  :active, r3, after r1, 60d

  section Evidence
  Access reviews          :e1, 2026-03-02, 90d
  Change management logs  :e2, 2026-03-02, 90d
  Vendor reviews          :e3, 2026-03-16, 60d
  Incident drills         :e4, 2026-04-01, 60d

  section Observation window
  Window opens            :milestone, o1, 2026-03-02, 0d
  Continuous monitoring   :crit, o2, 2026-03-02, 120d
  Window closes           :milestone, o3, after o2, 0d

  section Audit
  Fieldwork               :a1, after o3, 20d
  Report issued           :milestone, a2, after a1, 0d` },

  { title: 'Website replatform', source: `gantt
  title Marketing site replatform
  dateFormat YYYY-MM-DD
  axisFormat %d %b

  section Content
  Audit and inventory      :done, c1, 2026-02-02, 10d
  Rewrite the top 40 pages :active, c2, after c1, 25d
  Redirect map             :c3, after c1, 8d

  section Build
  Design system            :done, b1, 2026-02-09, 15d
  Page templates           :active, b2, after b1, 18d
  CMS modelling            :b3, after b1, 12d
  Search and sitemap       :b4, after b2, 6d

  section Migration
  Bulk import              :m1, after b3 c2, 5d
  QA every template        :m2, after m1, 6d
  Performance pass         :m3, after m2, 5d

  section Launch
  Redirects live           :crit, l1, after c3 m3, 1d
  DNS cutover              :crit, milestone, l2, after l1, 0d
  Watch rankings           :l3, after l2, 30d` },
]
