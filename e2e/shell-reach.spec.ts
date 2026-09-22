import { expect, test } from '@playwright/test'

test.describe('reaching the diagram', () => {
  test('arrow keys walk the graph and the panel narrates each step', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate(() => window.__mp?.setSource?.(
      'flowchart LR\n  ingest[Ingest] --> queue[Queue]\n  queue --> worker[Worker]\n  queue --> audit[Audit log]'))
    await expect(page.locator('.mp-node')).toHaveCount(4)
    await expect(page.locator('.mp-node[data-node-id="audit"]')).toBeVisible()

    const canvas = page.locator('.mp-canvas-root')
    await canvas.focus()
    await expect(canvas).toBeFocused()

    // Nothing selected yet: the first arrow starts where the diagram starts.
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.mp-node[data-node-id="ingest"][data-selected="true"]')).toBeVisible()
    await expect(page.locator('.mp-panel')).toContainText('Ingest')

    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.mp-node[data-node-id="queue"][data-selected="true"]')).toBeVisible()
    await expect(page.locator('.mp-panel')).toContainText('Queue')

    // The fan-out is resolved by bearing, not declaration order.
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.mp-node[data-selected="true"]')).toHaveCount(1)

    // And back the way it came.
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('.mp-node[data-node-id="queue"][data-selected="true"]')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.mp-panel')).toHaveCount(0)
  })

  test('a first visit is a blank page, not somebody else\u2019s diagram', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()

    expect(await page.evaluate(() => window.__mp?.source ?? 'missing')).toBe('')
    await expect(page.locator('.mp-node')).toHaveCount(0)
    // Blank is not broken: no error strip, and the status bar says so.
    await expect(page.locator('.mp-error-strip')).toHaveCount(0)
    await expect(page.locator('.mp-blank h2')).toHaveText('Start typing')

    // The examples are one click away, not the first thing you have to delete.
    await page.getByRole('button', { name: 'Browse examples' }).click()
    await expect(page.locator('.mp-sheet')).toBeVisible()
    await page.keyboard.press('Escape')

    await page.evaluate(() => window.__mp?.setSource?.('flowchart LR\n  a --> b'))
    await expect(page.locator('.mp-node')).toHaveCount(2)
    await expect(page.locator('.mp-blank')).toHaveCount(0)
  })

  test('there is a way back to a blank page from an example', async ({ page }) => {
    await page.goto('/?ex=showcase:0')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-node')).not.toHaveCount(0)

    page.on('dialog', (dialog) => void dialog.accept())
    await page.locator('.mp-menu > summary[title="Library"]').click()
    await page.getByRole('button', { name: 'New diagram' }).click()

    await expect(page.locator('.mp-node')).toHaveCount(0)
    await expect(page.locator('.mp-blank h2')).toHaveText('Start typing')
    expect(await page.evaluate(() => window.__mp?.source ?? 'missing')).toBe('')
  })

  test('clearing a diagram asks first, and a refusal keeps it', async ({ page }) => {
    await page.goto('/?ex=showcase:0')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    const before = await page.evaluate(() => window.__mp?.source ?? '')

    page.on('dialog', (dialog) => void dialog.dismiss())
    await page.locator('.mp-menu > summary[title="Library"]').click()
    await page.getByRole('button', { name: 'New diagram' }).click()

    await expect(page.locator('.mp-node')).not.toHaveCount(0)
    expect(await page.evaluate(() => window.__mp?.source ?? '')).toBe(before)
  })

  test('the shell fits a narrow window without scrolling sideways', async ({ page }) => {
    await page.goto('/?d=platform')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()

    for (const width of [1024, 820, 600, 390]) {
      await page.setViewportSize({ width, height: 800 })
      // Polled: a resize takes a frame to settle, and the media queries with it.
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
          { message: `${width}px wide` })
        .toBeLessThanOrEqual(0)
    }

    // Stacked, the canvas gets the whole width rather than a sliver of it.
    const canvas = await page.locator('.mp-canvas-root').boundingBox()
    expect(canvas?.width).toBeGreaterThan(340)
  })

  test('f drops every piece of chrome, Escape brings it back', async ({ page }) => {
    await page.goto('/?d=platform')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-toolbar')).toBeVisible()

    // Not a corner click: the canvas tools sit top-left and the search field
    // there is a text input, where 'f' rightly means the letter f.
    const before = await page.locator('svg.mp-diagram').boundingBox()
    await page.locator('.mp-canvas-root').focus()
    await page.keyboard.press('f')
    await expect(page.locator('.mp-toolbar')).toBeHidden()
    await expect(page.locator('.mp-statusbar')).toBeHidden()
    await expect(page.getByRole('button', { name: /full-bleed/i })).toBeVisible()

    // Hiding the bars removes them as grid items rather than collapsing them.
    // With the rows still written for three, the canvas auto-placed into a
    // zero-height track and the diagram vanished — a blank screen that hid
    // itself behind "everything else is hidden too".
    const canvas = await page.locator('.mp-canvas-root').boundingBox()
    const view = page.viewportSize()!
    expect(canvas?.height).toBeGreaterThan(view.height * 0.9)
    const after = await page.locator('svg.mp-diagram').boundingBox()
    // The point of full-bleed is that the diagram gets the screen.
    expect(after!.width).toBeGreaterThan(before!.width)
    expect(after!.width).toBeGreaterThan(view.width * 0.6)

    await page.keyboard.press('Escape')
    await expect(page.locator('.mp-toolbar')).toBeVisible()
  })

  test('typing an f in the editor does not black out the chrome', async ({ page }) => {
    await page.goto('/?d=platform')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    // Monaco is lazy-loaded; its textarea is the thing that takes the keys.
    const input = page.locator('.mp-editor-pane textarea.inputarea')
    await expect(input).toBeAttached({ timeout: 30_000 })
    await input.focus()
    await page.keyboard.type('f')
    await expect(page.locator('.mp-app')).not.toHaveAttribute('data-presenting', 'true')
    await expect(page.locator('.mp-toolbar')).toBeVisible()
  })

  test('the direction control rewrites the source', async ({ page }) => {
    await page.goto('/?d=platform')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()

    const source = () => page.evaluate(() => window.__mp?.source ?? '')

    await page.getByRole('radio', { name: 'Top to bottom' }).click()
    await expect(page.getByRole('radio', { name: 'Top to bottom' })).toHaveAttribute('aria-checked', 'true')
    await expect.poll(source).toContain('%%mp: layout direction=DOWN')

    await page.getByRole('radio', { name: 'Left to right' }).click()
    await expect.poll(source).toContain('%%mp: layout direction=RIGHT')
    // One directive, edited in place, not a growing pile of them.
    expect((await source()).match(/%%mp: layout/g) ?? []).toHaveLength(1)
  })
})
