import type { Archetype, DiagramIR, IREdge, IRGroup, IRNode } from '@/core/ir'
import type { C4Db } from './mermaid-adapter'
import { cleanText } from './unified'

const C4_ARCHETYPES: Record<string, Archetype> = {
  person: 'user', external_person: 'user',
  system: 'service', external_system: 'external',
  system_db: 'database', external_system_db: 'database',
  system_queue: 'queue', external_system_queue: 'queue',
  container: 'service', external_container: 'external',
  container_db: 'database', external_container_db: 'database',
  container_queue: 'queue', external_container_queue: 'queue',
  component: 'process', external_component: 'external',
  component_db: 'database', component_queue: 'queue',
  node: 'storage', deployment_node: 'storage',
}

function pretty(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function c4ToIR(db: C4Db, raw: string): Omit<DiagramIR, 'directives'> {
  const groups: IRGroup[] = db.boundaries
    .filter((b) => b.alias !== 'global')
    .map((b) => ({
      id: b.alias,
      label: cleanText(b.label?.text) || b.alias,
      parentId: b.parentBoundary && b.parentBoundary !== 'global' ? b.parentBoundary : undefined,
      childNodeIds: [],
    }))
  const groupIds = new Set(groups.map((g) => g.id))

  const nodes: IRNode[] = db.shapes.map((s) => {
    const type = s.typeC4Shape?.text ?? 'system'
    const label = cleanText(s.label?.text) || s.alias
    const descr = cleanText(s.descr?.text)
    const techn = cleanText(s.techn?.text)
    const header = [`«${pretty(type)}»`, label]
    const body = [techn ? `[${techn}]` : '', descr].filter(Boolean)
    const node: IRNode = {
      id: s.alias,
      label,
      archetype: C4_ARCHETYPES[type] ?? 'service',
      shapeHint: 'c4',
      compartments: [header, body],
      meta: { c4Type: type },
    }
    if (s.parentBoundary && groupIds.has(s.parentBoundary)) node.groupId = s.parentBoundary
    return node
  })
  for (const node of nodes) if (node.groupId) groups.find((g) => g.id === node.groupId)?.childNodeIds.push(node.id)

  const seen = new Map<string, number>()
  const edges: IREdge[] = db.rels.map((r) => {
    const key = `${r.from}->${r.to}`
    const ordinal = seen.get(key) ?? 0
    seen.set(key, ordinal + 1)
    const label = cleanText(r.label?.text)
    const techn = cleanText(r.techn?.text)
    const edge: IREdge = {
      id: ordinal === 0 ? key : `${key}#${ordinal}`,
      source: r.from,
      target: r.to,
      semantics: r.type === 'birel' ? 'bidirectional' : 'flow',
      style: 'solid',
    }
    const text = techn ? `${label} [${techn}]` : label
    if (text) edge.label = text
    return edge
  })

  return { kind: 'c4', tier: 1, direction: 'TB', nodes, edges, groups, raw }
}
