// Renders every example and reports measurable rendering defects.
// Usage: node scripts/audit-examples.mjs [kind]
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'

const only = process.argv[2]
const kindsSrc = readFileSync('src/app/gallery/examples/index.ts', 'utf8')
const KINDS = [...kindsSrc.matchAll(/^\s{2}(\w+): \{ label: '([^']+)', tier: (\d)/gm)].map((m) => ({ kind: m[1], label: m[2], tier: Number(m[3]) }))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const findings = []
let audited = 0

const audit = async () => page.evaluate(() => {
  const svg = document.querySelector('svg.mp-diagram')
  if (!svg) return { error: 'no svg' }
  const vb = svg.viewBox.baseVal
  const box = svg.getBBox()
  const eps = 0.6
  const out = {
    viewBox: [Math.round(vb.width), Math.round(vb.height)],
    bbox: [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)],
    overflow: {
      left: Math.max(0, Math.round((vb.x - box.x) * 10) / 10),
      top: Math.max(0, Math.round((vb.y - box.y) * 10) / 10),
      right: Math.max(0, Math.round((box.x + box.width - (vb.x + vb.width)) * 10) / 10),
      bottom: Math.max(0, Math.round((box.y + box.height - (vb.y + vb.height)) * 10) / 10),
    },
    labelOverflow: [],
    overlaps: [],
    tinyNodes: [],
    nan: [],
  }
  const nodes = [...document.querySelectorAll('.mp-node')]
  const boxes = []
  for (const n of nodes) {
    const body = n.querySelector('.mp-node-body, .mp-node-body-sketch')
    if (!body) continue
    const b = body.getBBox()
    const m = n.transform.baseVal.consolidate()?.matrix
    const abs = { id: n.dataset.nodeId, x: (m?.e ?? 0) + b.x, y: (m?.f ?? 0) + b.y, w: b.width, h: b.height }
    boxes.push(abs)
    if (b.width < 4 || b.height < 4) out.tinyNodes.push(abs.id)
    const label = n.querySelector('.mp-node-label')
    if (label) {
      const l = label.getBBox()
      if (l.width > b.width + 1 || l.height > b.height + 1) {
        out.labelOverflow.push({ id: abs.id, label: Math.round(l.width), node: Math.round(b.width) })
      }
    }
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], c = boxes[j]
      const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x)
      const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y)
      if (ox > eps && oy > eps) out.overlaps.push(`${a.id}~${c.id}(${Math.round(ox)}x${Math.round(oy)})`)
    }
  }
  for (const el of document.querySelectorAll('svg.mp-diagram *')) {
    for (const attr of ['d', 'x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'transform']) {
      const v = el.getAttribute(attr)
      if (v && /NaN|Infinity|undefined/.test(v)) out.nan.push(`${el.tagName}[${attr}]`)
    }
  }
  return out
})

for (const { kind, tier } of KINDS) {
  if (only && kind !== only) continue
  for (let i = 0; i < 10; i++) {
    const errors = []
    page.removeAllListeners('pageerror')
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))
    await page.goto(`http://localhost:5173/?ex=${kind}:${i}`)
    try {
      await page.waitForSelector('[data-mp-ready="true"]', { timeout: 20000 })
    } catch {
      findings.push({ kind, i, tier, fatal: 'never became ready' })
      continue
    }
    const strip = await page.locator('.mp-error-strip').count()
    const r = await audit()
    const issues = []
    if (strip) issues.push('error strip visible')
    if (r.error) issues.push(r.error)
    else {
      const o = r.overflow
      if (o.left || o.top || o.right || o.bottom) issues.push(`clipped L${o.left} T${o.top} R${o.right} B${o.bottom} (viewBox ${r.viewBox})`)
      if (r.labelOverflow.length) issues.push(`label overflow: ${r.labelOverflow.map((l) => `${l.id} ${l.label}>${l.node}`).join(', ')}`)
      if (r.overlaps.length) issues.push(`overlap: ${r.overlaps.slice(0, 4).join(', ')}`)
      if (r.tinyNodes.length) issues.push(`tiny nodes: ${r.tinyNodes.join(',')}`)
      if (r.nan.length) issues.push(`NaN in: ${[...new Set(r.nan)].join(',')}`)
    }
    if (errors.length) issues.push(`js error: ${errors[0]}`)
    audited++
    if (issues.length) findings.push({ kind, i, tier, issues })
  }
}

await browser.close()
writeFileSync('/tmp/audit.json', JSON.stringify(findings, null, 1))
const byKind = {}
for (const f of findings) (byKind[f.kind] ??= []).push(f)
console.log(`\n=== ${findings.length} of ${audited} example(s) have findings ===\n`)
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`## ${kind} (${list.length}/10)`)
  for (const f of list) console.log(`  [${f.i}] ${f.fatal ?? f.issues.join(' | ')}`)
}
