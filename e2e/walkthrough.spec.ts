import { expect, test } from '@playwright/test'

test.describe('walkthrough', () => {
  test('is offered only by diagrams that define steps', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Present/ })).toHaveCount(0)

    await page.goto('/?d=walkthrough')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Present/ })).toContainText('5')
  })

  test('walks the diagram, dimming everything the step is not about', async ({ page }) => {
    await page.goto('/?d=walkthrough')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: /Present/ }).click()

    const note = page.locator('.mp-wt-note')
    await expect(note).toContainText('A shopper arrives')
    await expect(note).toContainText('hits the CDN first')

    // Step 1 is about the shopper and the CDN; the rest recedes.
    await expect(page.locator('.mp-node[data-node-id="user"]:not([data-receded])')).toBeVisible()
    await expect(page.locator('.mp-node[data-node-id="odb"][data-receded="true"]')).toBeVisible()

    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(note).toContainText('Into the platform')
    await expect(page.locator('.mp-node[data-node-id="auth"]:not([data-receded])')).toBeVisible()

    await page.getByRole('button', { name: 'Previous step' }).click()
    await expect(note).toContainText('A shopper arrives')
  })

  test('naming a group presents everything inside it', async ({ page }) => {
    await page.goto('/?d=walkthrough&step=4')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-wt-note')).toContainText('Everything else is async')
    for (const id of ['q', 'fulfil', 'notify', 'email']) {
      await expect(page.locator(`.mp-node[data-node-id="${id}"]:not([data-receded])`)).toBeVisible()
    }
    await expect(page.locator('.mp-node[data-node-id="user"][data-receded="true"]')).toBeVisible()
  })

  test('a step with no focus dims nothing, as a closing slide', async ({ page }) => {
    await page.goto('/?d=walkthrough&step=5')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.mp-wt-note')).toContainText('The whole picture')
    await expect(page.locator('.mp-node[data-receded="true"]')).toHaveCount(0)
  })

  test('arrow keys advance it and Escape ends it', async ({ page }) => {
    await page.goto('/?d=walkthrough&step=1')
    await expect(page.locator('.mp-wt-note')).toContainText('A shopper arrives')
    await page.locator('.mp-canvas-root').click({ position: { x: 20, y: 300 } })
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.mp-wt-note')).toContainText('Into the platform')
    await page.keyboard.press('Escape')
    await expect(page.locator('.mp-walkthrough')).toHaveCount(0)
    await expect(page.locator('.mp-node[data-receded="true"]')).toHaveCount(0)
  })

  test('playing advances on its own and stops at the end', async ({ page }) => {
    await page.goto('/?d=walkthrough&step=4')
    await expect(page.locator('.mp-wt-note')).toContainText('Everything else is async')
    await page.getByRole('button', { name: 'Play walkthrough' }).click()
    await expect(page.locator('.mp-wt-note')).toContainText('The whole picture', { timeout: 9000 })
    // Last step: it stops rather than looping.
    await expect(page.getByRole('button', { name: 'Play walkthrough' })).toBeVisible()
  })
})

test.describe('hover and selection', () => {
  test('the tooltip goes away when the pointer leaves the component', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    await page.locator('.mp-node[data-node-id="api"]').hover()
    await expect(page.locator('.mp-detail')).toBeVisible()

    // Onto empty canvas, not out of the canvas entirely.
    await page.locator('.mp-viewport').hover({ position: { x: 12, y: 320 } })
    await expect(page.locator('.mp-detail')).toHaveCount(0)
  })

  test('hovering explains without highlighting; clicking highlights', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in' }).click()

    await page.locator('.mp-node[data-node-id="api"]').hover()
    await expect(page.locator('.mp-detail')).toBeVisible()
    await expect(page.locator('.mp-diagram[data-emphasis="true"]')).toHaveCount(0)
    await expect(page.locator('.mp-node[data-receded="true"]')).toHaveCount(0)

    await page.locator('.mp-node[data-node-id="api"]').click()
    await expect(page.locator('.mp-diagram[data-emphasis="true"]')).toBeVisible()
    await expect(page.locator('.mp-panel')).toBeVisible()
    await expect(page.locator('.mp-node[data-node-id="auth"]:not([data-receded])')).toBeVisible()
    await expect(page.locator('.mp-node[data-node-id="email"][data-receded="true"]')).toBeVisible()
  })
})
