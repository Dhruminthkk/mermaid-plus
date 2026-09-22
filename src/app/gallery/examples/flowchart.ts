import type { Example } from './types'

export const flowchart: Example[] = [
  { title: 'Sign-in with OAuth and PKCE', source: `flowchart TD
%%mp: layout direction=DOWN
  start([User taps 'Sign in']) --> verifier[App generates code_verifier]
  verifier --> challenge[Derive code_challenge = S256 verifier]
  challenge --> authz[Redirect to /authorize with challenge]
  authz --> idp[Identity provider external]
  idp --> creds{Session cookie valid?}
  creds -->|no| login[Username and password]
  login --> mfa{MFA required?}
  mfa -->|yes| totp[TOTP or passkey]
  mfa -->|no| consent
  totp --> consent{Scopes already granted?}
  creds -->|yes| consent
  consent -->|no| ask[Consent screen]
  ask --> code
  consent -->|yes| code[Redirect back with auth code]
  code --> exchange[POST /token with code + verifier]
  exchange --> check{Challenge matches verifier?}
  check -->|no| reject[400 invalid_grant]
  check -->|yes| tokens[(Access + refresh token)]
  tokens --> done([Signed in])
%%mp: node idp note="Third party. Never sees the code_verifier, only its hash."
%%mp: node verifier note="Random 43-128 chars, held only in app memory. PKCE exists so a stolen auth code is useless without it."` },

  { title: 'Silent token refresh and reauthentication', source: `flowchart LR
  call[API call] --> valid{Access token fresh?}
  valid -->|yes| send[Send request]
  valid -->|no| refresh{Refresh token valid?}
  refresh -->|yes| rotate[POST /token grant_type=refresh_token]
  rotate --> newpair[(New access + refresh pair)]
  newpair --> send
  refresh -->|no| interactive[Full sign-in]
  interactive --> send
  send --> resp{Status}
  resp -->|200| ok([Response])
  resp -->|401| once{Already retried?}
  once -->|no| rotate
  once -->|yes| interactive
  resp -->|403| denied([Insufficient scope])
%%mp: edge rotate->newpair note="Refresh tokens rotate on every use; reusing an old one revokes the family."` },

  { title: 'CI/CD pipeline with approval gate', source: `flowchart LR
  push[Push to branch] --> lint[Lint and typecheck]
  push --> unit[Unit tests]
  push --> audit[Dependency audit]
  lint --> build[Build container image]
  unit --> build
  audit --> build
  build --> sign[Sign image and push to registry]
  sign --> scan{Critical CVEs?}
  scan -->|found| fail([Fail the pipeline])
  scan -->|none| staging[Deploy to staging]
  staging --> e2e[End-to-end suite]
  staging --> smoke[Smoke tests]
  e2e --> gate{Manual approval}
  smoke --> gate
  gate -->|rejected| fail
  gate -->|approved| canary[Canary: 5% of traffic]
  canary --> watch{Error rate within SLO?}
  watch -->|no| rollback[Roll back to previous tag]
  watch -->|yes| full[Full rollout]
  full --> notify([Announce in #releases])` },

  { title: 'Checkout and payment authorisation', source: `flowchart TD
  cart([Cart]) --> address[Shipping address]
  address --> tax[Calculate tax and shipping]
  tax --> method{Payment method}
  method -->|card| sca{3-D Secure required?}
  method -->|wallet| wallet[Apple or Google Pay]
  sca -->|yes| challenge[Issuer challenge]
  sca -->|no| auth
  challenge --> auth[Authorise with PSP]
  wallet --> auth
  auth --> psp[Payment provider external]
  psp --> result{Decision}
  result -->|declined| retry[Show reason, offer another method]
  retry --> method
  result -->|approved| reserve[Reserve stock]
  reserve --> stock{Stock still available?}
  stock -->|no| refund[Void authorisation]
  refund --> sorry([Sold out])
  stock -->|yes| order[Create order]
  order --> events{{Order placed event}}
  events --> warehouse[Fulfilment]
  events --> receipt[Receipt email]
  events --> ledger[(Finance ledger)]
  warehouse --> shipped([Shipped])
%%mp: node psp icon=general:credit-card
%%mp: edge auth->psp note="Authorise only. Capture happens when the parcel leaves the warehouse."` },

  { title: 'On-call incident response', source: `flowchart TD
  alert[Alert fires] --> page[Page the on-call engineer]
  page --> ack{Acknowledged in 5 min?}
  ack -->|no| escalate[Escalate to secondary]
  escalate --> ack2{Acknowledged in 5 min?}
  ack2 -->|no| manager[Escalate to engineering manager]
  ack2 -->|yes| triage
  manager --> triage
  ack -->|yes| triage{Customer impact?}
  triage -->|none| ticket[File a ticket, resolve in hours]
  triage -->|degraded| sev2[Declare SEV-2]
  triage -->|outage| sev1[Declare SEV-1]
  sev1 --> channel[Open incident channel and bridge]
  sev2 --> channel
  channel --> comms[Post to status page]
  channel --> mitigate[Mitigate: roll back, fail over, or shed load]
  mitigate --> verify{Metrics recovered?}
  verify -->|no| mitigate
  verify -->|yes| monitor[Monitor for 30 minutes]
  monitor --> resolve[Resolve and update status page]
  resolve --> postmortem([Blameless postmortem within 5 days])
%%mp: node postmortem note="Written by the incident commander. Action items get owners and dates, or they do not exist."` },

  { title: 'Password reset', source: `flowchart TD
  request([Forgot password]) --> email[Enter email address]
  email --> lookup{Account exists?}
  lookup -->|no| generic
  lookup -->|yes| token[Mint single-use reset token]
  token --> store[(Store token hash, 15 min TTL)]
  store --> send[Send reset link]
  send --> generic[Show the same message either way]
  generic --> wait([Check your inbox])
  send -.-> opened[User opens the link]
  opened --> check{Token valid and unused?}
  check -->|no| expired[Link expired or already used]
  expired --> request
  check -->|yes| form[New password form]
  form --> policy{Meets policy and not breached?}
  policy -->|no| form
  policy -->|yes| update[Update hash, invalidate token]
  update --> sessions[Revoke every other session]
  sessions --> confirm[Send 'password changed' notice]
  confirm --> done([Signed in])
%%mp: node generic note="Identical response whether or not the account exists: anything else is an account enumeration oracle."` },

  { title: 'Kubernetes rolling deployment', source: `flowchart TD
  apply[kubectl apply] --> api[API server]
  api --> etcd[(etcd)]
  api --> deploy[Deployment controller]
  deploy --> newrs[New ReplicaSet at revision N+1]
  deploy --> oldrs[Old ReplicaSet at revision N]
  newrs --> sched[Scheduler places a Pod]
  sched --> node[Node kubelet]
  node --> pull[Pull image]
  pull --> startup{Startup probe passes?}
  startup -->|no| crash[CrashLoopBackOff]
  crash --> rollback
  startup -->|yes| ready{Readiness probe passes?}
  ready -->|no| wait[Kept out of the Service endpoints]
  wait --> ready
  ready -->|yes| endpoints[Added to Service endpoints]
  endpoints --> scaledown[Scale old ReplicaSet down by one]
  scaledown --> more{More old Pods left?}
  more -->|yes| sched
  more -->|no| done([Rollout complete])
  rollback[kubectl rollout undo] --> oldrs
%%mp: node etcd archetype=database
%%mp: node api icon=k8s:k8s` },

  { title: 'Ingestion pipeline with a dead-letter queue', source: `flowchart LR
  producers[Partner webhooks] --> gw[Ingest gateway]
  gw --> validate{Schema valid?}
  validate -->|no| dlq[(Dead-letter queue)]
  validate -->|yes| topic{{Raw events topic}}
  topic --> enrich[Enrichment worker]
  enrich --> lookup[(Customer store)]
  enrich --> ok{Enriched?}
  ok -->|no| dlq
  ok -->|yes| curated{{Curated events topic}}
  curated --> warehouse[(Warehouse)]
  curated --> realtime[Realtime aggregates]
  dlq --> triage[Daily triage job]
  triage --> replay[Replay after a fix]
  replay --> topic
  warehouse --> dbt[dbt models]
  dbt --> bi[BI dashboards]
%%mp: node dlq note="Every message that fails twice lands here with its error. Nothing is dropped silently."
%%mp: edge replay->topic semantics=async` },

  { title: 'Support ticket triage', source: `flowchart TD
  in([Ticket arrives]) --> source{Channel}
  source -->|email| parse[Parse and thread]
  source -->|chat| parse
  source -->|phone| parse
  parse --> classify[Classify intent and product area]
  classify --> auto{Known self-serve answer?}
  auto -->|yes| suggest[Reply with the article, keep the ticket open 48h]
  suggest --> resolved{Customer replied?}
  resolved -->|no| close([Auto-close])
  resolved -->|yes| queue
  auto -->|no| queue[Route to the owning team]
  queue --> sev{Severity}
  sev -->|P1| oncall[Page the on-call engineer]
  sev -->|P2| sprint[Add to this sprint]
  sev -->|P3| backlog[Backlog]
  oncall --> fix[Fix and reply]
  sprint --> fix
  backlog --> fix
  fix --> csat([Ask for a rating])` },

  { title: 'Canary release with automatic rollback', source: `flowchart LR
  release[Release candidate] --> flagged[Behind a feature flag]
  flagged --> internal[Internal users only]
  internal --> dogfood{Bugs found?}
  dogfood -->|yes| fix[Fix and rebuild]
  fix --> release
  dogfood -->|no| one[1% of traffic]
  one --> slo1{Latency and errors within SLO for 30 min?}
  slo1 -->|no| kill[Kill switch: flag off]
  slo1 -->|yes| ten[10% of traffic]
  ten --> slo2{Still within SLO for 2 hours?}
  slo2 -->|no| kill
  slo2 -->|yes| half[50% of traffic]
  half --> slo3{Business metrics unharmed?}
  slo3 -->|no| kill
  slo3 -->|yes| all[100%]
  all --> cleanup[Delete the flag and the old path]
  kill --> investigate[Investigate with the recorded traces]
  investigate --> fix
%%mp: node kill note="Automatic. The flag flips without a deploy, so recovery is seconds rather than a pipeline run."` },
]
