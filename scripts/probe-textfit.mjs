// For every shape, how much clear space is there between the label and the
// shape's own outline, top and bottom?
import { chromium } from '@playwright/test'
const SRC = `flowchart TD
%%mp: node a1 archetype=service
%%mp: node a2 archetype=database
%%mp: node a3 archetype=queue
%%mp: node a4 archetype=storage
%%mp: node a5 archetype=user
%%mp: node a6 archetype=external
%%mp: node a7 archetype=decision
%%mp: node a8 archetype=note
  a1[Service] --- a2[Database]
  a3[Queue] --- a4[Storage]
  a5[User] --- a6[External]
  a7[Decision] --- a8[Note]
  b1([Stadium]) --- b2((Circle))
  b3[[Subroutine]] --- b4[/Lean/]
  b5[/Trap\\] --- b6[(Cyl)]`
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.goto('http://localhost:5173/?d=basic')
await page.waitForSelector('[data-mp-ready="true"]', { timeout: 30000 })
await page.evaluate((s) => window.__mp?.setSource?.(s), SRC)
await page.waitForTimeout(700)
const rows = await page.evaluate(() => {
  const out = []
  for (const n of document.querySelectorAll('.mp-node')) {
    const body = n.querySelector('.mp-node-body')
    const label = n.querySelector('.mp-node-label')
    if (!body || !label) continue
    const b = body.getBBox(), l = label.getBBox()
    out.push({
      id: n.dataset.nodeId,
      arch: n.dataset.archetype,
      shape: n.dataset.shape ?? '-',
      h: Math.round(b.height),
      top: Math.round((l.y - b.y) * 10) / 10,
      bottom: Math.round((b.y + b.height - (l.y + l.height)) * 10) / 10,
      left: Math.round((l.x - b.x) * 10) / 10,
      right: Math.round((b.x + b.width - (l.x + l.width)) * 10) / 10,
    })
  }
  return out
})
console.log('id       arch      shape            h   top  bottom  left  right')
for (const r of rows) {
  const flag = (r.top < 6 || r.bottom < 6) ? '  <-- tight' : ''
  console.log(`${(r.id??'').padEnd(8)} ${(r.arch??'').padEnd(9)} ${r.shape.padEnd(16)} ${String(r.h).padStart(3)} ${String(r.top).padStart(5)} ${String(r.bottom).padStart(7)} ${String(r.left).padStart(5)} ${String(r.right).padStart(6)}${flag}`)
}
await browser.close()
