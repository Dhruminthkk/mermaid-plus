import { expect, test } from '@playwright/test'

test.describe('editor', () => {
  test('loads Monaco locally with the mermaid language and marks parse errors', async ({ page }) => {
    const cdn: string[] = []
    page.on('request', (r) => { if (!r.url().startsWith('http://localhost:5173')) cdn.push(r.url()) })
    await page.goto('/?d=basic')
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    expect(cdn, 'no external requests').toEqual([])

    await page.evaluate(() => window.__mp?.setSource?.('flowchart TD\n  a -->'))
    await expect(page.locator('.mp-error-strip')).toBeVisible()
    await expect(page.locator('.monaco-editor .squiggly-error')).toBeVisible()
  })

  test('clicking a node selects it and reveals its line; the status bar names the diagram', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 20_000 })
    await page.locator('.mp-node[data-node-id="orders"]').click()
    await expect(page.locator('.mp-node[data-selected="true"][data-node-id="orders"]')).toBeVisible()
    await expect(page.locator('.mp-line-highlight')).toBeVisible()
    await expect(page.locator('.mp-statusbar')).toContainText('flowchart')
  })
})

test.describe('exporting', () => {
  test('a clear-background export leaves the ground out', async ({ page }) => {
    await page.goto('/?d=shapes')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()

    const save = async () => {
      const download = page.waitForEvent('download')
      await page.keyboard.press('Meta+k')
      await expect(page.locator('.mp-palette input')).toBeVisible()
      await page.locator('.mp-palette input').fill('Export SVG')
      await page.keyboard.press('Enter')
      const stream = await (await download).createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) chunks.push(chunk as Buffer)
      return Buffer.concat(chunks).toString('utf8')
    }

    expect(await save()).toContain('class="mp-canvas"')

    await page.locator('.mp-menu > summary[title="Export"]').click()
    await page.getByText('Clear background').click()
    await page.keyboard.press('Escape')
    const clear = await save()
    expect(clear).not.toContain('class="mp-canvas"')

    // And it is remembered, so the next export is not a surprise.
    await page.reload()
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    expect(await save()).not.toContain('class="mp-canvas"')
  })

  test('exports a standalone SVG with styles inlined', async ({ page }) => {
    await page.goto('/?d=shapes')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.locator('.mp-menu', { hasText: 'Export' }).locator('summary').click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'SVG', exact: true }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/\.svg$/)
    const path = await download.path()
    const fs = await import('node:fs/promises')
    const svg = await fs.readFile(path!, 'utf8')
    expect(svg.startsWith('<?xml')).toBe(true)
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).not.toContain('var(--mp')
    expect(svg).toMatch(/fill:\s*rgb\(/)
  })

  test('exports a self-contained, interactive HTML page at full detail', async ({ page }) => {
    await page.goto('/?d=architecture')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    // Zoom out until the canvas drops to low detail: the export must ignore it.
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Zoom out' }).click()
    await expect(page.locator('.mp-diagram[data-lod="low"]')).toBeVisible()
    await page.locator('.mp-menu', { hasText: 'Export' }).locator('summary').click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'HTML page' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/\.html$/)
    const fs = await import('node:fs/promises')
    const html = await fs.readFile((await download.path())!, 'utf8')
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<svg')
    expect(html).not.toContain('var(--mp')
    expect(html).toContain('Mermaid source')
    // The file must not inherit the canvas's zoom state.
    expect(html).not.toContain('data-lod="low"')
    expect(html).not.toContain('data-dimmed')

    // It has to actually work when opened on its own, with no server.
    const page2 = await page.context().newPage()
    const errors: string[] = []
    page2.on('pageerror', (e) => errors.push(String(e)))
    await page2.goto('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    await expect(page2.locator('#canvas > svg')).toBeVisible()
    await expect(page2.locator('.mp-node')).not.toHaveCount(0)
    const before = await page2.locator('#zoom').textContent()
    await page2.getByRole('button', { name: 'Zoom in' }).click()
    expect(await page2.locator('#zoom').textContent()).not.toBe(before)
    expect(errors).toEqual([])
    await page2.close()
  })

  test('exports a draw.io file that diagrams.net and Lucid can open', async ({ page }) => {
    await page.goto('/?d=subgraphs')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.locator('.mp-menu', { hasText: 'Export' }).locator('summary').click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'draw.io / Lucid' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/\.drawio$/)
    const fs = await import('node:fs/promises')
    const xml = await fs.readFile((await download.path())!, 'utf8')
    expect(xml.startsWith('<mxfile')).toBe(true)
    expect(xml).toContain('<mxGraphModel')
    // Real vertices and connections, not a picture.
    expect(xml).toMatch(/vertex="1"/)
    expect(xml).toMatch(/edge="1"[^>]*source="[^"]+" target="[^"]+"/)
    expect(xml).toContain('container=1')

    const wellFormed = await page.evaluate((doc) => {
      const parsed = new DOMParser().parseFromString(doc, 'application/xml')
      return {
        error: parsed.querySelector('parsererror')?.textContent ?? null,
        cells: parsed.querySelectorAll('mxCell').length,
      }
    }, xml)
    expect(wellFormed.error).toBeNull()
    expect(wellFormed.cells).toBeGreaterThan(8)
  })

  test('exports a PNG at 2x', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    await page.locator('.mp-menu', { hasText: 'Export' }).locator('summary').click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'PNG 2×' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/@2x\.png$/)
  })
})

test.describe('library', () => {
  test('saves the current diagram and reopens it', async ({ page }) => {
    await page.goto('/?d=basic')
    await expect(page.locator('[data-mp-ready="true"]')).toBeVisible()
    page.once('dialog', (d) => d.accept('My saved flow'))
    await page.locator('.mp-menu', { hasText: 'Library' }).locator('summary').click()
    await page.getByRole('button', { name: 'Save current…' }).click()
    await page.evaluate(() => window.__mp?.setSource?.('flowchart TD\n  z --> y'))
    await expect(page.locator('.mp-node[data-node-id="z"]')).toBeVisible()
    await page.locator('.mp-menu', { hasText: 'Library' }).locator('summary').click()
    await page.getByRole('button', { name: 'My saved flow', exact: true }).click()
    await expect(page.locator('.mp-node[data-node-id="a"]')).toBeVisible()
  })
})
