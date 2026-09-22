import type { Archetype, ArrowKind, EdgeStyle, IREdge, IRNode } from '@/core/ir'
import type { Box, LaidOutDiagram } from '@/core/layout'
import type { Theme } from '@/core/theme'

/**
 * Exports a laid-out diagram as draw.io (mxGraph) XML.
 *
 * draw.io is the interchange format of this corner of the world: diagrams.net
 * opens it natively, and Lucidchart, Confluence and several others import it. It
 * carries real shapes and connections rather than a picture, so the diagram
 * stays editable on the other side — which an SVG never is.
 */

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * A label as the HTML draw.io renders (`html=1` is on every style): the author's
 * text is escaped, and only mermaid's own line breaks become real markup.
 *
 * The result is markup, not attribute content. Writing it straight into
 * `value="…"` puts a raw `<` inside an attribute, which is not well-formed XML —
 * draw.io rejects the whole file on import. `cell` escapes it at the boundary,
 * and draw.io's parser hands the markup back on the other side.
 */
function labelHtml(label: string): string {
  return escapeXml(label)
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/\n/g, '<br>')
}

/** The mxGraph shape that best matches each archetype's geometry. */
const ARCHETYPE_SHAPES: Record<Archetype, string> = {
  database: 'shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=8;',
  queue: 'shape=hexagon;perimeter=hexagonPerimeter2;',
  decision: 'rhombus;',
  note: 'shape=note;size=14;',
  user: 'rounded=1;arcSize=50;',
  external: 'rounded=1;dashed=1;',
  storage: 'rounded=1;',
  service: 'rounded=1;',
  process: 'rounded=1;',
  default: 'rounded=1;',
}

const SHAPE_HINT_SHAPES: Record<string, string> = {
  circle: 'ellipse;',
  doublecircle: 'ellipse;shape=doubleEllipse;',
  stadium: 'rounded=1;arcSize=50;',
  subroutine: 'shape=process;',
  lean_right: 'shape=parallelogram;perimeter=parallelogramPerimeter;',
  lean_left: 'shape=parallelogram;perimeter=parallelogramPerimeter;direction=west;',
  trapezoid: 'shape=trapezoid;perimeter=trapezoidPerimeter;',
  inv_trapezoid: 'shape=trapezoid;perimeter=trapezoidPerimeter;direction=south;',
  stateStart: 'ellipse;fillColor=#000000;',
  stateEnd: 'ellipse;shape=doubleEllipse;fillColor=#000000;',
  fork: 'rounded=0;fillColor=#000000;',
  join: 'rounded=0;fillColor=#000000;',
  choice: 'rhombus;',
}

/** draw.io's own arrow vocabulary, including its ER crow's-foot set. */
const ARROWS: Record<ArrowKind, string> = {
  none: 'none',
  arrow: 'classic',
  'arrow-open': 'open',
  'triangle-open': 'block',
  'diamond-open': 'diamondThin',
  'diamond-filled': 'diamondThin',
  one: 'ERone',
  'zero-or-one': 'ERzeroToOne',
  many: 'ERmany',
  'one-or-more': 'ERoneToMany',
  'zero-or-more': 'ERzeroToMany',
}

function arrowStyle(kind: ArrowKind | undefined, end: 'start' | 'end'): string {
  if (kind === undefined || kind === 'none') return `${end}Arrow=none;`
  const filled = kind === 'diamond-filled' || kind === 'arrow' ? 1 : 0
  return `${end}Arrow=${ARROWS[kind]};${end}Fill=${filled};`
}

const EDGE_PATTERNS: Record<EdgeStyle, string> = {
  solid: '',
  dashed: 'dashed=1;',
  dotted: 'dashed=1;dashPattern=1 3;',
  thick: 'strokeWidth=3;',
}

function nodeStyle(node: IRNode, theme: Theme): string {
  const colors = theme.color.archetype[node.archetype]
  const shape = (node.shapeHint ? SHAPE_HINT_SHAPES[node.shapeHint] : undefined)
    ?? ARCHETYPE_SHAPES[node.archetype]
  return [
    shape,
    'whiteSpace=wrap;html=1;',
    `fillColor=${colors.fill};strokeColor=${colors.stroke};fontColor=${colors.text};`,
    `fontFamily=${theme.type.family.split(',')[0]!.replace(/"/g, '')};fontSize=${theme.type.scale[1]};`,
    node.compartments ? 'verticalAlign=top;align=left;spacingLeft=8;spacingTop=4;' : '',
  ].join('')
}

function edgeStyle(edge: IREdge, theme: Theme): string {
  return [
    theme.edge.routing === 'orthogonal' ? 'edgeStyle=orthogonalEdgeStyle;' : 'edgeStyle=none;',
    'rounded=1;html=1;jettySize=auto;orthogonalLoop=1;',
    `strokeColor=${theme.color.edge};fontColor=${theme.color.textMuted};fontSize=${Math.round(theme.type.scale[1] * 0.9)};`,
    EDGE_PATTERNS[edge.style],
    arrowStyle(edge.arrowStart ?? (edge.semantics === 'bidirectional' ? 'arrow' : 'none'), 'start'),
    arrowStyle(edge.arrowEnd ?? 'arrow', 'end'),
  ].join('')
}

function cell(id: string, value: string, style: string, geometry: string, extra: string): string {
  return `        <mxCell id="${escapeXml(id)}" value="${escapeXml(value)}" style="${escapeXml(style)}" ${extra}>\n${geometry}\n        </mxCell>`
}

