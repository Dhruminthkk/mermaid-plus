// Copies the hand-written pages in site/ into the build, so the landing page,
// the guide and the demo ship alongside the app instead of only existing on a
// developer's disk. Runs after `vite build`, as the last step of `npm run
// build`; the Pages workflow uploads dist/ and so picks these up for free.
//
// The app stays at the root and these land under /site/, which is what every
// link in them assumes. They are linked relatively, never from the root, so
// the whole thing still works under a project subpath like
// <user>.github.io/mermaid-plus/ — the same reason vite.config sets base: './'.
import { cp, access } from 'node:fs/promises'
import { constants } from 'node:fs'

// Build intermediates, not runtime files: the demo pages inline their diagrams
// as base64, so neither the scene data nor its raster fallback is ever fetched.
const INTERMEDIATE = new Set(['scenes.json', 'stale.png', '.DS_Store'])

try {
  await access('dist', constants.F_OK)
} catch {
  throw new Error('no dist/ — run `vite build` first (npm run build does both)')
}

let copied = 0
await cp('site', 'dist/site', {
  recursive: true,
  filter: (src) => {
    const name = src.split('/').pop()
    if (INTERMEDIATE.has(name)) return false
    if (!src.endsWith('/') && name.includes('.')) copied++
    return true
  },
})

console.log(`site     ${copied} files   dist/site/`)
