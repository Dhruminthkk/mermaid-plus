import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const src = readFileSync('src/app/gallery/corpus.ts', 'utf8')
const names = [...src.matchAll(/^\s{2}'?([\w-]+)'?: \{$/gm)].map((m) => m[1])
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
for (const name of names) {
  await page.goto(`http://localhost:5173/?d=${name}`)
  try { await page.waitForSelector('[data-mp-ready="true"]', { timeout: 30000 }) } catch { console.log(name, 'NOT READY'); continue }
  const bad = await page.evaluate(() => {
    const out = []
    for (const t of document.querySelectorAll('svg.mp-diagram text, svg.mp-diagram tspan')) {
      const s = t.textContent ?? ''
      if (/<br|&lt;br|&amp;|&quot;/i.test(s)) out.push(s.trim().slice(0, 60))
    }
    return [...new Set(out)]
  })
  if (bad.length) console.log(`[${name}] ${bad.join(' | ')}`)
}
console.log('corpus scan done')
await browser.close()
