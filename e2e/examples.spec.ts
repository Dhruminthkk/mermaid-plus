import { expect, test } from '@playwright/test'

// One example per kind, rendered for real in the browser. Parse-level tests
// cover all 200; this proves each kind survives mermaid.render / ELK too.
const KINDS = [
  'flowchart', 'class', 'state', 'er', 'mindmap', 'requirement', 'c4',
  'sequence', 'gantt', 'pie', 'timeline', 'journey', 'gitgraph', 'quadrant', 'xychart', 'sankey', 'block', 'kanban', 'packet', 'architecture',
]

for (const kind of KINDS) {
  for (const index of [0, 5]) {
    test(`${kind} example ${index} renders`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.goto(`/?ex=${kind}:${index}`)
      await expect(page.locator('[data-mp-ready="true"]')).toBeVisible({ timeout: 20_000 })
      await expect(page.locator('.mp-error-strip')).toHaveCount(0)
      const svg = page.locator('svg.mp-diagram')
      await expect(svg).toBeVisible()
      const box = await svg.boundingBox()
      expect(box && box.width > 20 && box.height > 20, 'diagram has size').toBe(true)
      // <foreignObject> does not rasterize into a canvas, so any of it would be
      // lost from PNG and PDF export.
      expect(await svg.locator('foreignObject').count(), 'no HTML labels').toBe(0)
      // The viewBox has to contain what was drawn, or edges of the diagram clip.
      const overflow = await page.evaluate(() => {
        const el = document.querySelector('svg.mp-diagram')!
        const vb = (el as SVGSVGElement).viewBox.baseVal
        const b = (el as SVGSVGElement).getBBox()
        return Math.max(vb.x - b.x, vb.y - b.y, b.x + b.width - (vb.x + vb.width), b.y + b.height - (vb.y + vb.height))
      })
      expect(overflow, 'content within viewBox').toBeLessThanOrEqual(0.5)
      expect(errors).toEqual([])
    })
  }
}
