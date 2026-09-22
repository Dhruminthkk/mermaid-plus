import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1300, height: 850 } })
await page.goto('http://localhost:4321/?theme=clean-light')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
await page.evaluate(() => window.__mp?.setSource?.('flowchart TB\n  a[Ingest] --> b[Queue]\n  b --> c[Worker]\n  c --> d[(Store)]'))
await page.waitForTimeout(900)

const at = () => page.evaluate(() => {
  const el = document.querySelector('.mp-node[data-node-id="d"]')
  const cs = getComputedStyle(el)
  return { attr: el.getAttribute('transform'), css: cs.transform, transition: cs.transitionProperty }
})
console.log('settled:', JSON.stringify(await at()))

// A change that moves everything.
await page.evaluate(() => window.__mp?.setSource?.('%%mp: layout direction=RIGHT\nflowchart TB\n  a[Ingest] --> b[Queue]\n  b --> c[Worker]\n  c --> d[(Store)]'))
// Sample the moment the new layout lands: the attribute is already the new
// position while the painted position is still the old one.
const caught = await page.evaluate(() => new Promise((resolve) => {
  const el = document.querySelector('.mp-node[data-node-id="d"]')
  const before = el.getAttribute('transform')
  const observer = new MutationObserver(() => {
    if (el.getAttribute('transform') === before) return
    observer.disconnect()
    requestAnimationFrame(() => resolve({
      attr: el.getAttribute('transform'),
      painted: getComputedStyle(el).transform,
      inline: el.style.transform,
    }))
  })
  observer.observe(el, { attributes: true, attributeFilter: ['transform'] })
  setTimeout(() => { observer.disconnect(); resolve('timeout') }, 5000)
}))
console.log('mid-morph:', JSON.stringify(caught))
await page.waitForTimeout(700)
console.log('after:    ', JSON.stringify(await at()))
console.log('attribute still authoritative:', await page.evaluate(() => {
  const el = document.querySelector('.mp-node[data-node-id="d"]')
  return { inlineTransform: el.style.transform === '', hasAttr: el.hasAttribute('transform') }
}))
await browser.close()
