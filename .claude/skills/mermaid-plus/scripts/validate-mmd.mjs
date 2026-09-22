#!/usr/bin/env node
/**
 * Standalone checker for Mermaid Plus directives.
 *
 * Catches the failure modes that are invisible on inspection: a bare `%%` line
 * that breaks parsing, two directives silently overwriting each other, and
 * subjects or icon names that don't exist and are therefore ignored without a
 * word of complaint.
 *
 * Heuristic by design — it reads ids with regexes rather than Mermaid's grammar,
 * so it stays conservative: for diagram kinds whose ids it cannot read reliably
 * it reports what it skipped instead of guessing.
 *
 *   node validate-mmd.mjs <file.mmd> [more.mmd ...]
 *   node validate-mmd.mjs --quiet <file.mmd>     # only print problems
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ICONS = JSON.parse(readFileSync(join(HERE, 'icon-names.json'), 'utf8'))
const PACKS = new Set(Object.keys(ICONS))

const ARCHETYPES = new Set(['service', 'database', 'queue', 'storage', 'user',
  'external', 'process', 'decision', 'note', 'default'])
const SEMANTICS = new Set(['flow', 'async', 'dependency', 'association',
  'inheritance', 'composition', 'bidirectional'])
const TARGETS = new Set(['theme', 'node', 'group', 'edge', 'layout', 'step'])
const SUBJECT_TARGETS = new Set(['node', 'group', 'edge', 'step'])
const THEME_FAMILIES = ['clean', 'slate', 'blueprint', 'notebook', 'vivid',
  'contrast', 'paper', 'mono', 'terminal', 'ocean']
const THEMES = new Set(THEME_FAMILIES.flatMap((f) => [`${f}-light`, `${f}-dark`]))
const DIRECTIONS = new Set(['DOWN', 'RIGHT', 'UP', 'LEFT', 'TB', 'LR', 'BT', 'RL'])

/** Mirrors the app's tokenizer: whitespace-separated, except inside quotes. */
function tokenize(body) {
  const out = []
  let cur = '', quote = null
  for (const ch of body.trim()) {
    if (quote) { if (ch === quote) quote = null; else cur += ch }
    else if (ch === '"' || ch === "'") quote = ch
    else if (/\s/.test(ch)) { if (cur) out.push(cur); cur = '' }
    else cur += ch
  }
  if (cur) out.push(cur)
  return { tokens: out, unbalanced: quote !== null }
}

/**
 * Node and subgraph ids, read from flowchart-ish source. Deliberately loose: it is
 * better to miss an id (and skip a check) than to invent one and cry wolf.
 */
function readIds(body) {
  const ids = new Set(), groups = new Set(), edges = new Set()
  const ID = '[A-Za-z_][\\w-]*'
  for (const m of body.matchAll(new RegExp(`\\b(${ID})\\s*(?:\\[\\(|\\[\\[|\\{\\{|\\[|\\(|\\{|>)`, 'g'))) ids.add(m[1])
  for (const m of body.matchAll(new RegExp(`^\\s*subgraph\\s+(${ID})`, 'gm'))) { groups.add(m[1]); ids.delete(m[1]) }
  // edges: A --> B, A -.-> B, A ==> B, A --|label|--> B, with optional shapes on either side
  const SIDE = `(${ID})(?:\\s*(?:\\[\\(.*?\\)\\]|\\{\\{.*?\\}\\}|\\[\\[.*?\\]\\]|\\[.*?\\]|\\(.*?\\)|\\{.*?\\}|>.*?\\]))?`
  const ARROW = `\\s*[-=.]{1,3}[->ox]*(?:\\|[^|]*\\|)?\\s*`
  for (const m of body.matchAll(new RegExp(`${SIDE}${ARROW}${SIDE}`, 'g'))) {
    if (!m[1] || !m[2]) continue
    ids.add(m[1]); ids.add(m[2])
    edges.add(`${m[1]}->${m[2]}`)
  }
  return { ids, groups, edges }
}

