// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { toDrawioXml } from '@/app/drawio-export'
import { cleanLight } from '@/core/theme'
import type { DiagramIR } from '@/core/ir'
import type { LaidOutDiagram } from '@/core/layout'

const ir: DiagramIR = {
  kind: 'flowchart',
  tier: 1,
  direction: 'TB',
  nodes: [
    { id: 'client', label: 'Browser <Client>', archetype: 'user', meta: {} },
    { id: 'api', label: 'API', archetype: 'service', groupId: 'backend', meta: {} },
    { id: 'db', label: 'Postgres', archetype: 'database', groupId: 'backend', meta: {} },
  ],
  edges: [
    { id: 'client->api', source: 'client', target: 'api', label: 'HTTPS', semantics: 'flow', style: 'solid' },
    { id: 'api->db', source: 'api', target: 'db', semantics: 'flow', style: 'dotted', arrowStart: 'one', arrowEnd: 'zero-or-more' },
  ],
  groups: [{ id: 'backend', label: 'Backend', childNodeIds: ['api', 'db'] }],
  directives: [],
  raw: '',
}

const layout: LaidOutDiagram = {
  ir,
  nodes: [
    { id: 'client', x: 40, y: 20, width: 120, height: 40 },
    { id: 'api', x: 60, y: 140, width: 100, height: 40 },
    { id: 'db', x: 60, y: 220, width: 100, height: 40 },
  ],
  edges: [
    { id: 'client->api', points: [{ x: 100, y: 60 }, { x: 100, y: 140 }] },
    { id: 'api->db', points: [{ x: 110, y: 180 }, { x: 110, y: 220 }] },
  ],
  groups: [{ id: 'backend', x: 40, y: 120, width: 160, height: 160 }],
  bounds: { x: 0, y: 0, width: 240, height: 300 },
  width: 240,
  height: 300,
}

/** draw.io refuses to import a file that is not well-formed XML. */
function expectWellFormed(xml: string): void {
  const parsed = new DOMParser().parseFromString(xml, 'application/xml')
  expect(parsed.querySelector('parsererror')?.textContent ?? null).toBeNull()
}

/**
 * The structural rules mxGraph decodes by, checked as a set rather than one at
 * a time: ids are usable, every reference resolves, and a container is always
 * declared before the cells that name it as their parent.
 */
function expectDecodable(xml: string): void {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  expect(doc.querySelector('parsererror')?.textContent ?? null).toBeNull()

  const cells = [...doc.querySelectorAll('mxCell')]
  const declared = new Set<string>()
  const problems: string[] = []
  for (const cell of cells) {
    const id = cell.getAttribute('id') ?? ''
    if (!/^[A-Za-z0-9_-]+$/.test(id)) problems.push(`id "${id}" is not usable as an mxGraph id`)
    for (const attr of ['parent', 'source', 'target']) {
      const ref = cell.getAttribute(attr)
      // A parent has to exist already; endpoints may be declared further down.
      if (attr === 'parent' && ref !== null && ref !== '0' && !declared.has(ref)) {
        problems.push(`${id}: parent "${ref}" is not declared before it`)
      }
    }
    declared.add(id)
  }
  for (const cell of cells) {
    for (const attr of ['source', 'target']) {
      const ref = cell.getAttribute(attr)
      if (ref !== null && !declared.has(ref)) problems.push(`${cell.getAttribute('id')}: ${attr} "${ref}" is not declared`)
    }
  }
  expect(problems).toEqual([])
}

