import { expect, test } from '@playwright/test'

const ENTRIES = ['basic', 'shapes', 'subgraphs', 'labels', 'architecture', 'sequence', 'pie', 'gantt', 'state', 'class', 'er', 'mindmap', 'requirement', 'c4'] as const
const THEMES = ['clean-light', 'clean-dark'] as const
// Tier-2 entries are drawn by mermaid.js itself; the screenshot only guards our
// theming, and mermaid's text anti-aliasing drifts more than ours, so the pixel
// budget is looser there. Our own renderer keeps the strict default.
const TIER2 = new Set<string>(['sequence', 'pie', 'gantt'])


for (const entry of ENTRIES) {
  for (const theme of THEMES) {
    test(`${entry} renders identically in ${theme}`, async ({ page }) => {
      // This suite guards how diagrams are *drawn*. Freezing an animation
      // mid-flight captures a frame, not a rendering, and the travelling
      // highlight parked on every edge drifted these comparisons around the
      // pixel budget. Reduced motion removes it at the source.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`/?d=${entry}&theme=${theme}`)
      await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
      await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 20_000 })
      // The viewport fits the whole diagram into the pane, so the pane is the picture.
      await expect(page.locator('.mp-canvas-root')).toHaveScreenshot(`${entry}-${theme}.png`, { mask: [page.locator('.mp-viewport-controls')], ...(TIER2.has(entry) ? { maxDiffPixels: 2500 } : {}) })
    })
  }
}

test('a syntax error keeps the previous diagram on screen', async ({ page }) => {
  await page.goto('/?d=basic')
  await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
  await page.evaluate(() => window.__mp?.setSource?.('flowchart TD\n  a -->'))
  await expect(page.locator('.mp-error-strip')).toBeVisible()
  await expect(page.locator('.mp-diagram')).toBeVisible()
  await expect(page.locator('[data-stale="true"]')).toBeVisible()
})
