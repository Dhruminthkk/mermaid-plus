import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, acceptDownloads: true })
const page = await ctx.newPage()
await page.goto('http://localhost:4321/?theme=clean-light')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
await page.evaluate(() => window.__mp?.setSource?.('flowchart LR\n  a[Producer] -.-> b[Consumer]\n  b --> c[(Store)]'))
await page.waitForTimeout(900)
const [dl] = await Promise.all([
  page.waitForEvent('download'),
  page.keyboard.press('Meta+k').then(async () => {
    await page.locator('.mp-palette input').fill('Export standalone HTML')
    await page.keyboard.press('Enter')
  }),
])
const path = '/tmp/mp-export-check.html'
await dl.saveAs(path)
const html = readFileSync(path, 'utf8')
console.log('has motion sheet:', /@keyframes mp-flow/.test(html))
console.log('has data-motion:', /data-motion="on"/.test(html))

const viewer = await ctx.newPage()
await viewer.goto('file://' + path)
await viewer.waitForTimeout(600)
console.log('in the saved page:', await viewer.evaluate(() => {
  const flowing = document.querySelector('.mp-edge[data-flow="true"] .mp-edge-flow')
  const still = document.querySelector('.mp-edge:not([data-flow]) .mp-edge-flow')
  const cs = (el) => el ? { anim: getComputedStyle(el).animationName, op: getComputedStyle(el).opacity } : null
  return { flowing: cs(flowing), still: cs(still), shadows: (document.querySelector('.mp-node-body') && getComputedStyle(document.querySelector('.mp-node-body')).filter.slice(0, 40)) ?? 'no node body' }
}))
await viewer.emulateMedia({ reducedMotion: 'reduce' })
await viewer.waitForTimeout(300)
console.log('reduced motion:', await viewer.evaluate(() => {
  const el = document.querySelector('.mp-edge[data-flow="true"] .mp-edge-flow')
  return { anim: getComputedStyle(el).animationName, op: getComputedStyle(el).opacity }
}))
await browser.close()
