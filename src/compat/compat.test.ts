import { describe, expect, it } from 'vitest'
import { mermaidThemeVariables, postprocessMermaidSvg, svgSize } from '@/compat'
import { cleanDark, cleanLight } from '@/core/theme'

describe('mermaidThemeVariables', () => {
  it('maps core tokens onto mermaid variables', () => {
    const vars = mermaidThemeVariables(cleanLight)
    expect(vars['background']).toBe(cleanLight.color.canvas)
    expect(vars['lineColor']).toBe(cleanLight.color.edge)
    expect(vars['fontFamily']).toBe(cleanLight.type.family)
    expect(vars['darkMode']).toBe(false)
    expect(mermaidThemeVariables(cleanDark)['darkMode']).toBe(true)
  })

  it('drives pie slices from the accent ramp, wrapping when it runs out', () => {
    const vars = mermaidThemeVariables(cleanLight)
    expect(vars['pie1']).toBe(cleanLight.color.accent[0])
    expect(vars['pie7']).toBe(cleanLight.color.accent[0])
  })

  it('uses the note archetype for sequence notes', () => {
    const vars = mermaidThemeVariables(cleanLight)
    expect(vars['noteBkgColor']).toBe(cleanLight.color.archetype.note.fill)
  })
})

describe('svgSize', () => {
  it('prefers the viewBox', () => {
    expect(svgSize('<svg viewBox="0 0 320.5 200" width="100%">')).toEqual({ width: 321, height: 200 })
  })

  it('falls back to width/height attributes', () => {
    expect(svgSize('<svg width="120" height="80.2">')).toEqual({ width: 120, height: 81 })
  })

  it('returns zeros when nothing is parseable', () => {
    expect(svgSize('<svg>')).toEqual({ width: 0, height: 0 })
  })
})

describe('postprocessMermaidSvg', () => {
  const raw = '<svg id="m1" width="100%" viewBox="0 0 300 150" style="max-width: 300px;" class="mermaid"><g>x</g></svg>'

  it('pins the pixel size and drops max-width so the viewport can scale it', () => {
    const out = postprocessMermaidSvg(raw, cleanLight)
    expect(out.width).toBe(300)
    expect(out.height).toBe(150)
    expect(out.svg).toContain('width="300"')
    expect(out.svg).toContain('height="150"')
    expect(out.svg).not.toContain('max-width')
  })

  it('tags the root with our classes and theme and injects tokens', () => {
    const out = postprocessMermaidSvg(raw, cleanDark)
    expect(out.svg).toMatch(/<svg[^>]*class="mermaid mp-diagram mp-tier2"/)
    expect(out.svg).toContain(`data-theme="${cleanDark.id}"`)
    expect(out.svg).toContain('--mp-color-canvas:' + cleanDark.color.canvas)
  })

  it('keeps the original content', () => {
    expect(postprocessMermaidSvg(raw, cleanLight).svg).toContain('<g>x</g>')
  })
})
