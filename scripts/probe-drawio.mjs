import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1300, height: 850 }, acceptDownloads: true })
const page = await ctx.newPage()
// A diagram with every shape that used to break the file: <br>, compartments,
// quoted labels, groups and nested groups.
const SRC = `flowchart LR
  subgraph plat ["Platform <Core>"]
    api["API<br/>Gateway"] --> svc["Order Service"]
    svc --> db[(Orders DB)]
  end
  u["Customer's App"] -->|"sends <order>"| api
  svc -.-> q{{Events}}`
const results = []
for (const src of [SRC, 'classDiagram\n  class Order {\n    +String id\n    +place() bool\n  }\n  Order --> Item']) {
  await page.goto('http://localhost:4321/?theme=clean-light')
  await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
  await page.evaluate((s) => window.__mp?.setSource?.(s), src)
  await page.waitForTimeout(1200)
  const [dl] = await Promise.all([
    page.waitForEvent('download'),
    page.keyboard.press('Meta+k').then(async () => {
      await page.locator('.mp-palette input').fill('Export to draw.io')
      await page.keyboard.press('Enter')
    }),
  ])
  const file = '/tmp/mp-drawio-check.drawio'
  await dl.saveAs(file)
  const xml = readFileSync(file, 'utf8')
  const parsed = await page.evaluate((x) => {
    const doc = new DOMParser().parseFromString(x, 'application/xml')
    const err = doc.querySelector('parsererror')
    return {
      ok: !err,
      error: err?.textContent?.slice(0, 200) ?? null,
      cells: doc.querySelectorAll('mxCell').length,
      values: [...doc.querySelectorAll('mxCell[value]')].map((c) => c.getAttribute('value')).filter(Boolean).slice(0, 6),
    }
  }, xml)
  results.push(parsed)
}
console.log(JSON.stringify(results, null, 2))
await browser.close()
