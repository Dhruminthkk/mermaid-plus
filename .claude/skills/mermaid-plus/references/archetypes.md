# Archetypes

An archetype decides a node's geometry, colour and default icon. Ten exist:

`service` · `database` · `queue` · `storage` · `user` · `external` · `process` ·
`decision` · `note` · `default`

## How one is chosen

In order — the first rule that matches wins:

**1. The bracket shape, when it is unambiguous.**

| Mermaid shape | Archetype |
|---|---|
| `id[(Label)]` cylinder | database |
| `id{{Label}}` hexagon | queue |
| `id{Label}` diamond | decision |
| `id>Label]` odd | note |

Other shapes (stadium, circle, subroutine…) only suggest geometry and fall through
to the label.

**2. A whole word in the label.** First group with a hit wins, in this order:

| Archetype | Keywords |
|---|---|
| database | db, database, postgres, postgresql, mysql, mongo, mongodb, redis, cache, dynamodb, sqlite, rds |
| queue | queue, kafka, sqs, rabbitmq, topic, stream, pubsub, broker |
| storage | s3, bucket, blob, storage, filesystem, cdn |
| user | user, client, browser, customer, actor, person |
| external | external, third-party, vendor, stripe, twilio, github |
| service | service, api, server, worker, lambda, gateway, handler, microservice, daemon, job |

**3. Otherwise `default`.**

## Matching is whole-word, and that bites

The label is lowercased and split on non-alphanumerics, then matched as whole tokens.
Plurals and compounds therefore do **not** match:

| Label | Inferred | Probably wanted |
|---|---|---|
| `ERP Services` | `default` — "services" ≠ "service" | `service` |
| `Internal MCP Servers` | `default` — "servers" ≠ "server" | `service` |
| `Third Party MCP Servers` | `default` — "third-party" is hyphenated in the keyword list, the label isn't | `external` |
| `User Interaction Events` | `user` — "user" matched a person keyword | `default` (it's an event stream) |
| `Customer Data Pipeline` | `user` — "customer" matched | `service` |
| `Cache Invalidation Worker` | `database` — "cache" wins over "worker" | `service` |

The last three are the dangerous ones: the diagram renders happily, just with a
person-shaped event stream or a database-coloured worker. Predict the inference,
then override where it's wrong.

## Adapter-assigned archetypes are left alone

For class, ER, state and C4 diagrams the adapter already assigns meaning from the
notation, and label inference is deliberately skipped — a class called `Payment` is
not a queue, an ER table called `CUSTOMER` is not a person. You can still override
explicitly.

## Overriding

```
%%mp: node SERVICES archetype=service
%%mp: node UIEVENT archetype=default icon=general:eye
%%mp: node THIRD archetype=external
```

`archetype=default` is a legitimate and often necessary value — it's how you undo a
bad inference rather than accept it.
