import type { Example } from './types'

export const state: Example[] = [
  { title: 'Order lifecycle', source: `stateDiagram-v2
  [*] --> Draft
  Draft --> Placed : submit
  Placed --> Authorised : payment authorised
  Placed --> Cancelled : payment declined
  Authorised --> Picking : stock reserved
  Authorised --> Cancelled : out of stock
  Picking --> Packed : items picked
  Packed --> Shipped : handed to carrier
  Shipped --> Delivered : carrier confirms
  Shipped --> Lost : no scan for 14 days
  Delivered --> Returned : return requested
  Lost --> Refunded
  Returned --> Refunded
  Cancelled --> [*]
  Refunded --> [*]
  Delivered --> [*] : after 30 days
  note right of Authorised
    Money is held, not taken.
    Capture happens at Shipped.
  end note` },

  { title: 'HTTP circuit breaker', source: `stateDiagram-v2
  [*] --> Closed
  Closed --> Open : failures > threshold
  Open --> HalfOpen : cooldown elapsed
  HalfOpen --> Closed : probe succeeded
  HalfOpen --> Open : probe failed
  state Closed {
    [*] --> Passing
    Passing --> Counting : failure
    Counting --> Passing : success
    Counting --> Counting : failure
  }
  state HalfOpen {
    [*] --> OneRequest
    OneRequest --> Deciding : response or timeout
  }
  note left of Open
    Every call fails fast.
    No thread waits on a service
    that is already known to be down.
  end note` },

  { title: 'Pull request review', source: `stateDiagram-v2
  [*] --> Draft
  Draft --> Open : ready for review
  Open --> ChangesRequested : reviewer objects
  ChangesRequested --> Open : new commits pushed
  Open --> Approved : approvals met
  Approved --> ChangesRequested : new commits invalidate
  Approved --> Queued : merge queue
  Queued --> Merged : checks green on the merged result
  Queued --> Open : checks failed, dequeued
  Open --> Closed : abandoned
  Draft --> Closed : abandoned
  Merged --> [*]
  Closed --> [*]` },

  { title: 'Video player', source: `stateDiagram-v2
  [*] --> Idle
  Idle --> Loading : load(src)
  Loading --> Ready : metadata parsed
  Loading --> Error : network or codec failure
  Ready --> Playing : play()
  Playing --> Paused : pause()
  Paused --> Playing : play()
  Playing --> Buffering : buffer underrun
  Buffering --> Playing : buffer refilled
  Buffering --> Error : stalled for 30s
  Playing --> Ended : reached duration
  Ended --> Playing : replay()
  Error --> Loading : retry()
  Ended --> [*]
  state Playing {
    [*] --> Normal
    Normal --> Seeking : seek(t)
    Seeking --> Normal : seeked
    Normal --> Scrubbing : drag started
    Scrubbing --> Seeking : drag released
  }` },

  { title: 'Subscription billing', source: `stateDiagram-v2
  [*] --> Trialing
  Trialing --> Active : card charged
  Trialing --> Cancelled : trial ended, no card
  Active --> PastDue : charge failed
  PastDue --> Active : retry succeeded
  PastDue --> Unpaid : all retries exhausted
  Unpaid --> Active : customer pays
  Unpaid --> Cancelled : after 30 days
  Active --> Paused : customer pauses
  Paused --> Active : resume
  Active --> Cancelled : cancel at period end
  Cancelled --> [*]
  note right of PastDue
    Four retries over 21 days:
    day 1, 3, 7, 21. Dunning email
    on each attempt.
  end note` },

  { title: 'Rollout with a kill switch', source: `stateDiagram-v2
  [*] --> Off
  Off --> Internal : enable for staff
  Internal --> Off : kill switch
  Internal --> Canary : staff sign-off
  Canary --> Off : kill switch
  Canary --> Ramping : SLO holds for 30 min
  Ramping --> Off : kill switch
  Ramping --> Full : 100% for 24 hours
  Full --> Off : kill switch
  Full --> Retired : old path deleted
  Retired --> [*]
  state Ramping {
    [*] --> TenPercent
    TenPercent --> FiftyPercent : metrics healthy
    FiftyPercent --> Hundred : metrics healthy
  }` },

  { title: 'TCP connection', source: `stateDiagram-v2
  [*] --> Closed
  Closed --> Listen : passive open
  Closed --> SynSent : active open, send SYN
  Listen --> SynReceived : receive SYN, send SYN+ACK
  SynSent --> SynReceived : simultaneous open
  SynSent --> Established : receive SYN+ACK, send ACK
  SynReceived --> Established : receive ACK
  Established --> FinWait1 : close, send FIN
  Established --> CloseWait : receive FIN, send ACK
  FinWait1 --> FinWait2 : receive ACK
  FinWait1 --> Closing : receive FIN
  FinWait2 --> TimeWait : receive FIN
  Closing --> TimeWait : receive ACK
  CloseWait --> LastAck : close, send FIN
  LastAck --> Closed : receive ACK
  TimeWait --> Closed : 2MSL elapsed` },

  { title: 'Background job', source: `stateDiagram-v2
  [*] --> Queued
  Queued --> Running : worker claims it
  Queued --> Cancelled : cancelled before start
  Running --> Succeeded : completed
  Running --> Retrying : recoverable failure
  Running --> Failed : unrecoverable failure
  Running --> Lost : worker heartbeat stopped
  Lost --> Retrying : reaper requeues
  Retrying --> Running : backoff elapsed
  Retrying --> Failed : attempts exhausted
  Failed --> Queued : replayed by an operator
  Succeeded --> [*]
  Cancelled --> [*]
  note left of Retrying
    Exponential backoff with jitter.
    Attempt n waits 2^n seconds,
    capped at 15 minutes.
  end note` },

  { title: 'Document approval', source: `stateDiagram-v2
  [*] --> Drafting
  Drafting --> InReview : submit
  InReview --> Drafting : changes requested
  InReview --> LegalReview : needs legal
  InReview --> Approved : approved
  LegalReview --> Drafting : legal objects
  LegalReview --> Approved : legal signs off
  Approved --> Published : publish
  Published --> Superseded : newer version published
  Published --> Archived : retired
  Superseded --> [*]
  Archived --> [*]
  state InReview {
    [*] --> AwaitingReviewers
    AwaitingReviewers --> PartiallyApproved : first approval
    PartiallyApproved --> QuorumMet : quorum reached
  }` },

  { title: 'Device provisioning', source: `stateDiagram-v2
  [*] --> Manufactured
  Manufactured --> Registered : serial recorded
  Registered --> Claimed : owner scans the QR code
  Claimed --> Provisioning : certificate issued
  Provisioning --> Online : first heartbeat
  Provisioning --> Failed : certificate rejected
  Failed --> Provisioning : reissue
  Online --> Offline : no heartbeat for 5 min
  Offline --> Online : heartbeat resumes
  Online --> Updating : firmware push
  Updating --> Online : update applied
  Updating --> Recovery : update failed, rollback
  Recovery --> Online : previous image booted
  Online --> Decommissioned : owner unclaims
  Offline --> Decommissioned : after 90 days
  Decommissioned --> [*]` },
]
