import { expect, test } from '@playwright/test'

const THEMES = [
  'clean-light', 'clean-dark', 'slate-light', 'slate-dark', 'blueprint-light', 'blueprint-dark',
  'notebook-light', 'notebook-dark', 'vivid-light', 'vivid-dark', 'ocean-light', 'ocean-dark',
  'paper-light', 'paper-dark', 'mono-light', 'mono-dark', 'terminal-light', 'terminal-dark',
  'contrast-light', 'contrast-dark',
] as const

for (const theme of THEMES) {
  test(`architecture showcase in ${theme}`, async ({ page }) => {
    await page.goto(`/?d=architecture&theme=${theme}`)
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.mp-canvas-root')).toHaveScreenshot(`architecture-${theme}.png`, { mask: [page.locator('.mp-viewport-controls')] })
  })
}

test('a %%mp: theme directive overrides the UI selection', async ({ page }) => {
  await page.goto('/?d=basic&theme=clean-light')
  await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
  await page.evaluate(() => window.__mp?.setSource?.('%%mp: theme slate-dark\nflowchart TD\n  a --> b'))
  await expect(page.locator('.mp-diagram[data-theme="slate-dark"]')).toBeVisible()
})
