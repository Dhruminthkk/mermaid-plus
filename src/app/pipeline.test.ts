// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import ELK from 'elkjs/lib/elk.bundled.js'
import { compile } from '@/app/pipeline'
import { runLayout } from '@/core/layout'
import { renderSvg } from '@/core/render'
import { cleanLight } from '@/core/theme'
import type { DiagramIR } from '@/core/ir'
import type { Theme } from '@/core/theme'

const elk = new ELK()
const inlineLayout = (ir: DiagramIR, theme: Theme) => runLayout(ir, theme, elk)
const fakeTier2 = async (source: string) => ({ svg: `<svg data-src-len="${source.length}"></svg>`, width: 10, height: 20 })

const SOURCE = [
  'flowchart LR',
  '%%mp: node api icon=aws:lambda',
  '  client[Browser Client] -->|HTTPS| api[Auth Service]',
  '  api --> db[(Postgres)]',
  '  subgraph infra [Infra]',
  '    db',
  '  end',
].join('\n')

describe('compile', () => {
  it('runs parse → enrich → layout and returns a renderable layout', async () => {
    const result = await compile(SOURCE, cleanLight, inlineLayout, fakeTier2)
    if (!result.ok) throw new Error(result.error.message)
    if (result.rendered.tier !== 1) throw new Error('expected tier 1')
    const { layout } = result.rendered
    expect(layout.nodes.map((n) => n.id).sort()).toEqual(['api', 'client', 'db'])
    expect(layout.ir.nodes.find((n) => n.id === 'db')?.archetype).toBe('database')
    expect(layout.ir.nodes.find((n) => n.id === 'api')?.icon).toBe('aws:lambda')
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0)
    expect(result.rendered.icons['aws:lambda']?.monochrome).toBe(false)
    // "Postgres" names a technology, so it outranks the archetype's generic glyph.
    expect(layout.ir.nodes.find((n) => n.id === 'db')?.icon).toBe('tech:postgresql')
    expect(result.rendered.icons['tech:postgresql']?.monochrome).toBe(false)
    const svg = renderSvg(layout, cleanLight, result.rendered.icons)
    expect(svg).not.toMatch(/NaN|undefined/)
    expect(svg).toContain('data-archetype="database"')
    expect(svg).toContain('mp-node-icon')
  })

  it('collapses groups from directives and user overrides', async () => {
    const src = 'flowchart TD\n%%mp: group infra collapsed\n  client --> api\n  api --> db\n  subgraph infra [Infra]\n    db\n  end'
    const byDirective = await compile(src, cleanLight, inlineLayout, fakeTier2)
    if (!byDirective.ok || byDirective.rendered.tier !== 1) throw new Error('expected tier 1')
    expect(byDirective.rendered.collapsed).toEqual(['infra'])
    expect(byDirective.rendered.layout.nodes.map((n) => n.id).sort()).toEqual(['api', 'client', 'infra'])

    const expanded = await compile(src, cleanLight, inlineLayout, fakeTier2, { collapsedOverrides: { infra: false } })
    if (!expanded.ok || expanded.rendered.tier !== 1) throw new Error('expected tier 1')
    expect(expanded.rendered.collapsed).toEqual([])
    expect(expanded.rendered.layout.nodes.map((n) => n.id).sort()).toEqual(['api', 'client', 'db'])
  })

  it('warns about unknown icons without failing', async () => {
    const result = await compile('flowchart TD\n%%mp: node a icon=aws:nope\n  a --> b', cleanLight, inlineLayout, fakeTier2)
    if (!result.ok) throw new Error(result.error.message)
    expect(result.warnings).toContain('unknown icon "aws:nope"')
  })

  it('lets a theme directive override the selected theme', async () => {
    const result = await compile('%%mp: theme slate-dark\nflowchart TD\n  a --> b', cleanLight, inlineLayout, fakeTier2)
    if (!result.ok) throw new Error(result.error.message)
    expect(result.rendered.theme.id).toBe('slate-dark')
  })

  it('routes non-tier-1 diagrams through the tier-2 renderer', async () => {
    const result = await compile('pie title Votes\n  "A" : 10', cleanLight, inlineLayout, fakeTier2)
    if (!result.ok) throw new Error(result.error.message)
    expect(result.rendered).toMatchObject({ tier: 2, kind: 'pie', width: 10, height: 20 })
  })

  it('reports a tier-2 failure as an error result', async () => {
    const boom = async () => { throw new Error('mermaid choked') }
    const result = await compile('pie title Votes\n  "A" : 10', cleanLight, inlineLayout, boom)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('mermaid choked')
  })

  it('returns the parse error for invalid source', async () => {
    const result = await compile('flowchart TD\n  a -->', cleanLight, inlineLayout, fakeTier2)
    expect(result.ok).toBe(false)
  })

  it('reports a layout failure as an error result instead of throwing', async () => {
    const failingLayout = async () => { throw new Error('elk exploded') }
    const result = await compile('flowchart TD\n  a --> b', cleanLight, failingLayout, fakeTier2)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('elk exploded')
  })
})
