import { expect, test } from '@playwright/test'

test.describe('command palette', () => {
  test('opens with the keyboard, filters, and loads what you choose', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-palette')).toHaveCount(0)

    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.locator('.mp-palette')
    await expect(palette).toBeVisible()
    await expect(palette.locator('input')).toBeFocused()

    // Subsequence matching, not just prefix.
    await palette.locator('input').fill('authorization code')
    await expect(palette.locator('.mp-palette-row').first()).toContainText('OAuth 2.0 authorization code')

    await page.keyboard.press('Enter')
    await expect(palette).toHaveCount(0)
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-statusbar')).toContainText('sequence')
  })

  test('arrow keys move the selection and Escape dismisses', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.locator('.mp-omni').click()
    // Opening by click leaves the pointer sitting over the list, and a row
    // takes the selection on pointer-enter. Park the cursor away from it so
    // hover cannot fight the keyboard navigation this test is about.
    await page.mouse.move(0, 0)
    const rows = page.locator('.mp-palette-row')
    await expect(rows.first()).toHaveAttribute('data-active', 'true')
    await page.keyboard.press('ArrowDown')
    await expect(rows.nth(1)).toHaveAttribute('data-active', 'true')
    await page.keyboard.press('Escape')
    await expect(page.locator('.mp-palette')).toHaveCount(0)
  })

  test('switches theme from the palette', async ({ page }) => {
    await page.goto('/?d=basic&theme=clean-light')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.keyboard.press('ControlOrMeta+k')
    await page.locator('.mp-palette input').fill('slate dark')
    await page.keyboard.press('Enter')
    await expect(page.locator('.mp-diagram[data-theme="slate-dark"]')).toBeVisible()
    await expect(page.locator('.mp-app[data-theme-mode="dark"]')).toBeVisible()
  })
})

test.describe('shell', () => {
  test('the split is draggable and the ratio survives a reload', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    const handle = page.locator('.mp-split-handle')
    const before = (await handle.boundingBox())!

    // A 1px handle is below Playwright's hover actionability threshold, so drive
    // the pointer directly.
    await page.mouse.move(before.x + before.width / 2, before.y + 60)
    await page.mouse.down()
    await page.mouse.move(before.x + 220, before.y + 60, { steps: 8 })
    await page.mouse.up()

    const after = (await handle.boundingBox())!
    expect(after.x).toBeGreaterThan(before.x + 120)

    await page.reload()
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    const restored = (await page.locator('.mp-split-handle').boundingBox())!
    expect(Math.abs(restored.x - after.x)).toBeLessThan(4)
  })

  test('the status bar reads out the diagram', async ({ page }) => {
    await page.goto('/?d=platform')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    const status = page.locator('.mp-statusbar')
    await expect(status.locator('.mp-status-kind')).toHaveText('flowchart')
    await expect(status).toContainText('nodes')
    await expect(status).toContainText('edges')
    await expect(status).toContainText('collapsed')
    await expect(status.locator('.mp-status-time')).toContainText('ms')
  })

  test('hiding the code pane removes the editor and the handle', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('.mp-editor-pane')).toBeVisible()
    // The toggle sits on the left, beside the pane it controls.
    const toggle = (await page.locator('.mp-code-toggle').boundingBox())!
    const bar = (await page.locator('.mp-toolbar').boundingBox())!
    expect(toggle.x).toBeLessThan(bar.x + bar.width / 3)
    await page.getByRole('button', { name: 'Hide code' }).click()
    await expect(page.locator('.mp-editor-pane')).toHaveCount(0)
    await expect(page.locator('.mp-split-handle')).toHaveCount(0)
    await page.getByRole('button', { name: 'Show code' }).click()
    await expect(page.locator('.mp-editor-pane')).toBeVisible()
  })

  test('ships its own fonts rather than fetching them', async ({ page }) => {
    const external: string[] = []
    page.on('request', (r) => { if (!r.url().startsWith('http://localhost:5173') && !r.url().startsWith('data:')) external.push(r.url()) })
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 20_000 })
    expect(external).toEqual([])
    const font = await page.evaluate(() => getComputedStyle(document.querySelector('.mp-brand-name')!).fontFamily)
    expect(font).toContain('IBM Plex Sans')
  })
})

