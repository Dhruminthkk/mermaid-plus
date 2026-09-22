---
name: mermaid-plus
description: Enhance any Mermaid diagram with Mermaid Plus directives — inferred icons and archetypes, hover notes, owner/build metadata, edge semantics, themes, and a walkthrough that presents the diagram for you — all written as `%%` comments so the file still renders in GitHub, Notion and stock mermaid.js. Use this whenever you write, edit, review or are handed a Mermaid diagram (a `.mmd` file, a ```mermaid block, flowchart/graph/classDiagram/erDiagram/stateDiagram/C4/mindmap), whenever someone asks to make a diagram clearer, prettier, presentable, annotated or just "better", and whenever a diagram is headed for a deck, README, architecture review or customer doc — even if Mermaid Plus is never mentioned by name.
---

# Mermaid Plus

Mermaid Plus renders standard Mermaid with real layout, semantic shapes, technology
icons, themes and a presentation mode. Every extension is written as a `%%` comment,
so a file you enhance still renders in GitHub, Notion and mermaid.js — just without
the extras. That property is the whole point: **enhancement is additive and free of
risk**, which is why it is almost always worth doing.

## The one rule that matters

**Never change the graph. Only add comments.**

Do not rename a node, redraw an edge, restructure a subgraph or "improve" a label
unless you were explicitly asked to. The author's diagram is the source of truth;
you are annotating it, not redesigning it. If the structure genuinely seems wrong,
say so in your reply — don't silently fix it.

A good enhancement passes this test: delete every line starting with `%%` and you
get back byte-identical the diagram you were given.

## How to work

### 1. Read the diagram and understand what it actually is

Before annotating anything, work out what the system does and who the diagram is
for. Annotations written without that understanding read as filler — "The database.
Stores data." — and filler is worse than nothing, because it costs the reader a
hover and gives them nothing back.

If the diagram belongs to a repo, skim the surrounding code or README first. The
best notes come from knowing which box is the one everyone gets wrong.

### 2. Let inference do the work, then check what it did

Mermaid Plus already infers shape, colour and icon from the label and the bracket
shape. A node called `PostgreSQL` becomes a database cylinder wearing the Postgres
mark with nothing annotated by hand. Annotating what inference already got right is
noise, and it hides the fact that the tool is doing the work.

So: predict what inference will produce (see `references/archetypes.md`), and only
write a directive where it would be **wrong or missing**. Leave at least the obvious
technology nodes — Kafka, Postgres, Redis, S3 — completely unannotated.

### 3. Override only what inference gets wrong

Two failure modes are common enough to look for every time:

- **A word in the label hijacks the archetype.** Matching is whole-word, so
  `User Interaction Events` becomes a `user` (a person) when it is really an event
  stream. Fix with `archetype=default`.
- **A near-miss leaves a node generic.** `ERP Services` does not match the keyword
  `service` (singular), so it stays `default`. Fix with `archetype=service`.

### 4. Write notes that say something non-obvious

A note is prose shown when a reader hovers. It earns its place by carrying what the
diagram cannot draw: a constraint, a consequence, a decision, a warning.

Aim for one or two sentences. Declarative, specific, opinionated.

**Weak** — restates the label:
`note="The Kafka message broker. Handles events."`

**Strong** — tells you something the picture can't:
`note="The seam. One bus, one direction, one contract between a system of record and everything experimental standing next to it."`

The highest-value notes are usually on **edges**, not nodes, because an arrow is the
least self-explanatory thing on a diagram. `A --> B` never says whether that's a
synchronous call, a nightly batch, or the one path that bypasses validation.

### 5. Add metadata that answers a question someone actually asks

Any attribute that isn't `archetype`, `icon` or `note` shows as metadata on hover.
Pick keys that answer a real question about this diagram:

- `build="existing"` / `"new"` / `"vendor"` — for a proposal, this answers "what do
  we actually have to build?", which is usually the first question in the room.
- `owner=` / `team=` / `oncall=` — for a system map, this answers "who do I page?"
- `sla=` / `tier=` / `retention=` — for an operational diagram.

Use one dimension consistently across every node so it scans, plus a second on the
few nodes where it's load-bearing. Metadata nobody would ask about is clutter.

### 6. Mark what the arrows mean

`semantics=async` draws a dashed line; use it for events, queues, fire-and-forget.
`semantics=dependency` also dashes, and reads as *consulted* rather than *called* —
right for a policy or registry that bounds a decision rather than receiving data.

Use these sparingly enough that they stay meaningful. If most edges are dashed,
none of them say anything.

### 7. Add a walkthrough when someone will present the diagram

`step` directives turn the diagram into a presentation: each step frames the parts
it names, dims the rest, and shows its note. Arrow keys or play advance it.

A walkthrough is a **sequence of claims**, not a tour of the boxes. Each step should
be a thing you'd actually say out loud. Open with a title card that states the
thesis, then build it, then end with a title card over the whole picture.

```
%%mp: step 1 title="An assistant beside the ERP, not inside it" note="Nothing in the transactional core changes."
%%mp: step 2 title="Start with what already runs" focus=EXISTING note="This spine is in production today."
%%mp: step 9 title="The whole picture"
```

Naming a group in `focus=` names everything inside it. Naming nothing makes a title
card over the whole diagram. Six to ten steps suits most architecture diagrams.

Skip the walkthrough for a diagram nobody will present — a small reference diagram
in a README doesn't need one, and adding one is just weight.

### 8. Pin a theme only for a set

If you're annotating one diagram, leave the theme alone so the reader's own choice
applies. If you're annotating a **set** that will be shown together, pin the same
theme in every file so the deck is coherent — and say in your reply which line to
delete to undo it.

### 9. Validate before you hand it back

Run the bundled checker. It catches the failure modes that are invisible on
inspection — a directive pointing at a node id that doesn't exist does nothing at
all, silently.

```bash
node scripts/validate-mmd.mjs path/to/diagram.mmd
```

If you're working inside the Mermaid Plus repo itself, prefer the real pipeline —
it catches layout problems the standalone checker can't see. See
`references/gotchas.md` → "Validating inside the repo".

## Four traps that cost real debugging time

These are not theoretical. Each one produced a silently wrong diagram.

**A bare `%%` line breaks the whole file.** Mermaid's comment stripper eats the
following newlines, and you get `%%flowchart TB` as line 1 and a parse error. Every
comment line needs text after the `%%`. Use `%% ──────` as a separator, never a
lone `%%`.

**Two directives for the same subject: the second silently replaces the first.**
Attributes do not merge. This does *not* give the node an icon and a note — it gives
it only a note, and the icon is silently dropped:

```
%%mp: node api icon=general:server        ← lost
%%mp: node api note="Every request enters here."
```

Put everything for one subject on **one line**. It gets long; that's fine.

**An `edge` subject must match `source->target` exactly** as written in the graph —
no spaces, and the same direction the arrow points. A typo doesn't warn, it just
does nothing.

**A label that merely mentions a technology gets that technology's logo.** Matching
is on the word, not the meaning, so all of these get branded with someone else's
mark: `Postgres Compatible Store` → the Postgres elephant, `Mongo Compatible API` →
the Mongo leaf, `Okta Migration Tool` → Okta, `Slack Replacement` → Slack. Even
`Not Stripe` renders wearing the Stripe logo.

When a label names a technology it *isn't* — compatible-with, alternative-to,
migrating-off, replacing — suppress the mark rather than ship a factual
misstatement: `icon=none`, or a neutral glyph like `icon=general:hard-drive`.

The AWS pack is the exception: an AWS mark only applies when the label also contains
the word `aws`, so `Lambda function` and `S3 Compatible Object Storage` are left
alone by design. The unguarded ~90 names in the `tech` pack are where this bites.

## Reference files

Read these as needed — they're detail, not narrative.

- **`references/directives.md`** — the complete directive grammar: every target,
  attribute and legal value. Read when you need the exact syntax.
- **`references/icons.md`** — all 357 icon names across the six packs, plus the
  auto-inference keyword list. Read when choosing an icon; **never guess a name**,
  an unknown icon is silently dropped.
- **`references/archetypes.md`** — the ten archetypes, the shape and keyword rules
  that infer them, and when to override. Read when a node looks wrong.
- **`references/gotchas.md`** — the failure modes above in full, plus how to
  validate properly inside the Mermaid Plus repo.

## A worked fragment

Input:

```
flowchart LR
  gw[API Gateway] --> orders[Orders API]
  orders --> pg[(PostgreSQL)]
  orders --> events{{Order Events}}
  events --> notify[Notification Service]
```

Enhanced — note that `pg` and `events` are left alone, because the label and shape
already make them a Postgres cylinder and a queue:

```
flowchart LR
%%mp: step 1 title="Where every request enters" focus=gw note="The only public surface. Everything behind it assumes it has already authenticated."
%%mp: step 2 title="The write path" focus=orders,pg note="One writer to the orders schema. Anything else that needs an order asks for it."
%%mp: step 3 title="Everything else is asynchronous" focus=events,notify note="The request returns as soon as the order exists. The rest happens on the bus."
%%mp: step 4 title="The whole picture"

  gw[API Gateway] --> orders[Orders API]
  orders --> pg[(PostgreSQL)]
  orders --> events{{Order Events}}
  events --> notify[Notification Service]

%%mp: node gw archetype=service icon=general:router note="Terminates TLS, authenticates and rate limits per tenant. Every public request enters here." owner="Platform" sla="99.99%"
%%mp: node orders archetype=service note="Owns the order lifecycle and is the only writer to its schema." owner="Commerce" tier="1"
%%mp: node notify archetype=service icon=general:bell note="Retries with backoff for an hour, then drops to the dead-letter queue." owner="Commerce"
%%mp: edge orders->events semantics=async note="Published after commit, so a failed publish cannot roll back an order."
%%mp: edge events->notify semantics=async note="At-least-once. The consumer is idempotent on order id."
```

Four nodes, and only three carry directives. That restraint is the skill.
