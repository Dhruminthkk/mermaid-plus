// Where do edge labels collide — with each other, or with a node?
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const kindsSrc = readFileSync('src/app/gallery/examples/index.ts', 'utf8')
const KINDS = [...kindsSrc.matchAll(/^\s{2}(\w+): \{ label: '([^']+)', tier: 1/gm)].map((m) => m[1])
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const findings = []
const targets = [...KINDS.flatMap((k) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `ex=${k}:${i}`)),
  ...['basic', 'labels', 'architecture', 'subgraphs', 'platform', 'class', 'er', 'state', 'c4'].map((d) => `d=${d}`)]
for (const q of targets) {
  await page.goto(`http://localhost:5173/?${q}`)
  try { await page.waitForSelector('[data-mp-ready="true"]', { timeout: 20000 }) } catch { continue }
  const r = await page.evaluate(() => {
    const abs = (el) => { const b = el.getBBox(); const m = el.getScreenCTM(); const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }
    const labels = [...document.querySelectorAll('.mp-edge-label-group text')].map((t) => ({ text: (t.textContent ?? '').slice(0, 18), ...abs(t) }))
    const nodes = [...document.querySelectorAll('.mp-node')].map((n) => ({ id: n.dataset.nodeId, ...abs(n) }))
    const hit = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 2 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 2
    const out = []
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) if (hit(labels[i], labels[j])) out.push(`label "${labels[i].text}" x "${labels[j].text}"`)
      for (const n of nodes) if (hit(labels[i], n)) out.push(`label "${labels[i].text}" over node ${n.id}`)
    }
    return [...new Set(out)]
  })
  if (r.length) findings.push(`[${q}] ${r.slice(0, 3).join(' | ')}`)
}
console.log(findings.length ? findings.join('\n') : 'no label collisions')
console.log(`\n${findings.length} of ${targets.length} diagrams have colliding labels`)
await browser.close()
