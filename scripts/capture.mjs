// Real screenshots of the running app, for the landing page and the guide.
// Motion is off throughout: a frozen travelling dash reads as a rendering
// artefact rather than the animation it is.
//
// Usage: npm run preview   (serves dist/ on :4173)
//        npm run capture
import { chromium } from '@playwright/test'

const BASE = process.env.MP_BASE ?? 'http://localhost:4173'
const browser = await chromium.launch()

// A lighter set for the landing page: one device pixel, smaller frame. The
// guide's images are for reading at full size; these are for a web page that
// has to load.
const web = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const wp = await web.newPage()
await wp.emulateMedia({ reducedMotion: 'reduce' })
const webShot = async (name, query, after) => {
  await wp.goto(BASE + '/' + query)
  await wp.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
  await wp.waitForTimeout(1100)
  if (after) await after(wp)
  await wp.screenshot({ path: `site/images/${name}.png` })
  process.stdout.write(`  site/${name}\n`)
}
await webShot('hero', '?ex=showcase:3&theme=slate-dark')
await webShot('infer', '?ex=showcase:3&theme=ocean-dark')
await webShot('collapse', '?ex=showcase:0&theme=slate-dark')
await webShot('explain', '?ex=showcase:2&theme=slate-dark', async (p) => {
  await p.locator('.mp-node[data-node-id="orders"]').click()
  await p.waitForTimeout(600)
})
await webShot('present', '?ex=showcase:5&theme=vivid-dark', async (p) => {
  await p.keyboard.press('Meta+k')
  await p.locator('.mp-palette input').fill('Full-bleed')
  await p.keyboard.press('Enter')
  await p.waitForTimeout(800)
})
await webShot('themes', '?ex=flowchart:0&theme=ocean-dark', async (p) => {
  await p.getByRole('button', { name: 'Themes', exact: true }).click()
  await p.waitForTimeout(700)
})


// The guide's own set: one device pixel, sized for reading inside a text column.
const guide = await browser.newContext({ viewport: { width: 1280, height: 780 }, deviceScaleFactor: 1 })
const gp = await guide.newPage()
await gp.emulateMedia({ reducedMotion: 'reduce' })
const guideShot = async (name, query, after) => {
  await gp.goto(BASE + '/' + query)
  await gp.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
  await gp.waitForTimeout(1100)
  if (after) await after(gp)
  await gp.screenshot({ path: `site/guide/images/${name}.png` })
  process.stdout.write(`  guide/${name}\n`)
}
const palette = async (p, query) => {
  await p.keyboard.press('Meta+k')
  await p.locator('.mp-palette input').fill(query)
  await p.keyboard.press('Enter')
  await p.waitForTimeout(900)
}

await guideShot('blank', '')
await guideShot('first-diagram', '?theme=slate-dark', async (p) => {
  await p.evaluate(() => window.__mp?.setSource?.(
    'flowchart LR\n  a[Client] --> b[API]\n  b --> c[(Database)]'))
  await p.waitForTimeout(900)
})
await guideShot('archetypes', '?ex=showcase:3&theme=slate-dark')
await guideShot('legend', '?ex=showcase:6&theme=slate-dark', async (p) => {
  await p.getByRole('button', { name: 'Legend' }).click()
  await p.waitForTimeout(600)
})
await guideShot('collapsed', '?ex=showcase:0&theme=slate-dark')
await guideShot('expanded', '?ex=showcase:0&theme=slate-dark', async (p) => {
  await p.getByRole('button', { name: /Expand 2 collapsed/ }).click()
  await p.waitForTimeout(1000)
})
await guideShot('focus', '?ex=showcase:5&theme=slate-dark', async (p) => {
  await p.locator('.mp-node[data-node-id="payments"]').click()
  await p.waitForTimeout(400)
  await p.getByRole('button', { name: /^Focus/ }).click()
  await p.waitForTimeout(900)
})
await guideShot('find', '?ex=showcase:5&theme=slate-dark', async (p) => {
  await p.getByLabel('Find node').fill('store')
  await p.waitForTimeout(700)
})
await guideShot('selection', '?ex=showcase:2&theme=slate-dark', async (p) => {
  await p.locator('.mp-node[data-node-id="orders"]').click()
  await p.waitForTimeout(700)
})
await guideShot('walkthrough', '?ex=showcase:1&theme=slate-dark', async (p) => {
  await palette(p, 'walkthrough')
  await p.keyboard.press('ArrowRight')
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(900)
})
await guideShot('fullbleed', '?ex=showcase:5&theme=vivid-dark', async (p) => palette(p, 'Full-bleed'))
await guideShot('themes', '?ex=flowchart:0&theme=ocean-dark', async (p) => {
  await p.getByRole('button', { name: 'Themes', exact: true }).click()
  await p.waitForTimeout(700)
})
await guideShot('customise', '?ex=flowchart:0&theme=ocean-dark', async (p) => {
  await p.getByRole('button', { name: 'Themes', exact: true }).click()
  await p.getByRole('tab', { name: 'Customise' }).click()
  await p.waitForTimeout(700)
})
await guideShot('export', '?ex=class:0&theme=slate-dark', async (p) => {
  await p.locator('.mp-menu > summary[title="Export"]').click()
  await p.waitForTimeout(500)
})
await guideShot('gallery-examples', '?ex=class:0&theme=slate-dark', async (p) => {
  await p.locator('.mp-toolbar').getByRole('button', { name: 'Examples', exact: true }).click()
  await p.waitForTimeout(1200)
})

console.log('\nwrote site/images/ and site/guide/images/')
await browser.close()
