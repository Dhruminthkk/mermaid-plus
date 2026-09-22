import { describe, expect, it } from 'vitest'
import { baseStyles, renderSvg } from '@/core/render'
import { cleanDark, cleanLight, getTheme } from '@/core/theme'
import type { DiagramIR } from '@/core/ir'
import { iconMetrics, measureLabel, type LaidOutDiagram } from '@/core/layout'

const ir: DiagramIR = {
  kind: 'flowchart',
  tier: 1,
  direction: 'TB',
  nodes: [
    { id: 'a', label: 'Client', archetype: 'user', meta: {} },
    { id: 'b', label: 'Postgres<br/>Primary', archetype: 'database', groupId: 'g', meta: {} },
  ],
  edges: [{ id: 'a->b', source: 'a', target: 'b', label: 'reads', semantics: 'flow', style: 'dotted' }],
  groups: [{ id: 'g', label: 'Data', childNodeIds: ['b'] }],
  directives: [],
  raw: '',
}

const layout: LaidOutDiagram = {
  ir,
  nodes: [
    { id: 'a', x: 20, y: 20, width: 100, height: 40 },
    { id: 'b', x: 40, y: 140, width: 120, height: 60 },
  ],
  edges: [{
    id: 'a->b',
    points: [{ x: 70, y: 60 }, { x: 70, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 140 }],
    labelBox: { x: 75, y: 75, width: 40, height: 16 },
  }],
  groups: [{ id: 'g', x: 20, y: 110, width: 160, height: 110 }],
  bounds: { x: 0, y: 0, width: 200, height: 240 },
  width: 200,
  height: 240,
}

