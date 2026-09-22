import { expect, test } from '@playwright/test'

test.describe('complex systems', () => {
  test('collapsed groups render as single nodes and expand on click', async ({ page }) => {
    await page.goto('/?d=platform')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-node[data-collapsed="true"]')).toHaveCount(2)
    await expect(page.locator('.mp-node[data-node-id="odb"]')).toHaveCount(0)
    const bundled = page.locator('.mp-edge[data-weight]:not([data-weight="1"])')
    expect(await bundled.count()).toBeGreaterThan(0)

    await page.locator('.mp-node[data-node-id="data"]').click()
    await expect(page.locator('.mp-node[data-node-id="odb"]')).toBeVisible()
    await expect(page.locator('.mp-node[data-collapsed="true"]')).toHaveCount(1)

    await page.locator('.mp-group-title[data-group-toggle="data"]').click()
    await expect(page.locator('.mp-node[data-collapsed="true"]')).toHaveCount(2)

    await page.getByRole('button', { name: /Expand 2 collapsed/ }).click()
    await expect(page.locator('.mp-node[data-collapsed="true"]')).toHaveCount(0)
    await expect(page.locator('.mp-node[data-node-id="dash"]')).toBeVisible()
  })

  test('an expanded group keeps its name inside the chip behind it', async ({ page }) => {
    await page.goto('/?d=platform')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: /Expand 2 collapsed/ }).click()
    await expect(page.locator('.mp-group-label')).not.toHaveCount(0)

    // The title is drawn uppercase, bolder and tracked out — and larger again at
    // low detail — so a chip measured from the plain label font is far too
    // narrow and the name runs off it. Checked at both detail levels.
    const overflows = () => page.evaluate(() =>
      [...document.querySelectorAll('.mp-group-label')].flatMap((label) => {
        const chip = [...label.querySelectorAll('.mp-group-chip')]
          .find((el) => getComputedStyle(el).display !== 'none')
        const text = label.querySelector('.mp-group-title')
        if (!(chip instanceof SVGGraphicsElement) || !(text instanceof SVGGraphicsElement)) return []
        const c = chip.getBBox()
        const t = text.getBBox()
        const slack = Math.min(t.x - c.x, c.x + c.width - (t.x + t.width), t.y - c.y, c.y + c.height - (t.y + t.height))
        return slack < 1 ? [`${text.textContent}: ${slack.toFixed(2)}px`] : []
      }))

    expect(await overflows()).toEqual([])
    await page.getByRole('button', { name: '100%' }).click()
    await expect(page.locator('.mp-diagram[data-lod="low"]')).toHaveCount(0)
    expect(await overflows()).toEqual([])
  })

  test('focus mode dims everything beyond N hops', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.locator('.mp-node[data-node-id="q"]').click()
    await page.getByRole('button', { name: 'Focus q' }).click()
    await expect(page.locator('.mp-diagram[data-focus="true"]')).toBeVisible()
    await expect(page.locator('.mp-node[data-node-id="user"][data-dimmed="true"]')).toBeVisible()
    await expect(page.locator('.mp-node[data-node-id="worker"]:not([data-dimmed])')).toBeVisible()
    await page.locator('input[aria-label="Focus hops"]').fill('3')
    await expect(page.locator('.mp-node[data-node-id="api"]:not([data-dimmed])')).toBeVisible()
  })

  test('search highlights matches and Enter jumps to the first', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByLabel('Find node').fill('service')
    await expect(page.getByTestId('match-count')).toContainText('4 matches')
    await expect(page.locator('.mp-node[data-match="true"]')).toHaveCount(4)
    await page.getByLabel('Find node').press('Enter')
    await expect(page.locator('.mp-node[data-selected="true"]')).toHaveCount(1)
  })

  test('the canvas is keyboard navigable', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    const viewport = page.locator('.mp-viewport')
    await viewport.focus()
    const before = await viewport.getAttribute('data-mp-scale')
    await page.keyboard.press('+')
    await expect.poll(() => viewport.getAttribute('data-mp-scale')).not.toBe(before)
    await page.keyboard.press('0')
    await expect.poll(() => viewport.getAttribute('data-mp-scale')).toBe(before)
    await expect(page.locator('svg.mp-diagram[role="img"] > title')).toHaveText('flowchart diagram')
  })

  test('minimap shows for larger diagrams and semantic zoom hides labels when far out', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-minimap')).toBeVisible()
    await expect(page.locator('.mp-minimap-view')).toBeVisible()
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Zoom out' }).click()
    await expect(page.locator('.mp-viewport[data-lod="low"]')).toBeVisible()
    await expect(page.locator('.mp-diagram[data-lod="low"]')).toBeVisible()
    await expect(page.locator('.mp-node[data-node-id="api"] .mp-node-label')).toBeHidden()
    await page.getByRole('button', { name: 'Fit' }).click()
    await expect(page.locator('.mp-diagram[data-lod="full"]')).toBeVisible()
  })
})
