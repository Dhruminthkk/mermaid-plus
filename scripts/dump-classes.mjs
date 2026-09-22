import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
for (const kind of ['pie', 'kanban', 'packet', 'architecture', 'block', 'xychart', 'gantt', 'quadrant']) {
  await page.goto(`http://localhost:5173/?ex=${kind}:0`)
  try { await page.waitForSelector('[data-mp-ready="true"]', { timeout: 20000 }) } catch { continue }
  const info = await page.evaluate(() => {
    const svg = document.querySelector('svg.mp-diagram')
    const classes = new Map()
    for (const el of svg.querySelectorAll('*')) {
      const c = (el.getAttribute('class') ?? '').trim()
      const key = `${el.tagName}${c ? '.' + c.split(/\s+/).join('.') : ''}`
      if (!classes.has(key)) {
        const cs = getComputedStyle(el)
        classes.set(key, `fill:${cs.fill} stroke:${cs.stroke}`)
      }
    }
    return [...classes].slice(0, 22).map(([k, v]) => `${k}  ${v}`)
  })
  console.log(`\n### ${kind}\n` + info.join('\n'))
}
await browser.close()