test.describe('examples', () => {
  test('open in the app rather than navigating away', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    const url = page.url()

    await page.locator('.mp-toolbar').getByRole('button', { name: 'Examples', exact: true }).click()
    const sheet = page.locator('.mp-sheet')
    await expect(sheet).toBeVisible()
    expect(await sheet.locator('.mp-example-card').count()).toBeGreaterThan(50)

    // Filtering by kind narrows to that kind only.
    await sheet.locator('.mp-sheet-kinds').getByRole('button', { name: 'Sequence diagram', exact: true }).click()
    await expect(sheet.locator('.mp-example-card')).toHaveCount(10)

    await sheet.locator('.mp-example-card', { hasText: 'OAuth 2.0 authorization code with PKCE' }).click()
    await expect(sheet).toHaveCount(0)
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-statusbar')).toContainText('sequence')
    expect(page.url()).toBe(url)
  })

  test('the palette leads with actions, and finds examples once you type', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.locator('.mp-palette')

    // Idle: a short menu of what you can do, not the whole example library.
    await expect(palette.locator('.mp-palette-group').first()).toHaveText('Action')
    // Actions only: examples and themes have pickers of their own.
    expect(await palette.locator('.mp-palette-row').count()).toBeLessThan(20)
    await expect(palette.locator('.mp-palette-row').first()).toContainText('Browse examples')
    await expect(palette.locator('.mp-palette-group', { hasText: /^Theme$/ })).toHaveCount(0)

    await palette.locator('input').fill('terminal dark')
    await expect(palette.locator('.mp-palette-row').first()).toContainText('Terminal')

    await palette.locator('input').fill('authorization code')
    await expect(palette.locator('.mp-palette-row').first()).toContainText('OAuth 2.0 authorization code')
  })

  test('the gallery page wears the same chrome as the editor', async ({ page }) => {
    await page.goto('/?gallery&theme=slate-dark')
    await expect(page.locator('.mp-toolbar .mp-brand-name')).toContainText('Mermaid')
    await expect(page.locator('.mp-app[data-theme-mode="dark"]')).toBeVisible()
    await page.getByRole('link', { name: 'Open editor' }).click()
    await expect(page).toHaveURL(/theme=slate-dark/)
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
  })
})

test.describe('edge labels', () => {
  test('sit on the line by default and move beside it on request', async ({ page }) => {
    await page.goto('/?d=labels')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-diagram[data-edge-labels="on-line"]')).toBeVisible()

    const gap = async () => page.evaluate(() => {
      const group = document.querySelector('.mp-edge-label-group')!
      const label = group.querySelector('text')!.getBBox()
      const path = (group.closest('.mp-edge')!.querySelector('.mp-edge-path') as SVGPathElement)
      const mid = path.getPointAtLength(path.getTotalLength() / 2)
      return Math.abs(mid.y - (label.y + label.height / 2))
    })
    const onLine = await gap()
    expect(onLine).toBeLessThan(8)

    await page.evaluate(() => window.__mp?.setSource?.(
      '%%mp: layout edgeLabels=beside\nflowchart LR\n  a[Producer] -->|publish| b[Consumer]\n  b -->|ack| a',
    ))
    await expect(page.locator('.mp-diagram[data-edge-labels="beside"]')).toBeVisible()
    expect(await gap()).toBeGreaterThan(onLine)
  })
})

test.describe('theme panel', () => {
  test('leads with what the themes look like, and switching one applies it', async ({ page }) => {
    await page.goto('/?d=basic&theme=clean-light')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Themes', exact: true }).click()

    const panel = page.locator('.mp-theme-panel')
    await expect(panel).toBeVisible()
    // Every theme is offered as a preview, not a line of text.
    await expect(panel.locator('.mp-theme-card')).toHaveCount(20)
    await expect(panel.locator('.mp-theme-card .mp-swatch')).toHaveCount(20)
    await expect(panel.locator('.mp-theme-card.mp-on')).toContainText('Clean')

    await panel.locator('.mp-theme-card', { hasText: 'Terminal' }).first().click()
    await expect(page.locator('.mp-diagram[data-theme="terminal-light"]')).toBeVisible()
    await expect(panel.locator('.mp-theme-card.mp-on')).toContainText('Terminal')
  })

  test('customising is a second tab, and edits reach the canvas', async ({ page }) => {
    await page.goto('/?d=basic&theme=clean-light')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Themes', exact: true }).click()

    await page.getByRole('tab', { name: 'Customise' }).click()
    const form = page.locator('.mp-theme-form')
    await expect(form).toBeVisible()
    await expect(form.getByRole('radiogroup', { name: 'Routing' })).toBeVisible()

    await form.locator('.mp-chip-field input[type="color"]').first().fill('#123456')
    await expect(page.locator('.mp-diagram[data-theme="custom"]')).toBeVisible()
    await expect(page.locator('.mp-canvas-root')).toHaveCSS('background-color', 'rgb(18, 52, 86)')

    // Edge label placement is a control, not only a directive.
    await form.getByRole('radio', { name: 'beside' }).click()
    await expect(page.locator('.mp-diagram[data-edge-labels="beside"]')).toBeVisible()
  })

  test('the canvas sits behind the nodes rather than level with them', async ({ page }) => {
    await page.goto('/?d=basic&theme=clean-light')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    const [canvas, node] = await Promise.all([
      page.locator('.mp-canvas-root').evaluate((el) => getComputedStyle(el).backgroundColor),
      page.locator('.mp-node .mp-node-body').first().evaluate((el) => getComputedStyle(el).fill),
    ])
    expect(canvas).not.toBe(node)
    expect(canvas).not.toBe('rgb(255, 255, 255)')
  })
})
