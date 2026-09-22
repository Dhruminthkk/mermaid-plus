// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { inlineComputedStyles } from '@/app/export'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Builds a live SVG whose look comes from a stylesheet rather than from
 * attributes — the case the export has to survive, because it strips the
 * stylesheet and keeps only what it managed to inline.
 *
 * The rules go in the document head: jsdom resolves the cascade from there,
 * and `inlineComputedStyles` reads `getComputedStyle`, not the SVG's own
 * `<style>` child.
 */
function mount(css: string, body: string): SVGSVGElement {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  const host = document.createElement('div')
  host.innerHTML = `<svg xmlns="${SVG_NS}" class="mp-diagram"><style>${css}</style>${body}</svg>`
  document.body.appendChild(host)
  return host.querySelector('svg') as unknown as SVGSVGElement
}

afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})

describe('inlineComputedStyles', () => {
  it('keeps CSS-hidden elements hidden once the stylesheet is gone', () => {
    // The low-detail group chips are hidden by a rule, not an attribute. An
    // export that drops the rule without inlining `display` lays a translucent
    // slab across every group in the file.
    const live = mount(
      '.mp-group-chip-lod{display:none}',
      '<rect class="mp-group-chip mp-group-chip-lod" width="10" height="10"></rect>',
    )
    const clone = inlineComputedStyles(live)

    expect(clone.querySelectorAll('style')).toHaveLength(0)
    expect(clone.querySelector('.mp-group-chip-lod')?.getAttribute('style')).toContain('display:none')
  })

  it('leaves visible elements without a display declaration', () => {
    const live = mount('.shown{fill:#ff0000}', '<rect class="shown" width="10" height="10"></rect>')
    const clone = inlineComputedStyles(live)
    const style = clone.querySelector('.shown')?.getAttribute('style') ?? ''
    expect(style).toContain('fill')
    expect(style).not.toContain('display')
  })

  it('drops presentation attributes that still hold unresolved var()', () => {
    const live = mount(
      '.v{fill:#123456}',
      '<rect class="v" fill="var(--mp-color-surface)" width="10" height="10"></rect>',
    )
    const clone = inlineComputedStyles(live)
    const rect = clone.querySelector('.v')
    expect(rect?.hasAttribute('fill')).toBe(false)
    expect(rect?.getAttribute('style')).toContain('#123456')
  })
})
