import type { ArrowKind, DiagramIR, EdgeSemantics, EdgeStyle, FlowDirection, IREdge, IRGroup, IRNode, Tier1Kind } from '@/core/ir'
import type { RawDataEdge, RawDataNode, UnifiedDb } from './mermaid-adapter'

type UnifiedKind = Extract<Tier1Kind, 'state' | 'class' | 'er' | 'requirement' | 'mindmap'>

function flowDirection(raw: string | undefined): FlowDirection {
  switch ((raw ?? '').toUpperCase()) {
    case 'LR': return 'LR'
    case 'BT': return 'BT'
    case 'RL': return 'RL'
    default: return 'TB'
  }
}

/** mermaid stores labels HTML-escaped and with jison backslash escapes. */
export function cleanText(text: string | undefined): string {
  return (text ?? '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/<<([^>]+)>>/g, '«$1»')
    .replace(/\\([+\-#~<>()])/g, '$1')
    .trim()
}

const ARROWS: Record<string, ArrowKind> = {
  arrow_point: 'arrow', arrow_barb: 'arrow', requirement_arrow: 'arrow', normal: 'arrow',
  extension: 'triangle-open', composition: 'diamond-filled', aggregation: 'diamond-open',
  dependency: 'arrow-open', lollipop: 'arrow-open',
  only_one: 'one', zero_or_one: 'zero-or-one', one_or_more: 'one-or-more', zero_or_more: 'zero-or-more',
  many: 'many', md_parent: 'one',
}

function arrowKind(raw: string | undefined): ArrowKind | undefined {
  if (!raw || raw === 'none') return undefined
  return ARROWS[raw]
}

function semanticsFor(start: ArrowKind | undefined, end: ArrowKind | undefined, kind: UnifiedKind): EdgeSemantics {
  const kinds = [start, end]
  if (kinds.includes('triangle-open')) return 'inheritance'
  if (kinds.includes('diamond-filled') || kinds.includes('diamond-open')) return 'composition'
  if (kinds.includes('arrow-open')) return 'dependency'
  if (kind === 'class' || kind === 'er') return 'association'
  return 'flow'
}

function edgeStyle(edge: RawDataEdge): EdgeStyle {
  if (edge.thickness === 'thick') return 'thick'
  switch (edge.pattern) {
    case 'dotted': return 'dotted'
    case 'dashed': return 'dashed'
    default: return 'solid'
  }
}

/** Shapes whose label is a mermaid-internal id, not user text. */
const SILENT_SHAPES = new Set(['stateStart', 'stateEnd', 'fork', 'join', 'choice'])

function compartmentsFor(node: RawDataNode, kind: UnifiedKind): string[][] | undefined {
  switch (node.shape) {
    case 'classBox': {
      const header = [...(node.annotations ?? []).map((a) => `«${cleanText(a)}»`), cleanText(node.label)]
      const members = (node.members ?? []).map((m) => cleanText(m.text))
      const methods = (node.methods ?? []).map((m) => cleanText(m.text))
      return [header, members, methods]
    }
    case 'erBox': {
      const rows = (node.attributes ?? []).map((a) =>
        [a.type, a.name, a.keys && a.keys.length > 0 ? a.keys.join(',') : ''].filter(Boolean).join(' '),
      )
      return [[cleanText(node.label)], rows]
    }
    case 'requirementBox': {
      const name = cleanText(node.name ?? node.label)
      if (node.requirementId !== undefined) {
        const fields = [
          `Id: ${node.requirementId}`,
          node.text ? `Text: ${cleanText(node.text)}` : '',
          node.risk ? `Risk: ${node.risk}` : '',
          node.verifyMethod ? `Verify: ${node.verifyMethod}` : '',
        ].filter(Boolean)
        return [[`«${node.type ?? 'Requirement'}»`, name], fields]
      }
      return [[`«${node.type ?? 'Element'}»`, name], node.docRef ? [`Doc: ${node.docRef}`] : []]
    }
    default:
      return kind === 'class' && node.members ? [[cleanText(node.label)], node.members.map((m) => cleanText(m.text))] : undefined
  }
}

export function unifiedToIR(kind: UnifiedKind, db: UnifiedDb, raw: string): Omit<DiagramIR, 'directives'> {
  // Note wrappers are a mermaid layout trick; dissolve them so the note is a sibling.
  const wrapperParent = new Map<string, string | undefined>()
  for (const n of db.nodes) if (n.isGroup && n.shape === 'noteGroup') wrapperParent.set(n.id, n.parentId)
  const resolveParent = (id: string | undefined): string | undefined =>
    id !== undefined && wrapperParent.has(id) ? resolveParent(wrapperParent.get(id)) : id

  const groups: IRGroup[] = db.nodes
    .filter((n) => n.isGroup && n.shape !== 'noteGroup')
    .map((n) => ({ id: n.id, label: cleanText(n.label) || undefined, parentId: resolveParent(n.parentId), childNodeIds: [] }))
  const groupIds = new Set(groups.map((g) => g.id))

  const nodes: IRNode[] = db.nodes
    .filter((n) => !n.isGroup)
    .map((n) => {
      const groupId = resolveParent(n.parentId)
      const compartments = compartmentsFor(n, kind)
      const label = SILENT_SHAPES.has(n.shape ?? '') ? '' : cleanText(n.label)
      const meta: Record<string, string> = {}
      if (n.section !== undefined) meta['section'] = String(n.section)
      if (n.level !== undefined) meta['level'] = String(n.level)
      if (n.icon) meta['mermaidIcon'] = n.icon
      const node: IRNode = {
        id: n.id,
        label: compartments ? (compartments[0]?.[compartments[0].length - 1] ?? label) : label,
        archetype: n.shape === 'note' ? 'note' : 'default',
        shapeHint: n.shape,
        meta,
      }
      if (groupId !== undefined && groupIds.has(groupId)) node.groupId = groupId
      if (compartments) node.compartments = compartments
      return node
    })

  for (const node of nodes) {
    if (node.groupId) groups.find((g) => g.id === node.groupId)?.childNodeIds.push(node.id)
  }
  for (const g of groups) g.childNodeIds.sort()

  const seen = new Map<string, number>()
  const edges: IREdge[] = db.edges.map((e) => {
    const key = `${e.start}->${e.end}`
    const ordinal = seen.get(key) ?? 0
    seen.set(key, ordinal + 1)
    const arrowStart = arrowKind(e.arrowTypeStart)
    const arrowEnd = arrowKind(e.arrowTypeEnd)
    const edge: IREdge = {
      id: ordinal === 0 ? key : `${key}#${ordinal}`,
      source: e.start,
      target: e.end,
      semantics: kind === 'mindmap' ? 'association' : semanticsFor(arrowStart, arrowEnd, kind),
      style: edgeStyle(e),
    }
    const label = cleanText(e.label)
    if (label) edge.label = label
    // Class/ER lines have no implicit head: an explicit "none" on both ends means none.
    if (kind === 'class' || kind === 'er' || kind === 'mindmap') {
      edge.arrowStart = arrowStart ?? 'none'
      edge.arrowEnd = arrowEnd ?? 'none'
    } else {
      if (arrowStart) edge.arrowStart = arrowStart
      if (arrowEnd) edge.arrowEnd = arrowEnd
    }
    if (e.startLabelRight) edge.labelStart = cleanText(e.startLabelRight)
    if (e.endLabelLeft) edge.labelEnd = cleanText(e.endLabelLeft)
    return edge
  })

  const base: Omit<DiagramIR, 'directives'> = {
    kind,
    tier: 1,
    direction: kind === 'mindmap' ? 'LR' : flowDirection(db.direction),
    nodes,
    edges,
    groups,
    raw,
  }
  if (kind === 'mindmap') base.layout = { algorithm: 'mrtree', edgeRouting: 'POLYLINE' }
  return base
}
