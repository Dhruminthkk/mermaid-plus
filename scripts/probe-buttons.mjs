import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.goto('http://localhost:5173/?d=basic')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 30000 })
console.log(await page.evaluate(() => Array.from(document.querySelectorAll('.mp-toolbar button, .mp-toolbar summary, .mp-toolbar a'))
  .map((el) => `${el.tagName} title=${el.getAttribute('title')} text="${(el.textContent ?? '').trim()}"`).join('\n')))
await browser.close()
