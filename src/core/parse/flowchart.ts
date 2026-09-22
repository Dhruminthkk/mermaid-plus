import type { DiagramIR, EdgeSemantics, EdgeStyle, FlowDirection, IREdge, IRGroup, IRNode } from '@/core/ir'
import { getFlowchartDb, type FlowchartDb } from './mermaid-adapter'

function flowDirection(raw: string | undefined): FlowDirection {
  switch ((raw ?? '').toUpperCase()) {
    case 'LR':
      return 'LR'
    case 'BT':
      return 'BT'
    case 'RL':
      return 'RL'
    default:
      return 'TB' // TB, TD, and anything unrecognized
  }
}

function edgeStyle(stroke: string | undefined): EdgeStyle {
  switch (stroke) {
    case 'dotted':
      return 'dotted'
    case 'thick':
      return 'thick'
    default:
      return 'solid'
  }
}

function edgeSemantics(type: string | undefined): EdgeSemantics {
  return type?.startsWith('double_') ? 'bidirectional' : 'flow'
}

export function dbToIR(db: FlowchartDb, raw: string): Omit<DiagramIR, 'directives'> {
  // A subgraph lists its nested subgraphs among its `nodes`; that is the only
  // place mermaid records the hierarchy.
  const subgraphIds = new Set(db.subGraphs.map((s) => s.id))
  const parentOf = new Map<string, string>()
  for (const sub of db.subGraphs) {
    for (const child of sub.nodes) {
      if (subgraphIds.has(child)) parentOf.set(child, sub.id)
    }
  }

  const groups: IRGroup[] = db.subGraphs.map((sub) => ({
    id: sub.id,
    label: sub.title?.trim() || sub.id,
    parentId: parentOf.get(sub.id),
    childNodeIds: sub.nodes.filter((n) => !subgraphIds.has(n)).sort(),
  }))

  const groupOfNode = new Map<string, string>()
  for (const group of groups) {
    for (const child of group.childNodeIds) {
      if (!groupOfNode.has(child)) groupOfNode.set(child, group.id)
    }
  }

  const nodes: IRNode[] = db.vertices.map((vertex) => ({
    id: vertex.id,
    label: vertex.text?.trim() || vertex.id,
    archetype: 'default',
    groupId: groupOfNode.get(vertex.id),
    shapeHint: vertex.type,
    meta: {},
  }))

  const nodeIds = new Set(nodes.map((n) => n.id))
  for (const group of groups) {
    group.childNodeIds = group.childNodeIds.filter((id) => nodeIds.has(id))
  }

  const seen = new Map<string, number>()
  const edges: IREdge[] = db.edges
    // `~~~` links exist only to nudge mermaid's own layout; they carry no meaning.
    .filter((edge) => edge.stroke !== 'invisible')
    .map((edge) => {
      const key = `${edge.start}->${edge.end}`
      const ordinal = seen.get(key) ?? 0
      seen.set(key, ordinal + 1)
      return {
        id: ordinal === 0 ? key : `${key}#${ordinal}`,
        source: edge.start,
        target: edge.end,
        label: edge.text?.trim() || undefined,
        semantics: edgeSemantics(edge.type),
        style: edgeStyle(edge.stroke),
      }
    })

  return { kind: 'flowchart', tier: 1, direction: flowDirection(db.direction), nodes, edges, groups, raw }
}

export async function parseFlowchart(source: string): Promise<Omit<DiagramIR, 'directives'>> {
  return dbToIR(await getFlowchartDb(source), source)
}
