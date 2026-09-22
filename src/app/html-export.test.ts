import { describe, expect, it } from 'vitest'
import { buildStandaloneHtml } from '@/app/html-export'

const base = {
  title: 'Order flow',
  background: '#fafafa',
  foreground: '#1a1a1a',
  muted: '#6b7280',
  border: '#d4d4d8',
  fontFamily: 'Inter, sans-serif',
  width: 400,
  height: 300,
}

describe('buildStandaloneHtml', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect style="fill:rgb(1,2,3)"/></svg>'

  it('produces a complete document carrying the theme', () => {
    const html = buildStandaloneHtml(svg, base)
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<title>Order flow</title>')
    expect(html).toContain('background: #fafafa')
    expect(html).toContain('Inter, sans-serif')
    expect(html.trimEnd().endsWith('</html>')).toBe(true)
  })

  it('embeds the diagram unchanged and its true size', () => {
    const html = buildStandaloneHtml(svg, base)
    expect(html).toContain(svg)
    expect(html).toContain('width: 400, height: 300')
  })

  it('embeds the source, escaped, when given one', () => {
    const html = buildStandaloneHtml(svg, { ...base, source: 'flowchart TD\n  a --> b & c' })
    expect(html).toContain('Mermaid source')
    expect(html).toContain('flowchart TD\n  a --&gt; b &amp; c')
  })

  it('omits the source panel when there is none', () => {
    expect(buildStandaloneHtml(svg, base)).not.toContain('Mermaid source')
  })

  it('escapes the title so a diagram name cannot inject markup', () => {
    const html = buildStandaloneHtml(svg, { ...base, title: '<script>alert(1)</script>' })
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<title><script>')
  })

  it('needs no network: no external stylesheet, script or image', () => {
    const html = buildStandaloneHtml(svg, { ...base, source: 'flowchart TD' })
    expect(html).not.toMatch(/<link[^>]+href=/)
    expect(html).not.toMatch(/<script[^>]+src=/)
    expect(html).not.toMatch(/https?:\/\/(?!www\.w3\.org)/)
  })
})
