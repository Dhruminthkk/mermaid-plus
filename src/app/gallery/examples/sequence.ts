import type { Example } from './types'

export const sequence: Example[] = [
  { title: 'OAuth 2.0 authorization code with PKCE', source: `sequenceDiagram
  autonumber
  actor U as User
  participant A as Mobile app
  participant B as Browser
  participant I as Identity provider
  participant R as Resource API

  U->>A: Tap "Sign in"
  A->>A: Generate code_verifier and code_challenge
  A->>B: Open /authorize?code_challenge=...&state=...
  B->>I: GET /authorize
  I->>U: Login and consent
  U->>I: Credentials and approval
  I-->>B: 302 to app://callback?code=...&state=...
  B-->>A: Deliver the callback
  A->>A: Check state matches
  A->>I: POST /token (code, code_verifier)
  I->>I: Hash the verifier, compare with the challenge
  I-->>A: access_token, refresh_token, id_token
  A->>R: GET /me with the bearer token
  R->>I: Fetch JWKS (cached)
  R->>R: Verify signature, issuer, audience, expiry
  R-->>A: 200 profile
  Note over A,I: The verifier never leaves the device,<br/>so a stolen code cannot be redeemed.` },

  { title: 'Checkout and payment', source: `sequenceDiagram
  autonumber
  actor S as Shopper
  participant W as Storefront
  participant O as Order service
  participant P as Payment service
  participant G as Payment provider
  participant I as Inventory

  S->>W: Confirm order
  W->>O: POST /orders (Idempotency-Key)
  O->>I: Reserve stock
  alt stock available
    I-->>O: Reserved
    O->>P: Authorise 42.00 GBP
    P->>G: POST /payment_intents
    alt 3-D Secure required
      G-->>P: requires_action
      P-->>W: Redirect to the issuer
      W->>S: Issuer challenge
      S->>G: Complete the challenge
      G-->>P: Authorised
    else no challenge
      G-->>P: Authorised
    end
    P-->>O: Authorisation held
    O-->>W: 201 Created
    W-->>S: Order confirmed
  else out of stock
    I-->>O: Rejected
    O-->>W: 409 Conflict
    W-->>S: Sold out, cart updated
  end
  Note right of P: Capture happens when<br/>the parcel is dispatched.` },

  { title: 'Webhook delivery with retries', source: `sequenceDiagram
  participant E as Event bus
  participant D as Dispatcher
  participant Q as Retry queue
  participant P as Partner endpoint
  participant L as Delivery log

  E->>D: order.shipped
  D->>D: Sign the body (HMAC-SHA256)
  D->>P: POST /webhooks (Idempotency-Key, signature)
  alt 2xx
    P-->>D: 200 OK
    D->>L: Record delivered
  else 5xx or timeout
    P--xD: 503
    D->>L: Record attempt 1
    D->>Q: Schedule retry in 30s
    Q->>D: Retry
    D->>P: POST /webhooks (same key)
    P-->>D: 200 OK
    D->>L: Record delivered on attempt 2
  else 4xx
    P-->>D: 400 Bad Request
    D->>L: Record permanently failed
    D->>E: Emit webhook.failed
  end
  Note over D,Q: Backoff doubles to a 24 hour ceiling,<br/>then the endpoint is disabled.` },

  { title: 'Cache-aside read with stampede protection', source: `sequenceDiagram
  participant C as Client
  participant A as API
  participant R as Redis
  participant D as Database

  C->>A: GET /products/42
  A->>R: GET product:42
  alt hit
    R-->>A: cached value
    A-->>C: 200 (from cache)
  else miss
    R-->>A: nil
    A->>R: SET lock:product:42 NX PX 5000
    alt lock acquired
      R-->>A: OK
      A->>D: SELECT * FROM products WHERE id = 42
      D-->>A: row
      A->>R: SET product:42 value EX 300
      A->>R: DEL lock:product:42
      A-->>C: 200 (from database)
    else another request holds the lock
      R-->>A: nil
      A->>A: Wait 50ms
      A->>R: GET product:42
      R-->>A: cached value
      A-->>C: 200 (from cache)
    end
  end` },

  { title: 'Saga with compensation', source: `sequenceDiagram
  participant O as Order saga
  participant P as Payment
  participant I as Inventory
  participant S as Shipping

  O->>P: Authorise payment
  P-->>O: Authorised (authId)
  O->>I: Reserve stock
  I-->>O: Reserved (reservationId)
  O->>S: Book collection
  S--xO: No slots for 5 days

  Note over O: The booking failed, so every<br/>completed step is undone in reverse.
  O->>I: Release reservation
  I-->>O: Released
  O->>P: Void authorisation
  P-->>O: Voided
  O->>O: Mark the order failed
  O-->>O: Emit order.cancelled` },

  { title: 'Kubernetes pod scheduling', source: `sequenceDiagram
  participant U as kubectl
  participant A as API server
  participant E as etcd
  participant C as Deployment controller
  participant S as Scheduler
  participant K as Kubelet
  participant R as Container runtime

  U->>A: apply Deployment
  A->>E: Persist the object
  A-->>U: 201 Created
  E-->>C: Watch event
  C->>A: Create ReplicaSet
  A->>E: Persist
  E-->>C: Watch event
  C->>A: Create Pod (nodeName empty)
  A->>E: Persist
  E-->>S: Watch event
  S->>S: Filter and score nodes
  S->>A: Bind pod to node-3
  A->>E: Persist the binding
  E-->>K: Watch event on node-3
  K->>R: Pull image and start container
  R-->>K: Running
  K->>A: Update pod status
  A->>E: Persist
  Note over K,A: Readiness stays false until the probe<br/>passes \u2014 only then does the Service route to it.` },

  { title: 'Distributed trace of a slow request', source: `sequenceDiagram
  actor U as User
  participant G as API gateway
  participant P as Product service
  participant V as Review service
  participant D as Database
  participant C as Cache

  U->>G: GET /products/42 (traceparent)
  activate G
  G->>P: GET /products/42
  activate P
  P->>C: GET product:42
  C-->>P: miss
  P->>D: SELECT product
  activate D
  D-->>P: row (180ms)
  deactivate D
  P->>V: GET /reviews?product=42
  activate V
  V->>D: SELECT reviews
  activate D
  D-->>V: rows (620ms)
  deactivate D
  V-->>P: reviews
  deactivate V
  P-->>G: product with reviews
  deactivate P
  G-->>U: 200 (total 840ms)
  deactivate G
  Note over V,D: The reviews query is the whole budget.<br/>It has no index on product_id.` },

  { title: 'Password reset', source: `sequenceDiagram
  actor U as User
  participant W as Web app
  participant A as Auth service
  participant M as Mail service
  participant S as Session store

  U->>W: Forgot password (email)
  W->>A: POST /password/reset
  A->>A: Look up the account
  alt account exists
    A->>A: Mint a single-use token, store its hash
    A->>M: Send the reset link
    M-->>U: Email with the link
  else no account
    A->>A: Do nothing
  end
  A-->>W: 202 Accepted (identical either way)
  W-->>U: "If that address exists, we sent a link"

  U->>W: Open the link, choose a new password
  W->>A: POST /password/reset/confirm
  A->>A: Verify the token, check it is unused and fresh
  A->>A: Store the new hash, mark the token used
  A->>S: Revoke every other session
  A-->>W: 200 OK
  W-->>U: Signed in` },

  { title: 'GraphQL request with dataloader batching', source: `sequenceDiagram
  participant C as Client
  participant G as GraphQL server
  participant L as DataLoader
  participant U as User service
  participant P as Post service

  C->>G: query { posts(first: 10) { title author { name } } }
  G->>P: GET /posts?limit=10
  P-->>G: 10 posts (10 distinct author ids)
  loop resolve author for each post
    G->>L: load(authorId)
  end
  Note over L: Ten loads collapse into one call<br/>within the same tick.
  L->>U: GET /users?ids=1,2,3,4,5,6,7,8,9,10
  U-->>L: 10 users
  L-->>G: Resolve every pending promise
  G-->>C: 200 with the composed result` },

  { title: 'Two-phase database migration', source: `sequenceDiagram
  participant D as Developer
  participant M as Migration runner
  participant B as Database
  participant V1 as App v1
  participant V2 as App v2

  Note over V1: v1 is serving traffic
  D->>M: Release 1 — expand
  M->>B: ADD COLUMN email_normalised NULL
  M->>B: Backfill in batches
  B-->>M: Done
  Note over V1,B: v1 ignores the new column,<br/>so nothing breaks.

  D->>V2: Deploy v2 (writes both columns, reads the new one)
  V2->>B: INSERT email, email_normalised
  Note over V1,V2: Both versions run together<br/>during the rollout.

  D->>M: Release 2 — contract
  M->>B: SET NOT NULL on email_normalised
  M->>B: DROP COLUMN email
  B-->>M: Done
  Note over B: Never expand and contract<br/>in one release. There is no rollback.` },
]
