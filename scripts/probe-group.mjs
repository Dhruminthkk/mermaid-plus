import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4321/')
await page.waitForSelector('.mp-diagram')
const src = `flowchart LR
  subgraph platform["Platform Services"]
    a[API Gateway] --> b[(Sessions)]
  end
  subgraph edge["Edge & Delivery Network"]
    c[CDN]
  end
  b --> c`
await page.evaluate((s) => { window.__mp?.setSource?.(s) }, src)
await page.waitForTimeout(600)
const out = await page.evaluate(() => {
  return [...document.querySelectorAll('.mp-group-label')].map((g) => {
    const chip = g.querySelector('.mp-group-chip:not(.mp-group-chip-lod)').getBBox()
    const text = g.querySelector('.mp-group-title').getBBox()
    return {
      text: g.textContent,
      rightSlack: +(chip.x + chip.width - (text.x + text.width)).toFixed(2),
      leftSlack: +(text.x - chip.x).toFixed(2),
      topSlack: +(text.y - chip.y).toFixed(2),
      bottomSlack: +(chip.y + chip.height - (text.y + text.height)).toFixed(2),
    }
  })
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