function check(file) {
  const raw = readFileSync(file, 'utf8')
  const lines = raw.split('\n')
  const errors = [], warns = [], notes = []

  // 1 · a bare `%%` line breaks Mermaid's comment stripper and kills the parse
  lines.forEach((l, i) => {
    if (l.trim() === '%%') errors.push(`${i + 1}: bare "%%" line — Mermaid's comment stripper will eat the following newlines and the file will not parse. Put text after the %%.`)
  })

  const kind = (raw.match(/^\s*(flowchart|graph|classDiagram|erDiagram|stateDiagram(?:-v2)?|mindmap|requirementDiagram|C4Context|C4Container|sequenceDiagram|gantt|pie|journey|timeline|gitGraph|quadrantChart|xychart-beta|sankey-beta)\b/m) || [])[1]
  const flowchartish = kind === 'flowchart' || kind === 'graph'

  const body = lines.filter((l) => !/^\s*%%/.test(l)).join('\n')
  const { ids, groups, edges } = flowchartish ? readIds(body) : { ids: null, groups: null, edges: null }

  const seen = new Map()
  const steps = []

  lines.forEach((line, i) => {
    const m = /^\s*%%mp:\s*(.*)$/.exec(line)
    if (!m) return
    const ln = i + 1
    const { tokens, unbalanced } = tokenize(m[1])
    if (unbalanced) errors.push(`${ln}: unbalanced quote — the rest of the line is swallowed into one value`)
    if (tokens.length === 0) { warns.push(`${ln}: empty directive`); return }

    const target = tokens[0]
    if (!TARGETS.has(target)) {
      errors.push(`${ln}: unknown directive target "${target}" (expected ${[...TARGETS].join(', ')})`)
      return
    }
    let rest = tokens.slice(1)
    let subject
    if (SUBJECT_TARGETS.has(target) && rest.length && !rest[0].includes('=')) {
      subject = rest[0]; rest = rest.slice(1)
    }

    const attrs = {}
    for (const t of rest) {
      const eq = t.indexOf('=')
      if (eq === -1) { attrs[t] = 'true'; continue }
      attrs[t.slice(0, eq)] = t.slice(eq + 1)
    }

    // 2 · a second directive for the same subject silently replaces the first
    if (subject !== undefined && target !== 'step') {
      const key = `${target} ${subject}`
      if (seen.has(key)) {
        errors.push(`${ln}: second "${key}" directive — this REPLACES the one on line ${seen.get(key)} rather than merging with it, so those attributes are silently lost. Put everything for one subject on a single line.`)
      } else seen.set(key, ln)
    }

    // 3 · subjects that do not exist are ignored without warning
    if (flowchartish && subject !== undefined) {
      if (target === 'node' && !ids.has(subject) && !groups.has(subject))
        errors.push(`${ln}: node "${subject}" is not in the diagram — this directive does nothing`)
      if (target === 'group' && !groups.has(subject))
        errors.push(`${ln}: group "${subject}" is not a subgraph in the diagram — this directive does nothing`)
      if (target === 'edge') {
        if (!/^[^\s]+->[^\s]+$/.test(subject))
          errors.push(`${ln}: edge subject "${subject}" must be exactly source->target with no spaces`)
        else if (!edges.has(subject)) {
          const [a, b] = subject.split('->')
          const hint = edges.has(`${b}->${a}`) ? ` (the graph declares it the other way round: ${b}->${a})` : ''
          errors.push(`${ln}: edge "${subject}" is not in the diagram — this directive does nothing${hint}`)
        }
      }
    }

    // 4 · values that are silently dropped when wrong
    if (attrs.icon && attrs.icon !== 'none') {
      const colon = attrs.icon.indexOf(':')
      const pack = colon === -1 ? 'general' : attrs.icon.slice(0, colon)
      const name = colon === -1 ? attrs.icon : attrs.icon.slice(colon + 1)
      if (!PACKS.has(pack)) errors.push(`${ln}: unknown icon pack "${pack}" (expected ${[...PACKS].join(', ')})`)
      else if (!ICONS[pack].includes(name)) errors.push(`${ln}: unknown icon "${attrs.icon}" — renders with no icon and reports nothing. Check references/icons.md.`)
    }
    if (attrs.archetype && !ARCHETYPES.has(attrs.archetype))
      errors.push(`${ln}: unknown archetype "${attrs.archetype}" (expected ${[...ARCHETYPES].join(', ')})`)
    if (attrs.semantics && !SEMANTICS.has(attrs.semantics))
      errors.push(`${ln}: unknown semantics "${attrs.semantics}" (expected ${[...SEMANTICS].join(', ')})`)
    if (target === 'theme') {
      const id = tokens[1]
      if (id && !THEMES.has(id)) errors.push(`${ln}: unknown theme "${id}" — expected <family>-light|dark for ${THEME_FAMILIES.join(', ')}`)
    }
    if (target === 'layout' && attrs.direction && !DIRECTIONS.has(attrs.direction))
      errors.push(`${ln}: unknown direction "${attrs.direction}" (expected ${[...DIRECTIONS].join(', ')})`)

    if (target === 'step') {
      const n = Number(subject)
      if (!Number.isFinite(n)) errors.push(`${ln}: step needs a number, got "${subject}"`)
      else steps.push({ n, ln, focus: attrs.focus, title: attrs.title })
    }
  })

  // 5 · a step whose focus names nothing real frames an empty diagram
  if (flowchartish) {
    for (const s of steps) {
      if (!s.focus) continue
      const unknown = s.focus.split(/[,\s]+/).filter(Boolean).filter((id) => !ids.has(id) && !groups.has(id))
      if (unknown.length) errors.push(`${s.ln}: step ${s.n} focuses ids not in the diagram: ${unknown.join(', ')} — the step will frame nothing`)
    }
    const nums = steps.map((s) => s.n).sort((a, b) => a - b)
    const dupes = nums.filter((n, i) => nums.indexOf(n) !== i)
    if (dupes.length) warns.push(`duplicate step numbers: ${[...new Set(dupes)].join(', ')}`)
  } else if (kind) {
    notes.push(`diagram kind "${kind}" — id checks skipped (this checker only reads flowchart ids reliably)`)
  } else {
    notes.push('no diagram kind detected on the first non-comment line')
  }

  return { file, errors, warns, notes, counts: { directives: seen.size, steps: steps.length, nodes: ids?.size ?? null, groups: groups?.size ?? null } }
}

const args = process.argv.slice(2)
const quiet = args.includes('--quiet')
const files = args.filter((a) => !a.startsWith('--'))
if (files.length === 0) {
  console.error('usage: node validate-mmd.mjs [--quiet] <file.mmd> [...]')
  process.exit(2)
}

let failed = 0
for (const f of files) {
  let r
  try { r = check(f) } catch (e) { console.error(`✗ ${f}: ${e.message}`); failed++; continue }
  const ok = r.errors.length === 0
  if (!ok) failed++
  if (!quiet || !ok) {
    const c = r.counts
    console.log(`${ok ? '✓' : '✗'} ${r.file}` +
      (c.nodes !== null ? `  (${c.nodes} nodes, ${c.groups} groups, ${c.directives} annotated subjects, ${c.steps} steps)` : `  (${c.directives} annotated subjects, ${c.steps} steps)`))
    for (const e of r.errors) console.log(`    ERROR  ${e}`)
    for (const w of r.warns) console.log(`    warn   ${w}`)
    if (!quiet) for (const n of r.notes) console.log(`    note   ${n}`)
  }
}
process.exit(failed ? 1 : 0)
