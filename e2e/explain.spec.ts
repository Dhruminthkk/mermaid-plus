import { expect, test } from '@playwright/test'

test.describe('hover explanations', () => {
  test('a node explains itself: note, group, connections, source line', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    await page.locator('.mp-node[data-node-id="api"]').hover()
    const card = page.locator('.mp-detail')
    await expect(card).toBeVisible()
    await expect(card).toContainText('API Gateway')
    await expect(card).toContainText('service')
    await expect(card.locator('.mp-detail-note')).toContainText('Every request enters here')
    await expect(card).toContainText('Edge')
    await expect(card.locator('.mp-detail-links')).toHaveCount(2)
    await expect(card).toContainText('Auth Service')
    await expect(card.locator('.mp-detail-source')).toContainText('line')
  })

  test('shows authored metadata and hides it again on leave', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    await page.locator('.mp-node[data-node-id="q"]').hover()
    const card = page.locator('.mp-detail')
    await expect(card).toBeVisible()
    await expect(card.locator('.mp-detail-meta')).toContainText('owner')
    await expect(card.locator('.mp-detail-meta')).toContainText('Platform')

    await page.mouse.move(5, 5)
    await expect(card).toHaveCount(0)
  })

  test('an edge explains the relationship it represents', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    // An orthogonal edge's bounding-box centre is rarely on the line, so ask the
    // element itself rather than aiming the pointer at it.
    await page.locator('.mp-edge[data-edge-id="api->orders"]').dispatchEvent('pointerover')
    const card = page.locator('.mp-detail')
    await expect(card).toBeVisible()
    await expect(card).toContainText('API Gateway')
    await expect(card).toContainText('Order Service')
    await expect(card.locator('.mp-detail-note')).toContainText('Synchronous')
  })

  test('clicking explains at the bottom instead of over the diagram', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    await page.locator('.mp-node[data-node-id="api"]').hover()
    await expect(page.locator('.mp-detail')).toBeVisible()

    await page.locator('.mp-node[data-node-id="api"]').click()
    // The floating tooltip gives way to the panel, and stays down while the
    // pointer is still on the node it just explained.
    await expect(page.locator('.mp-detail')).toHaveCount(0)
    const panel = page.locator('.mp-panel')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('API Gateway')
    await expect(panel).toContainText('Every request enters here')
    await page.waitForTimeout(450)
    await expect(page.locator('.mp-detail')).toHaveCount(0)

    // The panel sits below the middle of the canvas, out of the picture.
    const canvas = (await page.locator('.mp-canvas-root').boundingBox())!
    const box = (await panel.boundingBox())!
    expect(box.y).toBeGreaterThan(canvas.y + canvas.height / 2)
  })

  test('the panel walks the graph and Escape clears the selection', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    await page.locator('.mp-node[data-node-id="api"]').click()
    const panel = page.locator('.mp-panel')
    await panel.getByRole('button', { name: 'Auth Service' }).click()
    await expect(page.locator('.mp-node[data-selected="true"][data-node-id="auth"]')).toBeVisible()
    await expect(panel).toContainText('Auth Service')

    await page.keyboard.press('Escape')
    await expect(page.locator('.mp-panel')).toHaveCount(0)
    await expect(page.locator('.mp-diagram[data-emphasis="true"]')).toHaveCount(0)
  })

  test('hovering again after moving off the clicked node still explains', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    await page.locator('.mp-node[data-node-id="api"]').click()
    await expect(page.locator('.mp-detail')).toHaveCount(0)
    await page.locator('.mp-node[data-node-id="auth"]').hover()
    await expect(page.locator('.mp-detail')).toContainText('Auth Service')
  })

  test('stays out of the way when the diagram is too small to read', async ({ page }) => {
    await page.goto('/?d=stress-200')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('.mp-viewport[data-lod="low"]')).toBeVisible()
    await page.locator('.mp-node').first().hover({ force: true })
    await page.waitForTimeout(450)
    await expect(page.locator('.mp-detail')).toHaveCount(0)
  })
})

test.describe('legend', () => {
  test('explains only the shapes the diagram actually uses', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Legend' }).click()

    const legend = page.locator('.mp-legend')
    await expect(legend).toBeVisible()
    await expect(legend).toContainText('Service or application')
    await expect(legend).toContainText('Data store')
    await expect(legend).toContainText('Queue, topic or stream')
    // Nothing in this diagram is a decision, so the legend does not claim otherwise.
    await expect(legend).not.toContainText('Branch or condition')

    // Swatches carry the theme's colours, not a default black.
    const fill = await legend.locator('.mp-legend-list svg').first().locator('path, rect').first()
      .evaluate((el) => getComputedStyle(el).fill)
    expect(fill).not.toBe('rgb(0, 0, 0)')

    await legend.getByRole('button', { name: 'Close legend' }).click()
    await expect(legend).toHaveCount(0)
  })
})
