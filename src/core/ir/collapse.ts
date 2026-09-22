import type { DiagramIR, IREdge, IRGroup, IRNode } from './types'

/** Group ids marked `%%mp: group <id> collapsed` in the source. */
export function directiveCollapsedGroups(ir: DiagramIR): Set<string> {
  const out = new Set<string>()
  for (const d of ir.directives) {
    if (d.target === 'group' && d.subject && d.attrs['collapsed'] === 'true') out.add(d.subject)
  }
  return out
}

/**
 * Collapses groups to single nodes. Members and nested groups disappear; edges
 * crossing the boundary re-attach to the collapsed node, edges between the
 * same pair bundle into one carrying `meta.weight`, and edges fully inside
 * vanish. Groups nested inside a collapsed group are absorbed by it.
 */
export function collapseGroups(ir: DiagramIR, collapsed: ReadonlySet<string>): DiagramIR {
  if (collapsed.size === 0 || ir.groups.length === 0) return ir

  const groupById = new Map(ir.groups.map((g) => [g.id, g]))
  const parentOf = (id: string): string | undefined => groupById.get(id)?.parentId

  /** Outermost collapsed ancestor (or self) of a group, if any. */
  const collapsedRoot = (groupId: string | undefined): string | undefined => {
    let found: string | undefined
    let cursor = groupId
    while (cursor !== undefined) {
      if (collapsed.has(cursor)) found = cursor
      cursor = parentOf(cursor)
    }
    return found
  }

  const nodeTarget = new Map<string, string>() // original node id → surviving id
  const memberCount = new Map<string, number>()
  const nodes: IRNode[] = []
  for (const node of ir.nodes) {
    const root = collapsedRoot(node.groupId)
    if (root === undefined) {
      nodes.push(node)
      nodeTarget.set(node.id, node.id)
    } else {
      nodeTarget.set(node.id, root)
      memberCount.set(root, (memberCount.get(root) ?? 0) + 1)
    }
  }

  const groups: IRGroup[] = []
  for (const group of ir.groups) {
    const root = collapsedRoot(group.id)
    if (root === undefined) {
      groups.push({ ...group, childNodeIds: group.childNodeIds.filter((id) => nodeTarget.get(id) === id) })
    } else if (root === group.id) {
      // The collapsed group itself becomes a node inside its (surviving) parent.
      const parent = collapsedRoot(group.parentId) === undefined ? group.parentId : undefined
      const collapsedNode: IRNode = {
        id: group.id,
        label: group.label ?? group.id,
        archetype: 'process',
        shapeHint: 'collapsed',
        meta: { collapsed: 'true', members: String(memberCount.get(group.id) ?? 0) },
      }
      if (parent !== undefined) collapsedNode.groupId = parent
      nodes.push(collapsedNode)
      nodeTarget.set(group.id, group.id)
      if (parent !== undefined) {
        const survivingParent = groups.find((g) => g.id === parent) ?? ir.groups.find((g) => g.id === parent)
        if (survivingParent && !groups.includes(survivingParent)) groups.push({ ...survivingParent, childNodeIds: [...survivingParent.childNodeIds] })
        const target = groups.find((g) => g.id === parent)
        if (target && !target.childNodeIds.includes(group.id)) target.childNodeIds = [...target.childNodeIds, group.id].sort()
      }
    }
    // Groups nested inside a collapsed root are absorbed.
  }
  // Edges may also target groups directly (composite states); map those too.
  for (const group of ir.groups) {
    if (!nodeTarget.has(group.id)) nodeTarget.set(group.id, collapsedRoot(group.id) ?? group.id)
  }

  const bundled = new Map<string, IREdge>()
  for (const edge of ir.edges) {
    const source = nodeTarget.get(edge.source) ?? edge.source
    const target = nodeTarget.get(edge.target) ?? edge.target
    if (source === target && (source !== edge.source || target !== edge.target)) continue // fully inside
    const rerouted = source !== edge.source || target !== edge.target
    const key = rerouted ? `${source}->${target}` : edge.id
    const existing = bundled.get(key)
    if (existing && rerouted) {
      const weight = Number(existing.meta?.['weight'] ?? 1) + 1
      bundled.set(key, { ...existing, label: `×${weight}`, style: 'thick', meta: { ...existing.meta, weight: String(weight) } })
    } else {
      bundled.set(key, rerouted ? { ...edge, id: key, source, target, meta: { ...edge.meta, weight: '1', rerouted: 'true' } } : edge)
    }
  }

  const uniqueGroups = Array.from(new Map(groups.map((g) => [g.id, g])).values())
  return { ...ir, nodes, groups: uniqueGroups, edges: Array.from(bundled.values()) }
}
