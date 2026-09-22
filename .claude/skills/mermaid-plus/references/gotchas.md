# Gotchas

Failure modes that produce a wrong diagram without an error. Each of these cost real
debugging time.

## A bare `%%` line breaks the entire file

A comment line with nothing after the `%%` is not matched by Mermaid's comment
stripper, which then swallows the following newlines. The parse fails on line 1 with
something like:

```
Parse error on line 1:
%%flowchart TB
^
Expecting 'NEWLINE', 'SPACE', 'GRAPH', got 'NODE_STRING'
```

Every comment line needs text after the `%%`. For a visual separator use
`%% ─────────────` or `%% ---`, never a lone `%%`.

## Two directives for the same subject — the second wins, silently

Directives are collected into a map keyed by subject. A second line for the same
node/edge/group **replaces** the first; attributes are not merged.

```
%%mp: node api icon=general:server        ← silently discarded
%%mp: node api note="Every request enters here."
```

The node renders with the note and no icon, and nothing warns you. Symptom: you
wrote a block of `icon=` directives and a block of `note=` directives, and none of
the icons appear.

Put every attribute for one subject on one line.

## Edge subjects must match the graph exactly

`%%mp: edge orders->pg` matches an edge declared `orders --> pg`. It must be:

- the same two ids,
- in the same direction as the arrow,
- with no whitespace around `->`.

A mismatch is silent. If an edge note isn't showing, this is why.

## Directives on ids that don't exist do nothing

Renaming a node in the graph without updating its directives leaves orphaned
annotations that are silently ignored. There is no warning for a `node`, `group` or
`edge` subject that isn't in the graph — only for an unknown *target* (e.g.
`%%mp: nodes api …`).

The bundled validator checks for this. Run it.

## Unknown icon names are dropped silently

`icon=general:datbase` renders no icon and reports nothing. Check names against
`icons.md` rather than guessing from a mental model of Lucide.

## A technology keyword brands a label that only mentions it

The ~90 names in the `tech` pack match on the bare word, with no qualifier needed.
So a node that names a technology it *is not* still gets that technology's logo:

| Label | Renders wearing |
|---|---|
| `Postgres Compatible Store` | the Postgres elephant |
| `Mongo Compatible API` | the Mongo leaf |
| `Okta Migration Tool` | Okta |
| `Slack Replacement` | Slack |
| `Not Stripe` | Stripe |

Suppress it — `icon=none`, or a neutral glyph:

```
%%mp: node STORE archetype=database icon=none note="Wire-compatible with Postgres; not Postgres."
```

**AWS is the exception and is already safe.** An AWS mark only applies when the
label also contains the word `aws`, so `Lambda function` and `S3 Compatible Object
Storage` are deliberately left unbranded. Don't add defensive overrides for those —
they're redundant, and redundant annotation hides the fact that inference is
working.

## Validating inside the Mermaid Plus repo

The bundled `scripts/validate-mmd.mjs` is standalone and heuristic — it parses ids
with regexes rather than the real grammar, so it is conservative and skips the
dangling-subject check for non-flowchart diagrams.

When you are working inside the Mermaid Plus repo, you can validate for real by
running the source through the actual pipeline in a Vitest file — that additionally
catches layout defects the standalone checker cannot see (NaN geometry, node
overlap, unrouted edges, steps that frame nothing):

```ts
// @vitest-environment jsdom
import ELK from 'elkjs/lib/elk.bundled.js'
import { parseDiagram } from '@/core/parse'
import { enrich } from '@/core/enrich'
import { resolveIcons } from '@/core/icons'
import { compile } from '@/app/pipeline'
import { runLayout } from '@/core/layout'
import { cleanLight } from '@/core/theme'
import { parseWalkthrough, stepHighlight } from '@/app/walkthrough'
```

Assert: `parsed.ok`, `parsed.warnings` empty, every directive subject present in the
IR, no duplicate subjects, `resolveIcons(...).missing` empty, every step's
`stepHighlight` non-empty, and the compiled layout free of NaN boxes and overlaps.
