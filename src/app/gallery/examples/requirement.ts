import type { Example } from './types'

export const requirement: Example[] = [
  { title: 'Checkout availability', source: `requirementDiagram
  requirement checkout_available {
    id: SLO1
    text: "Checkout completes successfully for 99.95% of attempts over 28 days."
    risk: high
    verifymethod: analysis
  }
  functionalRequirement idempotent_pay {
    id: FR1.1
    text: "Submitting the same payment twice charges the customer once."
    risk: high
    verifymethod: test
  }
  performanceRequirement checkout_latency {
    id: NFR1.2
    text: "p99 checkout latency stays under 400ms at 2000 requests per second."
    risk: medium
    verifymethod: test
  }
  designConstraint psp_failover {
    id: DC1.3
    text: "A single payment provider outage must not stop checkout."
    risk: high
    verifymethod: demonstration
  }
  element order_service {
    type: "service"
    docref: "repos/order-service"
  }
  element payment_service {
    type: "service"
    docref: "repos/payment-service"
  }
  element k6_checkout_load {
    type: "test suite"
    docref: "perf/checkout.js"
  }
  checkout_available - contains -> idempotent_pay
  checkout_available - contains -> checkout_latency
  checkout_available - contains -> psp_failover
  order_service - satisfies -> idempotent_pay
  payment_service - satisfies -> psp_failover
  k6_checkout_load - verifies -> checkout_latency` },

  { title: 'GDPR data subject rights', source: `requirementDiagram
  requirement data_rights {
    id: REG1
    text: "Data subjects can exercise access, rectification and erasure rights."
    risk: high
    verifymethod: inspection
  }
  functionalRequirement export_within_30_days {
    id: REG1.1
    text: "A verified access request returns all personal data within 30 days."
    risk: high
    verifymethod: demonstration
  }
  functionalRequirement erasure {
    id: REG1.2
    text: "An erasure request removes personal data from primary stores and backups within 90 days."
    risk: high
    verifymethod: inspection
  }
  functionalRequirement consent_record {
    id: REG1.3
    text: "Every marketing contact is traceable to a recorded consent."
    risk: medium
    verifymethod: inspection
  }
  element privacy_portal {
    type: "service"
    docref: "repos/privacy-portal"
  }
  element data_catalogue {
    type: "document"
    docref: "docs/data-catalogue.md"
  }
  element backup_policy {
    type: "document"
    docref: "docs/backup-retention.md"
  }
  data_rights - contains -> export_within_30_days
  data_rights - contains -> erasure
  data_rights - contains -> consent_record
  privacy_portal - satisfies -> export_within_30_days
  data_catalogue - refines -> erasure
  backup_policy - traces -> erasure` },

  { title: 'Payment card compliance', source: `requirementDiagram
  requirement pci_scope {
    id: PCI1
    text: "Cardholder data never touches systems outside the compliance boundary."
    risk: high
    verifymethod: inspection
  }
  designConstraint tokenise_at_edge {
    id: PCI1.1
    text: "Card numbers are exchanged for tokens in the provider iframe."
    risk: high
    verifymethod: demonstration
  }
  functionalRequirement no_pan_in_logs {
    id: PCI1.2
    text: "No log, trace or error report contains a primary account number."
    risk: high
    verifymethod: test
  }
  performanceRequirement tls_only {
    id: PCI1.3
    text: "All external traffic uses TLS 1.2 or higher with approved ciphers."
    risk: medium
    verifymethod: analysis
  }
  element checkout_iframe {
    type: "component"
    docref: "repos/web/checkout"
  }
  element log_scrubber {
    type: "library"
    docref: "repos/lib-logging"
  }
  element tls_scan {
    type: "test suite"
    docref: "security/tls-scan.yml"
  }
  pci_scope - contains -> tokenise_at_edge
  pci_scope - contains -> no_pan_in_logs
  pci_scope - contains -> tls_only
  checkout_iframe - satisfies -> tokenise_at_edge
  log_scrubber - satisfies -> no_pan_in_logs
  tls_scan - verifies -> tls_only` },

  { title: 'Accessibility conformance', source: `requirementDiagram
  requirement wcag_aa {
    id: A11Y1
    text: "The product conforms to WCAG 2.2 level AA."
    risk: medium
    verifymethod: inspection
  }
  functionalRequirement keyboard_operable {
    id: A11Y1.1
    text: "Every interactive element is reachable and operable by keyboard alone."
    risk: high
    verifymethod: test
  }
  functionalRequirement contrast {
    id: A11Y1.2
    text: "Text and its background meet a 4.5:1 contrast ratio."
    risk: medium
    verifymethod: analysis
  }
  functionalRequirement reduced_motion {
    id: A11Y1.3
    text: "Animation is suppressed when the viewer asks for reduced motion."
    risk: low
    verifymethod: demonstration
  }
  element design_tokens {
    type: "library"
    docref: "packages/tokens"
  }
  element axe_suite {
    type: "test suite"
    docref: "e2e/a11y.spec.ts"
  }
  element keyboard_map {
    type: "document"
    docref: "docs/keyboard.md"
  }
  wcag_aa - contains -> keyboard_operable
  wcag_aa - contains -> contrast
  wcag_aa - contains -> reduced_motion
  design_tokens - satisfies -> contrast
  axe_suite - verifies -> keyboard_operable
  keyboard_map - refines -> keyboard_operable` },

  { title: 'Disaster recovery', source: `requirementDiagram
  requirement business_continuity {
    id: DR1
    text: "The service is restored within agreed objectives after a regional failure."
    risk: high
    verifymethod: demonstration
  }
  performanceRequirement rto {
    id: DR1.1
    text: "Recovery time objective is 60 minutes."
    risk: high
    verifymethod: demonstration
  }
  performanceRequirement rpo {
    id: DR1.2
    text: "Recovery point objective is 5 minutes of data loss."
    risk: high
    verifymethod: analysis
  }
  functionalRequirement restore_tested {
    id: DR1.3
    text: "A restore from backup is exercised every quarter and timed."
    risk: medium
    verifymethod: test
  }
  element standby_region {
    type: "environment"
    docref: "infra/regions/eu-west-2"
  }
  element wal_streaming {
    type: "component"
    docref: "infra/postgres/replication.tf"
  }
  element gameday_runbook {
    type: "document"
    docref: "runbooks/regional-failover.md"
  }
  business_continuity - contains -> rto
  business_continuity - contains -> rpo
  business_continuity - contains -> restore_tested
  standby_region - satisfies -> rto
  wal_streaming - satisfies -> rpo
  gameday_runbook - verifies -> rto` },

  { title: 'Mobile release quality', source: `requirementDiagram
  requirement release_quality {
    id: MOB1
    text: "A store release meets crash, size and performance gates."
    risk: medium
    verifymethod: test
  }
  performanceRequirement crash_free {
    id: MOB1.1
    text: "At least 99.5% of sessions are crash-free over the first 7 days."
    risk: high
    verifymethod: analysis
  }
  designConstraint binary_size {
    id: MOB1.2
    text: "The download size stays under 60MB on Android."
    risk: low
    verifymethod: inspection
  }
  performanceRequirement cold_start {
    id: MOB1.3
    text: "Cold start to first interactive frame is under 1.8s on a mid-range device."
    risk: medium
    verifymethod: test
  }
  element crash_reporter {
    type: "service"
    docref: "mobile/observability"
  }
  element size_gate {
    type: "pipeline step"
    docref: ".github/workflows/android.yml"
  }
  element startup_bench {
    type: "test suite"
    docref: "mobile/bench/startup"
  }
  release_quality - contains -> crash_free
  release_quality - contains -> binary_size
  release_quality - contains -> cold_start
  crash_reporter - verifies -> crash_free
  size_gate - verifies -> binary_size
  startup_bench - verifies -> cold_start` },

  { title: 'Data retention', source: `requirementDiagram
  requirement retention_policy {
    id: DATA1
    text: "Every dataset has an owner, a purpose and a deletion date."
    risk: medium
    verifymethod: inspection
  }
  functionalRequirement events_90_days {
    id: DATA1.1
    text: "Raw behavioural events are deleted after 90 days."
    risk: medium
    verifymethod: test
  }
  functionalRequirement logs_30_days {
    id: DATA1.2
    text: "Application logs are deleted after 30 days."
    risk: low
    verifymethod: test
  }
  functionalRequirement financial_7_years {
    id: DATA1.3
    text: "Financial records are retained for 7 years and then archived."
    risk: high
    verifymethod: inspection
  }
  element lifecycle_rules {
    type: "infrastructure"
    docref: "infra/storage/lifecycle.tf"
  }
  element catalogue {
    type: "service"
    docref: "repos/data-catalogue"
  }
  element retention_audit {
    type: "test suite"
    docref: "data/tests/retention.sql"
  }
  retention_policy - contains -> events_90_days
  retention_policy - contains -> logs_30_days
  retention_policy - contains -> financial_7_years
  lifecycle_rules - satisfies -> events_90_days
  lifecycle_rules - satisfies -> logs_30_days
  catalogue - traces -> retention_policy
  retention_audit - verifies -> financial_7_years` },

  { title: 'Search relevance', source: `requirementDiagram
  requirement search_quality {
    id: SRCH1
    text: "Shoppers find the product they meant within the first five results."
    risk: medium
    verifymethod: analysis
  }
  performanceRequirement ndcg {
    id: SRCH1.1
    text: "nDCG@5 stays above 0.72 on the judged query set."
    risk: medium
    verifymethod: test
  }
  performanceRequirement query_latency {
    id: SRCH1.2
    text: "p95 query latency stays under 120ms."
    risk: medium
    verifymethod: test
  }
  functionalRequirement typo_tolerance {
    id: SRCH1.3
    text: "One-character typos still return the intended product."
    risk: low
    verifymethod: test
  }
  element ranking_service {
    type: "service"
    docref: "repos/search-ranking"
  }
  element judgement_set {
    type: "dataset"
    docref: "search/judgements.csv"
  }
  element relevance_ci {
    type: "pipeline step"
    docref: ".github/workflows/relevance.yml"
  }
  search_quality - contains -> ndcg
  search_quality - contains -> query_latency
  search_quality - contains -> typo_tolerance
  ranking_service - satisfies -> ndcg
  judgement_set - refines -> ndcg
  relevance_ci - verifies -> ndcg` },

  { title: 'Third-party integration', source: `requirementDiagram
  requirement partner_api {
    id: INT1
    text: "Partners can integrate without bespoke work from our side."
    risk: medium
    verifymethod: demonstration
  }
  functionalRequirement webhook_delivery {
    id: INT1.1
    text: "Webhooks are retried with backoff for 24 hours and signed."
    risk: high
    verifymethod: test
  }
  functionalRequirement sandbox {
    id: INT1.2
    text: "A sandbox environment reproduces every production response shape."
    risk: medium
    verifymethod: demonstration
  }
  designConstraint no_breaking_changes {
    id: INT1.3
    text: "A published version never changes meaning; new behaviour needs a new version."
    risk: high
    verifymethod: inspection
  }
  element webhook_service {
    type: "service"
    docref: "repos/webhooks"
  }
  element openapi_spec {
    type: "document"
    docref: "api/openapi.yaml"
  }
  element contract_tests {
    type: "test suite"
    docref: "api/tests/contract"
  }
  partner_api - contains -> webhook_delivery
  partner_api - contains -> sandbox
  partner_api - contains -> no_breaking_changes
  webhook_service - satisfies -> webhook_delivery
  openapi_spec - refines -> no_breaking_changes
  contract_tests - verifies -> no_breaking_changes` },

  { title: 'Model deployment governance', source: `requirementDiagram
  requirement model_governance {
    id: ML1
    text: "Every model in production is documented, monitored and reversible."
    risk: high
    verifymethod: inspection
  }
  functionalRequirement model_card {
    id: ML1.1
    text: "Each model ships with training data provenance and known limitations."
    risk: medium
    verifymethod: inspection
  }
  performanceRequirement drift_alert {
    id: ML1.2
    text: "Input drift beyond two standard deviations raises an alert within an hour."
    risk: high
    verifymethod: test
  }
  functionalRequirement shadow_first {
    id: ML1.3
    text: "A new model runs in shadow for a week before serving traffic."
    risk: medium
    verifymethod: demonstration
  }
  element registry {
    type: "service"
    docref: "repos/model-registry"
  }
  element drift_monitor {
    type: "service"
    docref: "repos/drift-monitor"
  }
  element rollout_runbook {
    type: "document"
    docref: "runbooks/model-rollout.md"
  }
  model_governance - contains -> model_card
  model_governance - contains -> drift_alert
  model_governance - contains -> shadow_first
  registry - satisfies -> model_card
  drift_monitor - satisfies -> drift_alert
  rollout_runbook - refines -> shadow_first` },
]
