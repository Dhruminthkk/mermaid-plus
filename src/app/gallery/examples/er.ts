import type { Example } from './types'

export const er: Example[] = [
  { title: 'E-commerce orders', source: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER ||--o{ ADDRESS : has
  ORDER ||--|{ ORDER_LINE : contains
  ORDER ||--o| PAYMENT : "settled by"
  ORDER ||--o{ SHIPMENT : "fulfilled by"
  PRODUCT ||--o{ ORDER_LINE : "appears in"
  PRODUCT ||--|{ VARIANT : "sold as"
  VARIANT ||--o{ INVENTORY : "stocked in"
  WAREHOUSE ||--o{ INVENTORY : holds
  CUSTOMER {
    uuid id PK
    citext email UK
    text full_name
    timestamptz created_at
  }
  ORDER {
    uuid id PK
    uuid customer_id FK
    text status
    numeric total_minor
    char(3) currency
    timestamptz placed_at
  }
  ORDER_LINE {
    uuid id PK
    uuid order_id FK
    uuid variant_id FK
    int quantity
    numeric unit_price_minor
  }
  PAYMENT {
    uuid id PK
    uuid order_id FK
    text provider
    text provider_charge_id UK
    text status
  }
  VARIANT {
    uuid id PK
    uuid product_id FK
    text sku UK
    jsonb options
  }
  INVENTORY {
    uuid variant_id FK
    uuid warehouse_id FK
    int on_hand
    int reserved
  }` },

  { title: 'Multi-tenant SaaS', source: `erDiagram
  TENANT ||--o{ MEMBERSHIP : has
  USER ||--o{ MEMBERSHIP : joins
  MEMBERSHIP }o--|| ROLE : "granted"
  ROLE ||--o{ ROLE_PERMISSION : "maps to"
  PERMISSION ||--o{ ROLE_PERMISSION : "granted by"
  TENANT ||--o{ API_KEY : issues
  TENANT ||--o| SSO_CONNECTION : "authenticates via"
  TENANT ||--o{ AUDIT_EVENT : records
  USER ||--o{ AUDIT_EVENT : "acted in"
  TENANT {
    uuid id PK
    text slug UK
    text plan
    bool sso_enforced
    timestamptz created_at
  }
  USER {
    uuid id PK
    citext email UK
    bool email_verified
    timestamptz last_seen_at
  }
  MEMBERSHIP {
    uuid tenant_id PK,FK
    uuid user_id PK,FK
    uuid role_id FK
    bool is_owner
  }
  API_KEY {
    uuid id PK
    uuid tenant_id FK
    text prefix UK
    text secret_hash
    timestamptz expires_at
    timestamptz revoked_at
  }
  AUDIT_EVENT {
    bigint id PK
    uuid tenant_id FK
    uuid actor_id FK
    text action
    jsonb payload
    timestamptz at
  }` },

  { title: 'Content management', source: `erDiagram
  SITE ||--o{ PAGE : contains
  PAGE ||--o{ REVISION : "versioned as"
  USER ||--o{ REVISION : authors
  PAGE }o--o{ TAG : "labelled with"
  PAGE ||--o{ BLOCK : "composed of"
  BLOCK }o--o| MEDIA : embeds
  PAGE ||--o{ COMMENT : receives
  USER ||--o{ COMMENT : writes
  SITE {
    uuid id PK
    text domain UK
    text default_locale
  }
  PAGE {
    uuid id PK
    uuid site_id FK
    text slug
    text locale
    uuid live_revision_id FK
    timestamptz published_at
  }
  REVISION {
    uuid id PK
    uuid page_id FK
    uuid author_id FK
    int number
    text title
    timestamptz created_at
  }
  BLOCK {
    uuid id PK
    uuid revision_id FK
    int position
    text kind
    jsonb data
  }
  MEDIA {
    uuid id PK
    text storage_key UK
    text mime_type
    int bytes
    int width
    int height
  }` },

  { title: 'Financial ledger', source: `erDiagram
  ACCOUNT ||--o{ ENTRY : "debited or credited"
  TRANSACTION ||--|{ ENTRY : "balances to zero"
  CURRENCY ||--o{ ACCOUNT : denominates
  ACCOUNT ||--o{ ACCOUNT : "rolls up to"
  TRANSACTION }o--o| SOURCE_DOCUMENT : "evidenced by"
  ACCOUNT {
    uuid id PK
    uuid parent_id FK
    text code UK
    text name
    text type
    char(3) currency FK
  }
  TRANSACTION {
    uuid id PK
    date booked_on
    text description
    text idempotency_key UK
    timestamptz created_at
  }
  ENTRY {
    bigint id PK
    uuid transaction_id FK
    uuid account_id FK
    bigint amount_minor
    text direction
  }
  SOURCE_DOCUMENT {
    uuid id PK
    text kind
    text external_ref UK
    text storage_key
  }
  CURRENCY {
    char(3) code PK
    text name
    int minor_units
  }` },

  { title: 'Appointment booking', source: `erDiagram
  CLINIC ||--o{ PRACTITIONER : employs
  PRACTITIONER ||--o{ AVAILABILITY : publishes
  PRACTITIONER ||--o{ APPOINTMENT : attends
  PATIENT ||--o{ APPOINTMENT : books
  APPOINTMENT ||--o| INVOICE : bills
  SERVICE ||--o{ APPOINTMENT : "of type"
  PATIENT ||--o{ CONSENT : signs
  CLINIC {
    uuid id PK
    text name
    text timezone
  }
  PRACTITIONER {
    uuid id PK
    uuid clinic_id FK
    text full_name
    text registration_number UK
  }
  AVAILABILITY {
    uuid id PK
    uuid practitioner_id FK
    tstzrange window
    text recurrence_rule
  }
  APPOINTMENT {
    uuid id PK
    uuid patient_id FK
    uuid practitioner_id FK
    uuid service_id FK
    tstzrange slot
    text status
    text cancellation_reason
  }
  SERVICE {
    uuid id PK
    text name
    interval duration
    numeric price_minor
  }` },

  { title: 'Logistics and tracking', source: `erDiagram
  SHIPMENT ||--|{ PARCEL : "split into"
  PARCEL ||--o{ SCAN_EVENT : "tracked by"
  CARRIER ||--o{ SHIPMENT : carries
  FACILITY ||--o{ SCAN_EVENT : "recorded at"
  SHIPMENT }o--|| ADDRESS : "ships to"
  SHIPMENT }o--|| ADDRESS : "ships from"
  PARCEL ||--|{ PARCEL_ITEM : holds
  SHIPMENT {
    uuid id PK
    uuid carrier_id FK
    text tracking_number UK
    text service_level
    timestamptz dispatched_at
    date promised_by
  }
  PARCEL {
    uuid id PK
    uuid shipment_id FK
    numeric weight_kg
    int length_mm
    int width_mm
    int height_mm
  }
  SCAN_EVENT {
    bigint id PK
    uuid parcel_id FK
    uuid facility_id FK
    text code
    text description
    timestamptz scanned_at
  }
  FACILITY {
    uuid id PK
    text name
    text country
    point location
  }` },

  { title: 'Observability metadata', source: `erDiagram
  SERVICE ||--o{ DEPLOYMENT : "released as"
  SERVICE ||--o{ SLO : promises
  SLO ||--o{ ERROR_BUDGET_BURN : "consumed by"
  SERVICE ||--o{ ALERT_RULE : monitored_by
  ALERT_RULE ||--o{ INCIDENT : triggers
  INCIDENT ||--o{ INCIDENT_UPDATE : "narrated by"
  TEAM ||--o{ SERVICE : owns
  TEAM ||--o{ ONCALL_SHIFT : staffs
  SERVICE {
    uuid id PK
    text name UK
    uuid team_id FK
    text repository_url
    text tier
  }
  SLO {
    uuid id PK
    uuid service_id FK
    text indicator
    numeric objective
    interval window
  }
  INCIDENT {
    uuid id PK
    uuid service_id FK
    text severity
    timestamptz detected_at
    timestamptz mitigated_at
    timestamptz resolved_at
  }
  ONCALL_SHIFT {
    uuid id PK
    uuid team_id FK
    uuid user_id FK
    tstzrange window
    text escalation_level
  }` },

  { title: 'Learning platform', source: `erDiagram
  COURSE ||--|{ MODULE : "made of"
  MODULE ||--|{ LESSON : contains
  LESSON ||--o{ ASSET : uses
  STUDENT ||--o{ ENROLMENT : takes
  COURSE ||--o{ ENROLMENT : "enrols into"
  ENROLMENT ||--o{ PROGRESS : records
  LESSON ||--o{ PROGRESS : "measured on"
  LESSON ||--o| QUIZ : assesses
  QUIZ ||--|{ QUESTION : asks
  STUDENT ||--o{ ATTEMPT : submits
  QUIZ ||--o{ ATTEMPT : "attempted as"
  COURSE {
    uuid id PK
    text title
    text level
    bool published
  }
  ENROLMENT {
    uuid id PK
    uuid student_id FK
    uuid course_id FK
    timestamptz started_at
    timestamptz completed_at
  }
  PROGRESS {
    uuid enrolment_id PK,FK
    uuid lesson_id PK,FK
    numeric fraction_watched
    timestamptz last_seen_at
  }
  ATTEMPT {
    uuid id PK
    uuid student_id FK
    uuid quiz_id FK
    numeric score
    timestamptz submitted_at
  }` },

  { title: 'Message queue metadata', source: `erDiagram
  TOPIC ||--|{ PARTITION : "sharded into"
  PARTITION ||--o{ MESSAGE : stores
  CONSUMER_GROUP ||--o{ OFFSET : commits
  PARTITION ||--o{ OFFSET : "tracked per"
  CONSUMER_GROUP ||--o{ CONSUMER : "made of"
  TOPIC ||--o| SCHEMA : "validated by"
  TOPIC ||--o| TOPIC : "dead letters to"
  TOPIC {
    uuid id PK
    text name UK
    int partition_count
    interval retention
    text cleanup_policy
  }
  PARTITION {
    uuid id PK
    uuid topic_id FK
    int index
    bigint log_start_offset
    bigint log_end_offset
  }
  MESSAGE {
    uuid partition_id PK,FK
    bigint offset PK
    bytea key
    bytea value
    jsonb headers
    timestamptz produced_at
  }
  OFFSET {
    uuid group_id PK,FK
    uuid partition_id PK,FK
    bigint committed
    timestamptz committed_at
  }
  SCHEMA {
    uuid id PK
    text subject UK
    int version
    text format
    text definition
  }` },

  { title: 'Feature flags and experiments', source: `erDiagram
  PROJECT ||--o{ FLAG : contains
  FLAG ||--|{ VARIATION : offers
  FLAG ||--o{ RULE : "targeted by"
  RULE ||--|{ CLAUSE : "made of"
  RULE }o--o| VARIATION : serves
  FLAG ||--o{ EXPERIMENT : "measured by"
  EXPERIMENT ||--o{ EXPOSURE : records
  EXPERIMENT ||--|{ METRIC : "judged on"
  ENVIRONMENT ||--o{ FLAG_STATE : "holds state of"
  FLAG ||--o{ FLAG_STATE : "differs per"
  FLAG {
    uuid id PK
    uuid project_id FK
    text key UK
    text kind
    bool temporary
  }
  FLAG_STATE {
    uuid flag_id PK,FK
    uuid environment_id PK,FK
    bool on
    uuid fallthrough_variation_id FK
  }
  RULE {
    uuid id PK
    uuid flag_id FK
    int position
    text bucket_by
  }
  EXPOSURE {
    bigint id PK
    uuid experiment_id FK
    text context_key
    uuid variation_id FK
    timestamptz at
  }
  METRIC {
    uuid id PK
    uuid experiment_id FK
    text name
    text direction
    numeric minimum_effect
  }` },
]
