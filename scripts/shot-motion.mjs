import { chromium } from '@playwright/test'
const OUT = process.argv[2]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 760 }, deviceScaleFactor: 2 })
const SRC = `flowchart LR
  u[Customers] --> api[API Gateway]
  api --> orders[Order Service]
  orders -.-> q{{Order Events}}
  q -.-> fulfil[Fulfilment Worker]
  q -.-> notify[Notification Service]
  orders --> db[(Orders DB)]
  subgraph platform [Order Platform]
    api
    orders
    db
  end`
for (const theme of ['slate-light', 'clean-dark']) {
  await page.goto(`http://localhost:4321/?theme=${theme}`)
  await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
  await page.evaluate((s) => window.__mp?.setSource?.(s), SRC)
  await page.waitForTimeout(1200)
  await page.locator('.mp-canvas-root').screenshot({ path: `${OUT}/${theme}.png` })
  console.log(theme)
}
await browser.close()
