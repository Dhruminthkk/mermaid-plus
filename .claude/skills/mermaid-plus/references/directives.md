# Directive reference

Every directive is a Mermaid comment of the form:

```
%%mp: <target> [subject] key=value key="quoted value"
```

Values may be quoted, so a note can be a whole sentence. Quoting is required for any
value containing a space. Single or double quotes both work.

Directives may sit anywhere in the file — before the graph, after it, or interleaved.
Convention in this codebase: `theme`/`layout` at the top, `step` next, then the graph,
then `group`/`node`/`edge` annotations at the bottom under `%% ───` separators.

## Targets

| Target | Subject | Purpose |
|---|---|---|
| `theme` | — | Pin a theme for this diagram, overriding the UI |
| `layout` | — | Direction, edge-label placement, motion |
| `node` | node id | Shape, icon, note, arbitrary metadata |
| `group` | subgraph id | Note, metadata, start collapsed |
| `edge` | `source->target` | Semantics, note, metadata |
| `step` | step number | One step of a walkthrough |

An unknown target produces a parse warning. A known target with a subject that does
not exist in the graph produces **no warning at all** — it is silently ignored. Run
the validator.

## theme

```
%%mp: theme slate-dark
```

Ids are `<family>-light` or `<family>-dark` for: `clean`, `slate`, `blueprint`,
`notebook` (hand-drawn, rough.js texture), `vivid`, `contrast` (WCAG AA), `paper`,
`mono`, `terminal`, `ocean`. Twenty in total.

Choosing:
- `slate` — dense, cool-neutral, high contrast. The "architecture doc" look.
- `blueprint` — literal blueprint. Good for infrastructure.
- `clean` — the default. Neutral and unopinionated.
- `contrast` — when accessibility is the requirement.
- `notebook` — hand-drawn. Good for sketches and RFCs, wrong for a board deck.
- `terminal`, `mono`, `paper`, `ocean`, `vivid` — stylistic.

## layout

```
%%mp: layout direction=DOWN        # DOWN | RIGHT | UP | LEFT (or TB/LR/BT/RL)
%%mp: layout edgeLabels=beside     # move edge labels off the line; default is on it
%%mp: layout flow=auto             # all | auto | none — which edges carry the travelling highlight
%%mp: layout motion=off            # still this diagram entirely
```

`flow=all` (the default) pulses every edge in dependency order — an edge lights as
the one feeding it lands. `flow=auto` narrows it to dashed and async edges.

## node

```
%%mp: node <id> archetype=<a> icon=<ref> note="…" <anyKey>="…"
```

- `archetype` — `service`, `database`, `queue`, `storage`, `user`, `external`,
  `process`, `decision`, `note`, `default`. See `archetypes.md`.
- `icon` — `general:<name>`, `tech:<name>`, `aws:<name>`, `gcp:<name>`,
  `azure:<name>`, `k8s:<name>`, a bare name (resolves to `general:`), or `none` to
  suppress the icon entirely. See `icons.md`.
- `note` — prose shown on hover.
- Any other key becomes metadata shown on hover: `owner`, `team`, `sla`, `build`,
  `tier`, `retention`, whatever the diagram needs.

**One directive per node.** A second `node` line for the same id replaces the first
outright; attributes do not merge.

## group

```
%%mp: group <id> note="…" <anyKey>="…"
%%mp: group <id> collapsed
```

`collapsed` starts the subgraph collapsed to a single node; edges that crossed its
boundary bundle into one carrying a `×N` count. Useful for a large estate you want
read at a higher altitude first.

## edge

```
%%mp: edge <source>-><target> semantics=<s> note="…" <anyKey>="…"
%%mp: edge <source>-><target> flow          # force the travelling highlight on
%%mp: edge <source>-><target> flow=false    # take it off
```

`semantics` — `flow` (default), `async`, `dependency`, `association`, `inheritance`,
`composition`, `bidirectional`. `async` and `dependency` both render dashed, with
slightly different dash patterns.

The subject must match the edge exactly as the graph declares it: `orders->pg`, no
spaces, same direction as the arrow.

## step

```
%%mp: step <n> title="…" focus=<ids> note="…"
```

- `n` — steps are ordered by this number, not by line position.
- `focus` — comma- or space-separated node and group ids. Naming a group names
  everything inside it. **Omitting `focus` entirely makes a title card** over the
  whole diagram.
- `title`, `note` — shown in the walkthrough bar as the step plays.

`?step=3` in the URL deep-links into the middle of a walkthrough.
