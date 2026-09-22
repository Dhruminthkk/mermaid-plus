// Records a product demo as video, in both formats.
//   npm run demo            both
//   npm run demo -- reel    portrait only
//   npm run demo -- desktop landscape only
//
// Output is webm in docs/video/. Re-encode to mp4 for social:
//   ffmpeg -i docs/video/reel.webm -c:v libx264 -pix_fmt yuv420p docs/video/reel.mp4
import { chromium } from '@playwright/test'
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'

const BASE = process.env.MP_BASE ?? 'http://localhost:4173'
const OUT = 'docs/video'
const only = process.argv[2]

const FIRST = `flowchart LR
  shopper[Shopper] --> cdn[Cloudflare CDN]
  cdn --> gw[Kong API Gateway]
  gw --> orders[Orders API]
  orders --> pg[(PostgreSQL)]
  orders --> kafka{{Kafka}}
  kafka -.-> worker[Fulfilment Worker]
  worker --> s3[S3 Bucket]`

/** Types into the document a few characters at a time, so it reads as typing. */
async function type(page, text, { chunk = 3, delay = 26 } = {}) {
  for (let i = 0; i <= text.length; i += chunk) {
    await page.evaluate((s) => window.__mp?.setSource?.(s), text.slice(0, i))
    await page.waitForTimeout(delay)
  }
  await page.evaluate((s) => window.__mp?.setSource?.(s), text)
}

const beat = (page, ms) => page.waitForTimeout(ms)

async function open(page, query = '') {
  await page.goto(BASE + '/' + query)
  await page.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
  await beat(page, 700)
}

async function theme(page, id) {
  await page.keyboard.press('Meta+k')
  await page.locator('.mp-palette input').fill(id)
  await beat(page, 350)
  await page.keyboard.press('Enter')
  await beat(page, 900)
}

/** Landscape: the full story, editor and all. */
async function desktop(page) {
  await open(page)
  await beat(page, 1100)
  await type(page, FIRST)
  await beat(page, 1600)

  // Shapes and icons come from the labels — nothing was annotated by hand.
  await theme(page, 'slate dark')
  await theme(page, 'vivid light')
  await theme(page, 'ocean dark')
  await beat(page, 900)

  // Click a component: its neighbourhood lights, and the panel explains it.
  await page.locator('.mp-node[data-node-id="orders"]').click()
  await beat(page, 2200)
  await page.keyboard.press('Escape')

  // A real system, collapsed and opened.
  await open(page, '?ex=showcase:0&theme=slate-dark')
  await beat(page, 1500)
  await page.getByRole('button', { name: /Expand 2 collapsed/ }).click()
  await beat(page, 2400)

  // The walkthrough presents itself.
  await open(page, '?ex=showcase:1&theme=clean-light')
  await page.keyboard.press('Meta+k')
  await page.locator('.mp-palette input').fill('walkthrough')
  await page.keyboard.press('Enter')
  for (let i = 0; i < 4; i++) {
    await beat(page, 2100)
    await page.keyboard.press('ArrowRight')
  }
  await beat(page, 2200)
  await page.keyboard.press('Escape')

  // Sixty services, at full bleed.
  await open(page, '?ex=showcase:5&theme=vivid-dark')
  await page.keyboard.press('Meta+k')
  await page.locator('.mp-palette input').fill('Full-bleed')
  await page.keyboard.press('Enter')
  await beat(page, 3000)
}

/** Portrait: fewer beats, bigger moves, canvas-first. */
async function reel(page) {
  await open(page)
  await beat(page, 700)
  await type(page, FIRST, { chunk: 4, delay: 20 })
  await beat(page, 1200)

  // Hand the whole frame to the diagram.
  await page.keyboard.press('Meta+k')
  await page.locator('.mp-palette input').fill('Hide code')
  await page.keyboard.press('Enter')
  await beat(page, 1200)

  await theme(page, 'vivid dark')
  await theme(page, 'notebook light')
  await theme(page, 'ocean dark')

  await page.locator('.mp-node[data-node-id="kafka"]').click()
  await beat(page, 1800)
  await page.keyboard.press('Escape')

  await open(page, '?ex=showcase:0&theme=slate-dark')
  await page.keyboard.press('Meta+k')
  await page.locator('.mp-palette input').fill('Hide code')
  await page.keyboard.press('Enter')
  await beat(page, 1200)
  await page.getByRole('button', { name: /Expand 2 collapsed/ }).click()
  await beat(page, 2600)
}

const FORMATS = {
  desktop: { size: { width: 1920, height: 1080 }, run: desktop },
  reel: { size: { width: 1080, height: 1920 }, run: reel },
}

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
for (const [name, format] of Object.entries(FORMATS)) {
  if (only && only !== name) continue
  const dir = `${OUT}/.${name}`
  rmSync(dir, { recursive: true, force: true })
  const context = await browser.newContext({
    viewport: format.size,
    recordVideo: { dir, size: format.size },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  process.stdout.write(`recording ${name} (${format.size.width}x${format.size.height})…\n`)
  await format.run(page)
  await context.close()
  const file = readdirSync(dir).find((f) => f.endsWith('.webm'))
  if (file) {
    renameSync(`${dir}/${file}`, `${OUT}/${name}.webm`)
    rmSync(dir, { recursive: true, force: true })
    process.stdout.write(`  ${OUT}/${name}.webm\n`)
  }
}
await browser.close()