describe('renderSvg', () => {
  const svg = renderSvg(layout, cleanLight)

  it('produces a standalone SVG document', () => {
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('viewBox="0 0 200 240"')
  })

  it('inlines the theme as CSS custom properties', () => {
    expect(svg).toContain('--mp-arch-database-fill:' + cleanLight.color.archetype.database.fill)
    expect(svg).toContain(`data-theme="${cleanLight.id}"`)
  })

  it('tags nodes with id and archetype for interaction and styling', () => {
    expect(svg).toContain('data-node-id="a"')
    expect(svg).toContain('data-archetype="user"')
    expect(svg).toContain('data-archetype="database"')
  })

  it('draws a rounded orthogonal edge with an arrowhead', () => {
    expect(svg).toMatch(/<path[^>]*class="mp-edge-path"[^>]*d="M 70 60 L 70 92 Q 70 100 78 100/)
    expect(svg).toContain('marker-end="url(#mp-m-arrow)"')
    expect(svg).toContain('data-edge-style="dotted"')
  })

  it('renders edge labels over a background plate', () => {
    expect(svg).toContain('class="mp-edge-label-plate"')
    expect(svg).toContain('>reads<')
  })

  it('splits multi-line labels into tspans', () => {
    expect(svg).toContain('>Postgres<')
    expect(svg).toContain('>Primary<')
    expect((svg.match(/<tspan/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })

  it('renders groups behind nodes with a title', () => {
    expect(svg.indexOf('class="mp-groups"')).toBeLessThan(svg.indexOf('class="mp-nodes"'))
    expect(svg).toContain('data-group-id="g"')
    expect(svg).toContain('>Data<')
  })

  it('carries an accessible title and description', () => {
    expect(svg).toContain('<title>flowchart diagram</title>')
    expect(svg).toMatch(/<desc>2 nodes, 1 connections, 1 groups\. Client, Postgres/)
    expect(svg).toContain('role="img"')
  })

  it('dashes async and dependency edges', () => {
    const asyncEdge: LaidOutDiagram = { ...layout, ir: { ...ir, edges: [{ ...ir.edges[0]!, semantics: 'async', style: 'solid' }] } }
    const out = renderSvg(asyncEdge, cleanLight)
    expect(out).toContain('data-semantics="async"')
    expect(out).toContain('.mp-edge[data-semantics="async"] .mp-edge-path{stroke-dasharray:7 5}')
  })

  it('contains no NaN or undefined', () => {
    expect(svg).not.toMatch(/NaN|undefined/)
  })

  it('is deterministic', () => {
    expect(renderSvg(layout, cleanLight)).toBe(svg)
  })

  it('inlines resolved icons and tints monochrome ones from the archetype', () => {
    const withIcon: LaidOutDiagram = { ...layout, ir: { ...ir, nodes: [{ ...ir.nodes[0]!, icon: 'general:user' }, ir.nodes[1]!] } }
    const out = renderSvg(withIcon, cleanLight, { 'general:user': { body: '<circle cx="12" cy="12" r="5"/>', width: 24, height: 24, monochrome: true } })
    expect(out).toContain('class="mp-node-icon" data-monochrome="true"')
    expect(out).toContain('<circle cx="12" cy="12" r="5"/>')
    expect(out).toContain('.mp-node[data-archetype="user"] .mp-node-icon[data-monochrome="true"]{color:var(--mp-arch-user-text)}')
  })

  it('centres icon and label as one group inside the node', () => {
    const NODE_WIDTH = 400
    const wide: LaidOutDiagram = {
      ...layout,
      nodes: [{ id: 'a', x: 0, y: 0, width: NODE_WIDTH, height: 40 }, layout.nodes[1]!],
      ir: { ...ir, nodes: [{ ...ir.nodes[0]!, label: 'Short', icon: 'general:user' }, ir.nodes[1]!] },
    }
    const out = renderSvg(wide, cleanLight, { 'general:user': { body: '<circle/>', width: 24, height: 24, monochrome: true } })
    const iconX = Number(/class="mp-node-icon"[^>]*transform="translate\(([\d.]+) /.exec(out)?.[1])
    const labelX = Number(/<text class="mp-node-label" x="([\d.]+)"/.exec(out)?.[1])

    const metrics = iconMetrics(cleanLight)
    const iconSlot = metrics.size + metrics.gap
    const labelWidth = measureLabel('Short', cleanLight).width
    const expectedIconX = (NODE_WIDTH - (iconSlot + labelWidth)) / 2
    expect(iconX).toBeCloseTo(expectedIconX, 1)
    expect(labelX).toBeCloseTo(expectedIconX + iconSlot + labelWidth / 2, 1)
    // Equal air on both sides of the icon-plus-label group.
    const contentEnd = labelX + labelWidth / 2
    expect(NODE_WIDTH - contentEnd).toBeCloseTo(iconX, 1)
  })

  it('leaves nodes icon-less when the reference did not resolve', () => {
    const withIcon: LaidOutDiagram = { ...layout, ir: { ...ir, nodes: [{ ...ir.nodes[0]!, icon: 'aws:unknown' }, ir.nodes[1]!] } }
    expect(renderSvg(withIcon, cleanLight, {})).not.toContain('class="mp-node-icon"')
  })

  it('switches to rough paths under a sketch-textured theme, deterministically', () => {
    const notebook = getTheme('notebook-light')
    const out = renderSvg(layout, notebook)
    expect(out).toContain('mp-node-body-sketch')
    expect(out).toContain('mp-edge-path-sketch')
    expect(out).not.toContain('class="mp-node-body"')
    expect(out).not.toMatch(/NaN/)
    expect(renderSvg(layout, notebook)).toBe(out)
  })

  it('uses an open arrowhead when the theme asks for one', () => {
    const out = renderSvg(layout, getTheme('blueprint-light'))
    expect(out).toMatch(/<marker id="mp-m-arrow"[^>]*><path d="M 1 1 L 9 5 L 1 9"/)
  })

  it('draws UML heads, endpoint labels, and compartments', () => {
    const uml: LaidOutDiagram = {
      ...layout,
      ir: {
        ...ir,
        kind: 'class',
        nodes: [
          { id: 'a', label: 'Animal', archetype: 'default', shapeHint: 'classBox', compartments: [['«abstract»', 'Animal'], ['+String name'], ['+speak() void']], meta: {} },
          { id: 'b', label: 'Dog', archetype: 'default', shapeHint: 'classBox', compartments: [['Dog'], [], []], groupId: 'g', meta: {} },
        ],
        edges: [{ id: 'a->b', source: 'a', target: 'b', semantics: 'inheritance', style: 'solid', arrowStart: 'triangle-open', arrowEnd: 'none', labelStart: '1', labelEnd: '*' }],
      },
    }
    const out = renderSvg(uml, cleanLight)
    expect(out).toContain('marker-start="url(#mp-m-triangle-open)"')
    expect(out).not.toContain('marker-end=')
    expect(out).toContain('class="mp-compartment-divider"')
    expect(out).toContain('>+String name<')
    expect(out).toContain('mp-compartment-stereotype')
    expect(out).toContain('class="mp-edge-endlabel"')
    expect(out).toContain('>*<')
  })

  it('orders the stylesheet so pseudo-state, selection and match rules beat the archetype fill', () => {
    const css = baseStyles(cleanLight)
    const archetypeFill = css.indexOf('.mp-node[data-archetype="default"] .mp-node-body{fill')
    expect(archetypeFill).toBeGreaterThan(-1)
    for (const rule of [
      '.mp-node-body.mp-node-solid',
      '.mp-node-body.mp-node-ring',
      '.mp-node[data-selected="true"] .mp-node-body{',
      '.mp-node[data-match="true"] .mp-node-body{',
    ]) {
      expect(css.indexOf(rule), rule).toBeGreaterThan(archetypeFill)
    }
  })

  it('renders pseudo-states as solid glyphs and curves mindmap edges', () => {
    const states: LaidOutDiagram = {
      ...layout,
      ir: { ...ir, kind: 'state', nodes: [{ id: 'a', label: '', archetype: 'default', shapeHint: 'stateStart', meta: {} }, { id: 'b', label: '', archetype: 'default', shapeHint: 'stateEnd', groupId: 'g', meta: {} }] },
    }
    const out = renderSvg(states, cleanLight)
    expect(out).toContain('class="mp-node-body mp-node-solid"')
    expect(out).toContain('mp-node-ring')
    expect(out).not.toContain('<text class="mp-node-label"')

    const tree: LaidOutDiagram = { ...layout, ir: { ...ir, kind: 'mindmap', layout: { algorithm: 'mrtree', edgeRouting: 'POLYLINE' } } }
    expect(renderSvg(tree, cleanLight)).toMatch(/class="mp-edge-path"[^>]*d="M 70 60 C 70 100 100 100 100 140"/)
  })

  it('changes only style output between light and dark', () => {
    const dark = renderSvg(layout, cleanDark)
    const strip = (s: string) => s.replace(/<style>[\s\S]*?<\/style>/, '').replace(/data-theme="[^"]+"/, '')
    expect(strip(dark)).toBe(strip(svg))
  })
})
