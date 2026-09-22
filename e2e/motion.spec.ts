import { expect, test } from '@playwright/test'

const SOURCE = `flowchart LR
  a[Producer] -.-> b[Consumer]
  b --> c[(Store)]`

/**
 * Whether one edge's highlight is running. Opacity is part of the keyframes now,
 * so only the animation itself is a stable thing to assert on.
 */
async function flowing(page: import('@playwright/test').Page, edgeId: string): Promise<boolean> {
  return page.evaluate((id) => {
    const overlay = document.querySelector(`.mp-edge[data-edge-id="${id}"] .mp-edge-flow`)
    return overlay !== null && getComputedStyle(overlay).animationName.startsWith('mp-flow-')
  }, edgeId)
}

test.describe('motion', () => {
  test.beforeEach(async ({ page }) => {
    // The suite screenshots with animations disabled; these tests are about the
    // motion itself, so they ask for the unrestricted treatment explicitly.
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('every edge carries a travelling highlight', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate((s) => window.__mp?.setSource?.(s), SOURCE)
    await expect(page.locator('.mp-edge[data-flow="true"]')).toHaveCount(2)

    expect(await flowing(page, 'a->b')).toBe(true)
    expect(await flowing(page, 'b->c')).toBe(true)
  })

  test('the pulse walks the graph: each layer starts as the one before it lands', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate(() => window.__mp?.setSource?.(
      'flowchart LR\n  a[Ingest] --> b[Queue]\n  b --> c[Worker]\n  c --> d[(Store)]\n  b --> e[Audit]'))
    await expect(page.locator('.mp-edge[data-flow="true"]')).toHaveCount(4)

    const timing = await page.evaluate(() => {
      const step = parseFloat(getComputedStyle(document.querySelector('.mp-diagram')!).getPropertyValue('--mp-flow-step'))
      const delayOf = (id: string) =>
        parseFloat(getComputedStyle(document.querySelector(`.mp-edge[data-edge-id="${id}"] .mp-edge-flow`)!).animationDelay)
      return { step, a: delayOf('a->b'), b: delayOf('b->c'), e: delayOf('b->e'), c: delayOf('c->d') }
    })

    // One slot per layer, siblings together, nothing overlapping its parent.
    expect(timing.a).toBeCloseTo(0, 2)
    expect(timing.b).toBeCloseTo(timing.step, 2)
    expect(timing.e).toBeCloseTo(timing.step, 2)
    expect(timing.c).toBeCloseTo(timing.step * 2, 2)
  })

  test('flow=auto narrows the highlight to the broken lines', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate((s) => window.__mp?.setSource?.(s), `%%mp: layout flow=auto\n${SOURCE}`)
    await expect(page.locator('.mp-edge[data-flow="true"]')).toHaveCount(1)

    expect(await flowing(page, 'a->b')).toBe(true)
    expect(await flowing(page, 'b->c')).toBe(false)
  })

  test('selecting a node leaves only its neighbourhood moving', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate((s) => window.__mp?.setSource?.(s), SOURCE)
    await expect(page.locator('.mp-edge[data-flow="true"]')).toHaveCount(2)

    // Now that every edge flows at rest, the selection has to read against that:
    // everything outside the neighbourhood stops.
    await page.locator('.mp-node[data-node-id="a"]').click()
    await expect(page.locator('.mp-diagram[data-emphasis="true"]')).toBeVisible()
    expect(await flowing(page, 'a->b')).toBe(true)
    expect(await flowing(page, 'b->c')).toBe(false)
  })

  test('the toolbar toggle stills the diagram and is remembered', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate((s) => window.__mp?.setSource?.(s), SOURCE)
    await expect(page.locator('.mp-edge-flow')).not.toHaveCount(0)

    const toggle = page.getByRole('button', { name: 'Motion', exact: true })
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(page.locator('.mp-diagram[data-motion="on"]')).toHaveCount(0)
    await expect(page.locator('.mp-edge-flow')).toHaveCount(0)

    // The preference outlives the page; the draft brings the diagram back.
    await page.reload()
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Motion', exact: true })).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('.mp-edge-flow')).toHaveCount(0)

    await page.getByRole('button', { name: 'Motion', exact: true }).click()
    await expect(page.locator('.mp-diagram[data-motion="on"]')).toBeVisible()
  })

  test('%%mp: layout motion=off stills the whole diagram', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate((s) => window.__mp?.setSource?.(s), `%%mp: layout motion=off\n${SOURCE}`)
    await expect(page.locator('.mp-diagram[data-motion="on"]')).toHaveCount(0)
    // A still diagram does not pay for the overlay at all.
    await expect(page.locator('.mp-edge-flow')).toHaveCount(0)
  })

  test('a viewer who asked for reduced motion gets none of it', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate((s) => window.__mp?.setSource?.(s), SOURCE)
    await expect(page.locator('.mp-edge[data-flow="true"]')).toHaveCount(2)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await flowing(page, 'a->b')).toBe(false)
    const nodeAnimation = await page.evaluate(() => getComputedStyle(document.querySelector('.mp-node')!).animationName)
    expect(nodeAnimation).toBe('none')
  })

  test('exports are still, except the HTML page which can move', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.evaluate((s) => window.__mp?.setSource?.(s), SOURCE)
    await expect(page.locator('.mp-edge[data-flow="true"]')).toHaveCount(2)

    const save = async (label: string) => {
      const download = page.waitForEvent('download')
      await page.keyboard.press('Meta+k')
      await expect(page.locator('.mp-palette input')).toBeVisible()
      await page.locator('.mp-palette input').fill(label)
      await page.keyboard.press('Enter')
      const stream = await (await download).createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) chunks.push(chunk as Buffer)
      return Buffer.concat(chunks).toString('utf8')
    }

    const svg = await save('Export SVG')
    expect(svg).not.toContain('data-motion')
    expect(svg).not.toContain('@keyframes')
    // The overlay travels with the file but is painted out of existence.
    expect(svg).toContain('mp-edge-flow')
    expect(svg).toMatch(/class="mp-edge-flow"[^>]*opacity:0/)

    const html = await save('Export standalone HTML')
    expect(html).toContain('data-motion="on"')
    expect(html).toContain('@keyframes mp-flow')
    expect(html).toContain('prefers-reduced-motion')
  })
})
