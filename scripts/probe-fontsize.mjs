import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
await page.goto('http://localhost:5173/?d=architecture')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 30000 })
const r = await page.evaluate(() => {
  const svg = document.querySelector('svg.mp-diagram')
  const title = svg.querySelector('.mp-group-title')
  const label = svg.querySelector('.mp-node-label')
  const cs = getComputedStyle(title)
  const styleText = svg.querySelector('style').textContent
  return {
    varOnSvg: getComputedStyle(svg).getPropertyValue('--mp-font-size-label'),
    varOnTitle: cs.getPropertyValue('--mp-font-size-label'),
    svgFontSize: getComputedStyle(svg).fontSize,
    titleFontSize: cs.fontSize,
    nodeLabelFontSize: getComputedStyle(label).fontSize,
    groupTitleRules: styleText.match(/\.mp-group-title\{[^}]*\}/g),
    diagramRule: styleText.match(/\.mp-diagram\{font[^}]*\}/g),
  }
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