function geometryXml(box: Box, indent = '          '): string {
  return `${indent}<mxGeometry x="${Math.round(box.x)}" y="${Math.round(box.y)}" width="${Math.round(box.width)}" height="${Math.round(box.height)}" as="geometry" />`
}

/** Compartment nodes flatten to a single labelled box; draw.io has no stacked sections. */
function nodeValue(node: IRNode): string {
  if (!node.compartments) return labelHtml(node.label)
  return node.compartments
    .filter((section) => section.length > 0)
    .map((section) => section.map(labelHtml).join('<br>'))
    .join('<hr size="1">')
}

/**
 * mxGraph ids, from mermaid ids.
 *
 * An edge id like `a->b` carries characters that have no business in an id that
 * is also written into `parent`, `source` and `target`. Every reference goes
 * through the same map, so the graph still joins up.
 */
function idMapper(): (id: string) => string {
  const seen = new Map<string, string>()
  const taken = new Set(['0', '1'])
  return (id: string) => {
    // The default layer is mxGraph's own id, not a mermaid one.
    if (id === '1') return '1'
    const existing = seen.get(id)
    if (existing !== undefined) return existing
    const base = id.replace(/[^A-Za-z0-9_-]/g, '_').replace(/^$/, 'c') || 'c'
    let candidate = base
    for (let n = 2; taken.has(candidate); n++) candidate = `${base}_${n}`
    taken.add(candidate)
    seen.set(id, candidate)
    return candidate
  }
}

/**
 * Containers before their contents.
 *
 * mxGraph resolves a cell's `parent` as it decodes, so a child that arrives
 * before its container references a cell that does not exist yet. draw.io drops
 * it, which is what made a diagram with a nested subgraph fail to import.
 */
function containersFirst<T extends { id: string }>(items: T[], parentOf: Map<string, string>): T[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  const ordered: T[] = []
  const placed = new Set<string>()
  const place = (item: T, guard: Set<string>) => {
    if (placed.has(item.id) || guard.has(item.id)) return
    guard.add(item.id)
    const parentId = parentOf.get(item.id)
    const parent = parentId === undefined ? undefined : byId.get(parentId)
    if (parent) place(parent, guard)
    if (placed.has(item.id)) return
    placed.add(item.id)
    ordered.push(item)
  }
  for (const item of items) place(item, new Set())
  return ordered
}

export function toDrawioXml(layout: LaidOutDiagram, theme: Theme, title = 'Diagram'): string {
  const mxId = idMapper()
  const nodesById = new Map(layout.ir.nodes.map((n) => [n.id, n]))
  const groupsById = new Map(layout.ir.groups.map((g) => [g.id, g]))
  const boxById = new Map<string, Box>()
  for (const box of [...layout.nodes, ...layout.groups]) boxById.set(box.id, box)

  // draw.io positions children relative to their parent container.
  const parentOf = new Map<string, string>()
  for (const node of layout.ir.nodes) if (node.groupId) parentOf.set(node.id, node.groupId)
  for (const group of layout.ir.groups) if (group.parentId) parentOf.set(group.id, group.parentId)

  const relative = (id: string, box: Box): Box => {
    const parent = parentOf.get(id)
    const parentBox = parent ? boxById.get(parent) : undefined
    return parentBox ? { ...box, x: box.x - parentBox.x, y: box.y - parentBox.y } : box
  }

  const cells: string[] = []

  // Accent by declaration order, not emission order: the tint should match what
  // the diagram shows, and containers are re-ordered below.
  const accentOf = new Map(layout.groups.map((box, index) => [box.id, theme.color.accent[index % theme.color.accent.length]!]))

  // Groups first so they sit behind their members in draw.io's z-order, and
  // outer groups before inner ones so every parent exists when it is referenced.
  for (const box of containersFirst(layout.groups, parentOf)) {
    const group = groupsById.get(box.id)
    if (!group) continue
    const accent = accentOf.get(box.id) ?? theme.color.accent[0]!
    const style = `rounded=1;whiteSpace=wrap;html=1;verticalAlign=top;fillColor=${accent};fillOpacity=10;strokeColor=${accent};strokeOpacity=45;container=1;collapsible=0;fontColor=${accent};fontSize=${Math.round(theme.type.scale[1] * 0.85)};fontStyle=1;`
    cells.push(cell(mxId(box.id), labelHtml(group.label ?? ''), style, geometryXml(relative(box.id, box)),
      `vertex="1" parent="${mxId(parentOf.get(box.id) ?? '1')}"`))
  }

  for (const box of layout.nodes) {
    const node = nodesById.get(box.id)
    if (!node) continue
    cells.push(cell(mxId(box.id), nodeValue(node), nodeStyle(node, theme), geometryXml(relative(box.id, box)),
      `vertex="1" parent="${mxId(parentOf.get(box.id) ?? '1')}"`))
  }

  for (const geometry of layout.edges) {
    const edge = layout.ir.edges.find((e) => e.id === geometry.id)
    if (!edge) continue
    cells.push(cell(mxId(edge.id), labelHtml(edge.label ?? ''), edgeStyle(edge, theme),
      '          <mxGeometry relative="1" as="geometry" />',
      `edge="1" parent="1" source="${mxId(edge.source)}" target="${mxId(edge.target)}"`))
  }

  const width = Math.max(850, Math.ceil(layout.bounds.width))
  const height = Math.max(1100, Math.ceil(layout.bounds.height))
  return `<mxfile host="mermaid-plus" type="device">
  <diagram id="mermaid-plus" name="${escapeXml(title)}">
    <mxGraphModel dx="${width}" dy="${height}" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="0" shadow="0" background="${theme.color.canvas}">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`
}
