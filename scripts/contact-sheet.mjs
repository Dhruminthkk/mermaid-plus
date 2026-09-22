// Screenshots one example per kind into a directory for visual review.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
const [outDir, theme = 'clean-light', index = '0'] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })
const KINDS = ['flowchart','class','state','er','mindmap','requirement','c4','sequence','gantt','pie','timeline','journey','gitgraph','quadrant','xychart','sankey','block','kanban','packet','architecture']
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1.5 })
for (const kind of KINDS) {
  await page.goto(`http://localhost:5173/?ex=${kind}:${index}&theme=${theme}`)
  try { await page.waitForSelector('[data-mp-ready="true"]', { timeout: 20000 }) } catch { console.log(kind, 'NOT READY'); continue }
  await page.waitForTimeout(150)
  await page.locator('.mp-canvas-root').screenshot({ path: `${outDir}/${kind}.png` })
}
console.log('done', outDir)
await browser.close()
