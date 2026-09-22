// Renders the pictures the ad plays, from the real app.
//
// Two very different artefacts:
//   stale.png  — the diagram in the wiki. Deliberately a low-resolution raster,
//                because the film pushes into it and the point is that it goes
//                soft. It is a PNG in the story and a PNG on disk.
//   fresh SVG  — the same system, corrected, drawn properly. Vector, so it
//                holds up however far the camera goes.
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const BASE = process.env.MP_BASE ?? 'http://localhost:4173'
mkdirSync('site/demo', { recursive: true })

// The system as somebody drew it eighteen months ago. Solr went in June and the
// cron runner was deleted; the picture never heard about either.
export const STALE = `flowchart LR
%%mp: layout flow=none motion=off
  users[Customers] --> lb[Load Balancer]
  lb --> web[Web Frontend]
  web --> api[Orders API]
  api --> pg[(PostgreSQL)]
  api --> redis[(Redis Cache)]
  api --> solr[Solr Search]
  api --> cron[Cron Runner]
%%mp: node pg icon=none
%%mp: node redis icon=none
%%mp: node api icon=none
%%mp: node lb icon=none
%%mp: node users icon=none`

// Exactly STALE with the two edits the film shows being made: the cron runner
// line deleted, Solr replaced by Elasticsearch. Nothing else moves.
const FRESH = `flowchart LR
  users[Customers] --> lb[Load Balancer]
  lb --> web[Web Frontend]
  web --> api[Orders API]
  api --> pg[(PostgreSQL)]
  api --> redis[(Redis Cache)]
  api --> solr[Elasticsearch]`

const browser = await chromium.launch()
const scenes = {}

/** The wiki PNG: small, flat, monochrome, and rasterised for real. */
const stale = await browser.newContext({ viewport: { width: 1180, height: 620 }, deviceScaleFactor: 0.62 })
const sp = await stale.newPage()
await sp.emulateMedia({ reducedMotion: 'reduce' })
await sp.goto(`${BASE}/?theme=mono-light`)
await sp.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
await sp.evaluate((s) => window.__mp?.setSource?.(s), STALE)
await sp.waitForTimeout(1400)
await sp.locator('svg.mp-diagram').screenshot({ path: 'site/demo/stale.png' })
scenes['stale'] = 'data:image/png;base64,' + readFileSync('site/demo/stale.png').toString('base64')
console.log(`  stale.png     ${(readFileSync('site/demo/stale.png').length / 1024).toFixed(0)} KB raster`)

/** Everything after the turn is vector. */
const sharp = await browser.newContext({ viewport: { width: 1500, height: 860 }, deviceScaleFactor: 1 })
const p = await sharp.newPage()
const grab = async (name) => {
  await p.waitForSelector('svg.mp-diagram', { timeout: 30000 })
  await p.waitForTimeout(1100)
  scenes[name] = await p.evaluate(() => {
    const el = document.querySelector('svg.mp-diagram').cloneNode(true)
    el.removeAttribute('width'); el.removeAttribute('height')
    el.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    el.querySelector('.mp-canvas')?.remove()
    return el.outerHTML
  })
  console.log(`  ${name.padEnd(13)} ${(scenes[name].length / 1024).toFixed(0)} KB vector`)
}
const load = async (source, theme) => {
  await p.goto(`${BASE}/?theme=${theme}`)
  await p.waitForSelector('[data-mp-ready="true"]', { timeout: 60000 })
  await p.evaluate((s) => window.__mp?.setSource?.(s), source)
}
await load(FRESH, 'ocean-dark')
await grab('fresh')

writeFileSync('site/demo/scenes.json', JSON.stringify(scenes))
console.log(`\n${Object.keys(scenes).length} scenes`)
await browser.close()
