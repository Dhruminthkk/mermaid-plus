import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.goto('http://localhost:5173/?d=' + (process.argv[2] ?? 'stress-500'))
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
const stats = await page.evaluate(() => ({ ...window.__mp, nodes: document.querySelectorAll('.mp-node').length, scale: document.querySelector('.mp-viewport')?.getAttribute('data-mp-scale'), lod: document.querySelector('.mp-viewport')?.getAttribute('data-lod'), size: [document.querySelector('.mp-diagram')?.getAttribute('width'), document.querySelector('.mp-diagram')?.getAttribute('height')] }))
console.log(JSON.stringify(stats))
await browser.close()
