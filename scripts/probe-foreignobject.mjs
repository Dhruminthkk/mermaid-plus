// Does our PNG/PDF export survive mermaid's <foreignObject> HTML labels?
import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
for (const q of ['ex=kanban:0', 'ex=block:0', 'ex=flowchart:0', 'ex=sequence:0', 'd=architecture']) {
  await page.goto(`http://localhost:5173/?${q}`)
  await page.waitForSelector('[data-mp-ready="true"]', { timeout: 20000 })
  const r = await page.evaluate(() => {
    const svg = document.querySelector('svg.mp-diagram')
    return { fo: svg.querySelectorAll('foreignObject').length, tier: svg.classList.contains('mp-tier2') ? 2 : 1 }
  })
  console.log(`${q.padEnd(18)} tier ${r.tier}  foreignObject: ${r.fo}`)
}
await browser.close()
