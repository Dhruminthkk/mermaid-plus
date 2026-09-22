import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
await page.goto('http://localhost:5173/?d=architecture')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 30000 })
const out = await page.evaluate(async () => {
  const mod = await import('/src/app/export.ts')
  const live = document.querySelector('svg.mp-diagram')
  const liveTitle = live.querySelector('.mp-group-title')
  const liveCs = getComputedStyle(liveTitle)
  const clone = mod.inlineComputedStyles(live)
  const cloneTitle = clone.querySelector('.mp-group-title')
  const cloneChip = clone.querySelector('.mp-group-chip')
  return {
    liveFontSize: liveCs.fontSize,
    liveTransform: liveCs.textTransform,
    liveOuter: liveTitle.outerHTML.slice(0, 260),
    cloneOuter: cloneTitle.outerHTML.slice(0, 400),
    chipOuter: cloneChip ? cloneChip.outerHTML.slice(0, 300) : 'none',
  }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()
