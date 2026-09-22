// Finds literal markup leaking into rendered text, and invisible/clipped text.
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const kindsSrc = readFileSync('src/app/gallery/examples/index.ts', 'utf8')
const KINDS = [...kindsSrc.matchAll(/^\s{2}(\w+): \{ label: '([^']+)', tier: (\d)/gm)].map((m) => m[1])
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const out = []
for (const kind of KINDS) {
  for (let i = 0; i < 10; i++) {
    await page.goto(`http://localhost:5173/?ex=${kind}:${i}`)
    try { await page.waitForSelector('[data-mp-ready="true"]', { timeout: 20000 }) } catch { continue }
    const r = await page.evaluate(() => {
      const svg = document.querySelector('svg.mp-diagram')
      if (!svg) return null
      const bad = []
      const invisible = []
      const vb = svg.viewBox.baseVal
      for (const t of svg.querySelectorAll('text, tspan')) {
        const s = t.textContent ?? ''
        if (/<br|&lt;br|<\/?[a-z]+>|&amp;|&quot;|&#\d/i.test(s)) bad.push(s.trim().slice(0, 60))
      }
      for (const t of svg.querySelectorAll('text')) {
        const s = (t.textContent ?? '').trim()
        if (!s) continue
        const b = t.getBBox()
        // outside the viewBox entirely, or wider than the whole canvas
        if (b.x + b.width < vb.x || b.x > vb.x + vb.width || b.y + b.height < vb.y || b.y > vb.y + vb.height) {
          invisible.push(`${s.slice(0, 24)} @${Math.round(b.x)},${Math.round(b.y)}`)
        }
      }
      return { bad: [...new Set(bad)], invisible: [...new Set(invisible)] }
    })
    if (r && (r.bad.length || r.invisible.length)) {
      out.push(`[${kind}:${i}] ${r.bad.length ? 'markup in text: ' + r.bad.join(' | ') : ''}${r.invisible.length ? ' offscreen text: ' + r.invisible.join(' | ') : ''}`)
    }
  }
}
console.log(out.length ? out.join('\n') : 'clean')
await browser.close()
