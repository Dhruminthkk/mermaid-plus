import type { Example } from './types'

export const timeline: Example[] = [
  { title: 'Incident timeline', source: `timeline
  title SEV-1 checkout outage, 4 September
  section Detection
    14.02 : order-service v4.18 deployed to production
    14.06 : Checkout error rate crosses the SLO
    14.09 : PagerDuty pages the on-call engineer
  section Response
    14.14 : Acknowledged
    14.15 : Incident channel and bridge opened
    14.17 : Status page set to degraded : Connection pool saturation suspected
  section Mitigation
    14.31 : Rollback to v4.17 started
    14.39 : Error rate falling
    14.44 : Checkout back within the SLO
    14.49 : Declared resolved
  section Follow-up
    16.00 : Draft postmortem circulated
    +2 days : Review with the team
    +5 days : Action items assigned with dates` },

  { title: 'Product history', source: `timeline
  title Five years of the product
  section Finding the shape
    2021 : Prototype built in two weeks : Ten design partners
    2022 : First paying customer : Team of four
  section Growing
    2023 : Self-serve signup : SOC 2 Type I : Series A
    2024 : Enterprise SSO : EU data region : 50 employees
  section Scaling
    2025 : API platform opened to partners : SOC 2 Type II
    2026 : Kubernetes migration finished : 1M monthly active users` },

  { title: 'Migration to Kubernetes', source: `timeline
  title Platform migration
  section Foundations
    January : Cluster provisioned : Network policy and mTLS
    February : Secrets management : Observability stack
  section First service
    March : API containerised : Staging deploy
    April : Load tested : Production canary at 5%
  section The rest
    May : Batch jobs moved
    June : Internal tools moved
    August : Legacy monolith moved : The last VM shut down
  section After
    September : Old platform frozen
    October : Deploy time down from 40 to 6 minutes` },

  { title: 'Release train', source: `timeline
  title Release 8.4
  section Development
    Week 1 : Feature work begins
    Week 3 : Code freeze
  section Stabilisation
    Week 4 : Regression suite : Bug bash
    Week 4 : Fix pass on 23 defects
  section Release
    Week 5 : Internal build : TestFlight beta
    Week 5 : Submitted for app review
    Week 6 : Approved : Staged rollout at 10%
    Week 6 : Rollout to 100%
  section After
    Week 7 : Crash-free sessions at 99.7% : Retro` },

  { title: 'Compliance programme', source: `timeline
  title SOC 2 Type II
  section Readiness
    January : Gap assessment
    February : Policies written and approved
    February : Control implementation begins
  section Observation window
    March : Window opens : Access reviews start
    April : Change management evidence collected
    May : Incident response drill
    June : Window closes
  section Audit
    July : Fieldwork with the auditor
    August : Report issued : Shared with three enterprise prospects` },

  { title: 'Web platform milestones', source: `timeline
  title Browser platform
  section Foundations
    1991 : First web page
    1995 : JavaScript : CSS proposed
    1999 : XMLHttpRequest ships in IE5
  section The web as an application
    2006 : jQuery
    2008 : V8 and Chrome
    2009 : Node.js
  section Standards catch up
    2014 : HTML5 recommendation
    2015 : ES2015 : HTTP/2
    2017 : WebAssembly ships in all major browsers
  section Capable by default
    2020 : Web Vitals
    2022 : Container queries : Cascade layers
    2024 : View transitions : Popover API` },

  { title: 'Customer onboarding', source: `timeline
  title Enterprise onboarding
  section Contract
    Day 0 : Contract signed : Kickoff scheduled
    Day 3 : Kickoff call : Success criteria agreed
  section Setup
    Day 5 : Tenant provisioned : SSO connection configured
    Day 8 : Data import rehearsed on a sandbox
    Day 12 : Production import : Reconciliation checks
  section Adoption
    Day 15 : Admin training
    Day 20 : Pilot team live
    Day 45 : Rollout to all 900 seats
  section Steady state
    Day 60 : Success review : Expansion opportunities noted` },

  { title: 'Security incident disclosure', source: `timeline
  title Vulnerability handling
  section Report
    Day 0 : Researcher reports via the disclosure inbox
    Day 0 : Acknowledged within four hours
  section Triage
    Day 1 : Reproduced on a staging tenant : Severity set to high
    Day 2 : Blast radius assessed : No evidence of exploitation
  section Fix
    Day 3 : Patch written and reviewed
    Day 4 : Deployed to all regions
    Day 5 : Log review confirms no abuse
  section Disclosure
    Day 12 : Customers notified
    Day 30 : Advisory published : Researcher credited` },

  { title: 'Data platform evolution', source: `timeline
  title From spreadsheets to a warehouse
  section Spreadsheets
    Year 1 : Analysts export CSVs by hand : One source of truth per person
  section First pipeline
    Year 2 : Nightly dump into Postgres : Three dashboards
    Year 2 : Nobody trusts the numbers
  section Warehouse
    Year 3 : Columnar warehouse : dbt models with tests
    Year 3 : Metrics defined once, in code
  section Streaming
    Year 4 : Change data capture : Events land in minutes
    Year 4 : Freshness monitored like uptime
  section Governance
    Year 5 : Catalogue with owners : Retention rules enforced` },

  { title: 'Open source project', source: `timeline
  title Project lifecycle
  section Start
    Month 0 : First commit : README and a licence
    Month 2 : First external issue
  section Growth
    Month 6 : 100 stars : Contribution guide
    Month 9 : First outside maintainer
    Month 12 : 1.0 with a stability promise
  section Sustaining
    Year 2 : Funding through sponsorship
    Year 2 : Release cadence formalised
    Year 3 : Governance document : Three maintainers
  section Handover
    Year 4 : Original author steps back : Project continues` },
]
