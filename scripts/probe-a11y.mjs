import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.goto('http://localhost:4321/?d=platform')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
await page.waitForTimeout(600)

// Can a keyboard reach the diagram at all?
const focusable = await page.evaluate(() => ({
  nodesWithTabindex: document.querySelectorAll('.mp-node[tabindex]').length,
  nodes: document.querySelectorAll('.mp-node').length,
  canvasTabindex: document.querySelector('.mp-canvas-root')?.getAttribute('tabindex') ?? null,
  liveRegions: document.querySelectorAll('[aria-live]').length,
}))
console.log('keyboard/a11y:', JSON.stringify(focusable))

// Does the shell survive a narrow window?
for (const width of [1440, 1024, 820, 600, 390]) {
  await page.setViewportSize({ width, height: 800 })
  await page.waitForTimeout(400)
  console.log(width, JSON.stringify(await page.evaluate(() => {
    const doc = document.documentElement
    const header = document.querySelector('header')
    return {
      hOverflow: doc.scrollWidth - doc.clientWidth,
      headerOverflow: header ? header.scrollWidth - header.clientWidth : null,
      canvasW: Math.round(document.querySelector('.mp-canvas-root')?.getBoundingClientRect().width ?? 0),
    }
  })))
}
await browser.close()