describe('toDrawioXml', () => {
  const xml = toDrawioXml(layout, cleanLight, 'Order flow')

  it('decodes: usable ids, resolving references, containers first', () => {
    expectDecodable(xml)
  })

  it('declares an outer group before the group nested inside it', () => {
    // The layout lists groups innermost-first, so the file used to name
    // "platform" as a parent two lines before declaring it. draw.io dropped the
    // cell and the whole import failed.
    const nested: LaidOutDiagram = {
      ...layout,
      ir: {
        ...ir,
        nodes: [{ ...ir.nodes[1]!, groupId: 'data' }],
        edges: [],
        groups: [
          { id: 'data', label: 'Data', parentId: 'platform', childNodeIds: ['api'] },
          { id: 'platform', label: 'Platform', childNodeIds: [] },
        ],
      },
      nodes: [{ id: 'api', x: 80, y: 160, width: 100, height: 40 }],
      edges: [],
      groups: [
        { id: 'data', x: 60, y: 140, width: 160, height: 90 },
        { id: 'platform', x: 40, y: 120, width: 200, height: 140 },
      ],
    }
    const xml = toDrawioXml(nested, cleanLight)
    expectDecodable(xml)
    expect(xml.indexOf('id="platform"')).toBeLessThan(xml.indexOf('id="data"'))
  })

  it('is a well-formed mxfile that names the diagram', () => {
    expect(xml.startsWith('<mxfile')).toBe(true)
    expect(xml).toContain('<diagram id="mermaid-plus" name="Order flow">')
    expect(xml).toContain('<mxCell id="0" />')
    expect(xml).toContain('<mxCell id="1" parent="0" />')
    expect(xml.trimEnd().endsWith('</mxfile>')).toBe(true)
    // No stray unescaped markup from labels.
    expectWellFormed(xml)
  })

  it('emits vertices with geometry and theme colours', () => {
    expect(xml).toMatch(/<mxCell id="client"[^>]*vertex="1"/)
    expect(xml).toContain(`fillColor=${cleanLight.color.archetype.user.fill}`)
    expect(xml).toContain('<mxGeometry x="40" y="20" width="120" height="40" as="geometry" />')
  })

  it('maps archetypes to draw.io shapes rather than plain boxes', () => {
    expect(xml).toMatch(/id="db"[^>]*shape=cylinder3/)
    expect(xml).toMatch(/id="client"[^>]*arcSize=50/)
  })

  it('nests grouped nodes and makes their geometry parent-relative', () => {
    expect(xml).toMatch(/id="backend"[^>]*container=1/)
    expect(xml).toMatch(/<mxCell id="api"[^>]*parent="backend"/)
    // api is at 60,140 absolute; the group starts at 40,120.
    expect(xml).toContain('<mxGeometry x="20" y="20" width="100" height="40" as="geometry" />')
  })

  it('emits edges that connect real cells, with labels and arrow ends', () => {
    expect(xml).toMatch(/<mxCell id="client-_api"[^>]*edge="1"[^>]*source="client" target="api"/)
    expect(xml).toContain('value="HTTPS"')
    expect(xml).toContain('endArrow=classic;endFill=1;')
    // ER cardinalities survive as draw.io's own crow's-foot arrows.
    expect(xml).toContain('startArrow=ERone;')
    expect(xml).toContain('endArrow=ERzeroToMany;')
    expect(xml).toContain('dashPattern=1 3;')
  })

  it('escapes label markup so a diagram cannot break the file', () => {
    // Two decodes stand between the file and the reader: the XML parser, then
    // draw.io's HTML label renderer. A literal angle bracket has to survive
    // both, so it is encoded once for each.
    expect(xml).toContain('Browser &amp;lt;Client&amp;gt;')
    expect(xml).not.toContain('<Client>')
    expect(xml).not.toContain('value="Browser &lt;Client&gt;"')
  })

  it('keeps <br> line breaks as draw.io HTML labels, encoded for the attribute', () => {
    const multi = toDrawioXml({ ...layout, ir: { ...ir, nodes: [{ ...ir.nodes[0]!, label: 'Two<br/>lines' }, ...ir.nodes.slice(1)] } }, cleanLight)
    // Markup inside an XML attribute has to be encoded; a raw `<` here is what
    // made draw.io refuse the file on import.
    expect(multi).toContain('Two&lt;br&gt;lines')
    expect(multi).not.toContain('value="Two<br>lines"')
    expectWellFormed(multi)
  })

  it('turns newline-wrapped labels into breaks too', () => {
    const multi = toDrawioXml({ ...layout, ir: { ...ir, nodes: [{ ...ir.nodes[0]!, label: 'Two\nlines' }, ...ir.nodes.slice(1)] } }, cleanLight)
    expect(multi).toContain('Two&lt;br&gt;lines')
    expectWellFormed(multi)
  })

  it('flattens class compartments into one labelled box with rules', () => {
    const withCompartments = toDrawioXml({
      ...layout,
      ir: { ...ir, nodes: [{ ...ir.nodes[0]!, compartments: [['Order'], ['+id'], ['+place()']] }, ...ir.nodes.slice(1)] },
    }, cleanLight)
    expect(withCompartments).toContain('Order&lt;hr size=&quot;1&quot;&gt;+id&lt;hr size=&quot;1&quot;&gt;+place()')
    // The rule's own quotes closed the value attribute early before this.
    expectWellFormed(withCompartments)
  })

  it('stays well-formed with labels made of nothing but hostile characters', () => {
    const hostile = '<hr size="1"> & \'quote\' <script>alert(1)</script>'
    const xml = toDrawioXml({
      ...layout,
      ir: {
        ...ir,
        nodes: [{ ...ir.nodes[0]!, label: hostile }, ...ir.nodes.slice(1)],
        edges: ir.edges.map((e) => ({ ...e, label: hostile })),
        groups: ir.groups.map((g) => ({ ...g, label: hostile })),
      },
    }, cleanLight, hostile)
    expectWellFormed(xml)
    expect(xml).not.toContain('<script>')
  })
})
