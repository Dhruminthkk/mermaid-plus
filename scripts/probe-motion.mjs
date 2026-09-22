import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.goto('http://localhost:4321/?d=platform&theme=slate-light')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
await page.waitForTimeout(900)

console.log('--- resting state ---')
console.log(await page.evaluate(() => {
  const svg = document.querySelector('.mp-diagram')
  const body = document.querySelector('.mp-node-body')
  const flows = document.querySelectorAll('.mp-edge[data-flow="true"]')
  const overlay = document.querySelector('.mp-edge-flow')
  return {
    motion: svg?.getAttribute('data-motion'),
    shadow: body ? getComputedStyle(body).filter : null,
    overlays: document.querySelectorAll('.mp-edge-flow').length,
    flowEdges: flows.length,
    overlayAnimation: overlay ? getComputedStyle(overlay).animationName : null,
    overlayOpacity: overlay ? getComputedStyle(overlay).opacity : null,
  }
}))

console.log('--- with an async edge + emphasis ---')
await page.evaluate(() => window.__mp?.setSource?.(`flowchart LR
  a[Producer] -.-> q{{Events}}
  q -.-> b[Worker]
  b --> db[(Store)]`))
await page.waitForTimeout(900)
console.log(await page.evaluate(() => {
  const rows = [...document.querySelectorAll('.mp-edge')].map((e) => ({
    id: e.getAttribute('data-edge-id'),
    semantics: e.getAttribute('data-semantics'),
    flow: e.getAttribute('data-flow'),
    anim: getComputedStyle(e.querySelector('.mp-edge-flow')).animationName,
    op: getComputedStyle(e.querySelector('.mp-edge-flow')).opacity,
  }))
  return rows
}))

console.log('--- reduced motion ---')
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.waitForTimeout(300)
console.log(await page.evaluate(() => {
  const el = document.querySelector('.mp-edge-flow')
  const node = document.querySelector('.mp-node')
  return { flowOpacity: getComputedStyle(el).opacity, nodeAnim: getComputedStyle(node).animationName }
}))
await browser.close()
