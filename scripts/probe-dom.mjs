import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/?d=' + (process.argv[2] ?? 'basic'))
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 15000 })
const info = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('.mp-node')]
  const edges = [...document.querySelectorAll('.mp-edge-path')]
  return {
    nodes: nodes.slice(0, 4).map((n) => ({ id: n.dataset.nodeId, arch: n.dataset.archetype, shape: n.dataset.shape, section: n.dataset.section, style: n.getAttribute('style'), body: n.querySelector('.mp-node-body')?.tagName + ' ' + (n.querySelector('.mp-node-body')?.getAttribute('d') ?? '').slice(0, 30) })),
    edges: edges.slice(0, 2).map((e) => e.getAttribute('d')?.slice(0, 60)),
  }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
