# Mermaid Plus

A Mermaid viewer that draws diagrams the way you wish Mermaid did: ELK-driven orthogonal layout with real nested groups, semantic node shapes and icons, ten theme families in light and dark (including a hand-drawn one), and the navigation tools a 300-node architecture needs — all from standard Mermaid source, all in the browser, no server.

**It renders every Mermaid diagram type.** Graph-shaped diagrams (flowchart, class, ER, state, mindmap, requirement, C4) go through the custom pipeline. Everything else (sequence, gantt, pie, timeline, journey, sankey, quadrant, xy, git, …) is drawn by mermaid.js wearing the same theme, so new upstream diagram kinds work the day the dependency is bumped.

## Highlights

- **Layout** — [ELK](https://www.eclipse.org/elk/) layered layout with orthogonal, rounded edges; subgraphs are true compound nodes; edge labels get reserved space; edges may target groups (composite states, C4 boundaries).
- **Archetypes** — nodes are inferred to be a `service`, `database`, `queue`, `storage`, `user`, `external`, `decision` or `note` from their shape and label, and drawn with matching geometry, color and icon. Override any of it with a directive.
- **Icons** — a general glyph set plus AWS, GCP, Azure and Kubernetes/infra marks, lazily loaded and inlined into exports.
- **Themes** — Clean, Slate, Blueprint, Notebook (rough.js sketch texture), Vivid, Contrast (WCAG AA), Paper, Mono, Terminal and Ocean, each in light and dark. Every text/fill pair is contrast-checked by a test, as is the canvas against the nodes standing on it. Pick one from a grid of previews, or edit its tokens and export the result as JSON.
- **Complex systems** — collapse subgraphs to single nodes (crossing edges bundle with a `×N` weight), focus mode dims everything beyond *N* hops, search with jump, minimap, semantic zoom, and viewport culling. 500 nodes lay out in under 100 ms.
- **Walkthrough mode** — number a few `step` directives and the diagram presents itself: each step frames the parts it names, dims the rest, and shows its note. Arrow keys or play to advance, `?step=3` to deep-link into the middle of the story.
- **Explaining a diagram** — hover any node, edge or group for what it is, what it depends on and what depends on it, plus whatever the author wrote as a `note`. Click a node to light up everything it touches; the explanation moves to a panel along the bottom, out of the picture it is describing, with links you can walk the graph through. A legend, built from the shapes the diagram actually uses, is one button away.
- **Editor** — Monaco with Mermaid highlighting, error squiggles, completions for keywords, node ids, directives, themes and icons. Click a node to jump to its line; move the cursor to highlight its node. A syntax error never blanks the canvas.
- **Motion** — nodes and edges arrive rather than appear, and a highlight pulses through the graph in dependency order: an edge lights as the one feeding it lands. One toolbar toggle stills it, `prefers-reduced-motion` is obeyed everywhere, and static exports are frozen.
- **Export** — SVG (styles inlined, no CSS variables), PNG at 1×/2×/4×, PDF, copy-as-image, a standalone HTML page that keeps pan, zoom and the motion, and draw.io/Lucid XML that stays editable on the other side. Any of them with a clear background. A local library and autosaved draft live in `localStorage`.

## Examples

`?gallery` opens the library: ten examples for each of twenty diagram kinds, plus
a **Showcase** collection that leads with one diagram per capability — collapsing
a large system, presenting a walkthrough, annotating with notes and metadata,
inferred icons and archetypes, motion in dependency order, focus at scale — so
the demo is about the tool rather than the notation. Every example is a system
someone actually builds: OAuth with PKCE, a canary release, an incident timeline,
a multi-tenant schema, a dead-letter queue.

Two audits run over the whole library: `scripts/audit-examples.mjs` checks every
one for clipping, overlap, label overflow and NaN geometry, and
`scripts/audit-labels.mjs` checks for colliding edge labels. Both report zero.

## Directives

All extensions are Mermaid comments, so a file that uses them still renders in GitHub, Notion, or stock mermaid.js.

```
%%mp: theme slate-dark
%%mp: node api archetype=service icon=aws:lambda
%%mp: node db icon=none
%%mp: edge api->db semantics=async
%%mp: group backend collapsed
%%mp: layout direction=RIGHT
%%mp: node api note="Every request enters here. Terminates TLS and rate limits per tenant." owner="Platform"
%%mp: step 1 title="A shopper arrives" focus=user,cdn note="Most catalogue reads never travel further than the CDN."
```

Values may be quoted, so a note can be a sentence.

| Directive | Effect |
|---|---|
| `theme <id>` | Pins a theme for this diagram (overrides the UI). Ids are `<family>-light` / `<family>-dark` for `clean`, `slate`, `blueprint`, `notebook`, `vivid`, `contrast`, `paper`, `mono`, `terminal` and `ocean`. |
| `node <id> archetype=<a>` | `service`, `database`, `queue`, `storage`, `user`, `external`, `process`, `decision`, `note`, `default`. |
| `node <id> icon=<ref>` | `general:<name>` (or bare name), `aws:<name>`, `gcp:<name>`, `azure:<name>`, `k8s:<name>`, or `none`. |
| `edge <a>-><b> semantics=<s>` | `flow`, `async`, `dependency`, `association`, `inheritance`, `composition`, `bidirectional`. |
| `group <id> collapsed` | Starts a subgraph collapsed. |
| `node <id> note="…"` | Prose shown when a reader hovers the node. Works on `edge` and `group` too. |
| `node <id> <key>="…"` | Any other attribute is shown as metadata on hover — `owner`, `team`, `sla`, whatever you need. |
| `layout edgeLabels=beside` | Moves edge labels off the line. They sit on it by default. |
| `layout flow=<all\|auto\|none>` | Which edges carry a travelling highlight. Every edge by default, pulsing in graph order — an edge lights as the one feeding it finishes. `auto` narrows it to the broken lines (`-.->` and anything marked `semantics=async`). |
| `layout motion=off` | Stills this diagram: no entrance, no travelling highlights. |
| `edge <a>-><b> flow` | Forces the highlight on one edge; `flow=false` takes it off one. |
| `step <n> focus=<ids> title="…" note="…"` | One step of a walkthrough. Naming a group names everything inside it; naming nothing is a title card over the whole diagram. |
| `layout direction=<d>` | `DOWN`, `RIGHT`, `UP`, `LEFT` (or `TB`/`LR`/`BT`/`RL`). |

## Guide, demos and the landing page

- **[site/guide/](site/guide/)** — a nine-chapter HTML guide, from the first
  three lines through to a directive reference, with worked use cases.
- **[site/](site/)** — the landing page. Deploy the whole `site/` folder anywhere
  static; it expects to sit at the root of the same host as the app.
- **[docs/marketing.md](docs/marketing.md)** — how the screenshots and demo
  recordings are made, and how to change the choreography.

- **[site/demo/](site/demo/)** — a looping sixty-second advertisement,
  1920×1080 and 1080×1920. Link to it, or point a screen recorder at one.

```bash
npm run capture      # screenshots, from the real app
npm run demo:scenes  # re-render the diagrams the demo pages play
npm run demo:build   # assemble the demo pages
npm run record       # screen recordings of the live app
```

## Development

```bash
npm install
npm run dev          # http://localhost:5173  (add ?gallery for the example gallery)
npm test             # unit tests (Vitest)
npm run typecheck
npm run test:e2e     # Playwright: functional + visual regression
npm run build        # static site in dist/
```

Visual baselines live in `e2e/*-snapshots` and are recorded on macOS; regenerate with `npx playwright test --update-snapshots=all` after an intentional rendering change. Icon packs are extracted from the Iconify sets with `node scripts/build-icons.mjs`.

## Architecture

```
source → parse (mermaid as a parser) → DiagramIR → enrich → collapse → layout (ELK, in a worker) → render (pure SVG)
```

`DiagramIR` is the seam: the renderer never sees Mermaid syntax, and a future generation layer can emit IR directly. Mermaid's internals are touched in exactly one file, `src/core/parse/mermaid-adapter.ts`. The design spec is in `docs/superpowers/specs/`.
