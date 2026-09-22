import type { Archetype, DiagramIR, EdgeSemantics, EdgeStyle } from '@/core/ir'

export interface Connection {
  edgeId: string
  /** The node at the other end. */
  nodeId: string
  label: string
  edgeLabel?: string
  semantics: EdgeSemantics
}

export interface NodeDetail {
  kind: 'node'
  id: string
  label: string
  archetype: Archetype
  /** Prose the author attached with `%%mp: node <id> note="…"`. */
  note?: string
  groupLabel?: string
  /** Stacked sections for class, ER, requirement and C4 nodes. */
  compartments?: string[][]
  /** Everything else the author attached, minus what is shown elsewhere. */
  meta: Array<[string, string]>
  incoming: Connection[]
  outgoing: Connection[]
  sourceLine?: number
  collapsedMembers?: number
}

export interface EdgeDetail {
  kind: 'edge'
  id: string
  label?: string
  note?: string
  fromLabel: string
  toLabel: string
  semantics: EdgeSemantics
  style: EdgeStyle
  meta: Array<[string, string]>
}

export interface GroupDetail {
  kind: 'group'
  id: string
  label: string
  memberLabels: string[]
  collapsed: boolean
  note?: string
}

export type Detail = NodeDetail | EdgeDetail | GroupDetail

/** Attributes shown as their own thing, so they are not repeated as raw metadata. */
const PRESENTED = new Set(['note', 'collapsed', 'members', 'weight', 'rerouted', 'section', 'level', 'mermaidIcon'])

function metaPairs(meta: Record<string, string> | undefined): Array<[string, string]> {
  return Object.entries(meta ?? {}).filter(([key]) => !PRESENTED.has(key)).sort(([a], [b]) => (a < b ? -1 : 1))
}

export function describeNode(
  ir: DiagramIR,
  id: string,
  options: { sourceLine?: number; collapsed?: boolean } = {},
): NodeDetail | null {
  const node = ir.nodes.find((n) => n.id === id)
  if (!node) return null
  const labelOf = (nodeId: string) => ir.nodes.find((n) => n.id === nodeId)?.label
    ?? ir.groups.find((g) => g.id === nodeId)?.label
    ?? nodeId

  const connection = (edgeId: string, other: string, edgeLabel: string | undefined, semantics: EdgeSemantics): Connection => {
    const c: Connection = { edgeId, nodeId: other, label: labelOf(other), semantics }
    return edgeLabel ? { ...c, edgeLabel } : c
  }

  const detail: NodeDetail = {
    kind: 'node',
    id: node.id,
    label: node.label || node.id,
    archetype: node.archetype,
    meta: metaPairs(node.meta),
    incoming: ir.edges.filter((e) => e.target === id).map((e) => connection(e.id, e.source, e.label, e.semantics)),
    outgoing: ir.edges.filter((e) => e.source === id).map((e) => connection(e.id, e.target, e.label, e.semantics)),
  }
  const note = node.meta['note']
  if (note) detail.note = note
  const group = node.groupId ? ir.groups.find((g) => g.id === node.groupId) : undefined
  if (group) detail.groupLabel = group.label ?? group.id
  if (node.compartments) detail.compartments = node.compartments
  if (options.sourceLine !== undefined) detail.sourceLine = options.sourceLine
  const members = Number(node.meta['members'])
  if (Number.isFinite(members) && members > 0) detail.collapsedMembers = members
  return detail
}

export function describeEdge(ir: DiagramIR, id: string): EdgeDetail | null {
  const edge = ir.edges.find((e) => e.id === id)
  if (!edge) return null
  const labelOf = (nodeId: string) => ir.nodes.find((n) => n.id === nodeId)?.label
    ?? ir.groups.find((g) => g.id === nodeId)?.label
    ?? nodeId

  const detail: EdgeDetail = {
    kind: 'edge',
    id: edge.id,
    fromLabel: labelOf(edge.source),
    toLabel: labelOf(edge.target),
    semantics: edge.semantics,
    style: edge.style,
    meta: metaPairs(edge.meta),
  }
  if (edge.label) detail.label = edge.label
  const note = edge.meta?.['note']
  if (note) detail.note = note
  return detail
}

export function describeGroup(ir: DiagramIR, id: string, collapsed: boolean): GroupDetail | null {
  const group = ir.groups.find((g) => g.id === id)
  if (!group) return null
  const detail: GroupDetail = {
    kind: 'group',
    id: group.id,
    label: group.label ?? group.id,
    memberLabels: group.childNodeIds.map((child) => ir.nodes.find((n) => n.id === child)?.label ?? child),
    collapsed,
  }
  const note = ir.directives.find((d) => d.target === 'group' && d.subject === id)?.attrs['note']
  if (note) detail.note = note
  return detail
}

/** Ids to keep bright when a node is hovered: itself, its edges and its neighbours. */
export function neighbourhoodOf(ir: DiagramIR, id: string): { nodes: Set<string>; edges: Set<string> } {
  const nodes = new Set<string>([id])
  const edges = new Set<string>()
  for (const edge of ir.edges) {
    if (edge.source === id) {
      edges.add(edge.id)
      nodes.add(edge.target)
    } else if (edge.target === id) {
      edges.add(edge.id)
      nodes.add(edge.source)
    }
  }
  return { nodes, edges }
}
