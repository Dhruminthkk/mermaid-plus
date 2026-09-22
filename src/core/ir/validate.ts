import type { DiagramIR } from './types'

export function validateIR(ir: DiagramIR): string[] {
  const problems: string[] = []

  const nodeIds = new Set<string>()
  for (const node of ir.nodes) {
    if (nodeIds.has(node.id)) problems.push(`duplicate node id "${node.id}"`)
    nodeIds.add(node.id)
  }

  const groupIds = new Set(ir.groups.map((g) => g.id))

  for (const node of ir.nodes) {
    if (node.groupId !== undefined && !groupIds.has(node.groupId)) {
      problems.push(`node ${node.id} belongs to unknown group "${node.groupId}"`)
    }
  }

  // Edges may terminate on groups (composite states, C4 boundaries); ELK routes
  // those to the group border.
  const endpointIds = new Set([...nodeIds, ...groupIds])
  for (const edge of ir.edges) {
    if (!endpointIds.has(edge.source)) {
      problems.push(`edge ${edge.id} sources unknown node "${edge.source}"`)
    }
    if (!endpointIds.has(edge.target)) {
      problems.push(`edge ${edge.id} targets unknown node "${edge.target}"`)
    }
  }

  const parentOf = new Map(ir.groups.map((g) => [g.id, g.parentId]))
  const inReportedCycle = new Set<string>()
  for (const group of ir.groups) {
    if (inReportedCycle.has(group.id)) continue
    const seen = new Set<string>([group.id])
    let cursor = parentOf.get(group.id)
    while (cursor !== undefined) {
      if (seen.has(cursor)) {
        problems.push(`group hierarchy contains a cycle at "${group.id}"`)
        for (const id of seen) inReportedCycle.add(id) // report each cycle once
        break
      }
      seen.add(cursor)
      cursor = parentOf.get(cursor)
    }
  }

  return problems
}
