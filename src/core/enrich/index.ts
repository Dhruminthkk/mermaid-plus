import type { DiagramIR, IREdge, IRNode } from '@/core/ir'
import { inferArchetype, isArchetype } from './archetype'
import { ARCHETYPE_ICONS } from '@/core/icons/registry'
import { inferIcon } from './icon'

export { inferArchetype, isArchetype } from './archetype'
export { inferIcon } from './icon'

const NODE_RESERVED = new Set(['archetype', 'icon'])

export function enrich(ir: DiagramIR): DiagramIR {
  if (ir.tier === 2) return ir

  const nodeDirectives = new Map(
    ir.directives.filter((d) => d.target === 'node' && d.subject !== undefined).map((d) => [d.subject!, d.attrs]),
  )
  const edgeDirectives = new Map(
    ir.directives.filter((d) => d.target === 'edge' && d.subject !== undefined).map((d) => [d.subject!, d.attrs]),
  )

  const nodes: IRNode[] = ir.nodes.map((node) => {
    const attrs = nodeDirectives.get(node.id) ?? {}
    const declared = attrs['archetype']

    const meta = { ...node.meta }
    for (const [key, value] of Object.entries(attrs)) {
      if (!NODE_RESERVED.has(key)) meta[key] = value
    }

    // Adapters for state, C4 and friends assign meaning we must not second-guess,
    // and an entity's own name is not a hint about what it is: a class called
    // Payment is not a queue, an ER table called CUSTOMER is not a person.
    const adapterAssigned = node.archetype !== 'default'
    const nameless = node.compartments !== undefined
    const archetype =
      declared !== undefined && isArchetype(declared) ? declared
      : adapterAssigned || nameless ? node.archetype
      : inferArchetype({ shapeHint: node.shapeHint, label: node.label })
    // Explicit wins, then the technology the label names, then the archetype's glyph.
    const inferred = nameless ? undefined : inferIcon(node.label)
    const requested = attrs['icon'] ?? node.icon ?? inferred ?? ARCHETYPE_ICONS[archetype]
    const icon = requested === 'none' ? undefined : requested

    return icon === undefined
      ? { ...node, archetype, icon: undefined, meta }
      : { ...node, archetype, icon, meta }
  })

  const EDGE_RESERVED = new Set(['semantics'])
  const edges: IREdge[] = ir.edges.map((edge) => {
    const attrs = edgeDirectives.get(`${edge.source}->${edge.target}`) ?? {}
    if (Object.keys(attrs).length === 0) return edge
    const declared = attrs['semantics']
    const meta = { ...edge.meta }
    for (const [key, value] of Object.entries(attrs)) {
      if (!EDGE_RESERVED.has(key)) meta[key] = value
    }
    return {
      ...edge,
      semantics: declared === undefined ? edge.semantics : (declared as IREdge['semantics']),
      meta,
    }
  })

  return { ...ir, nodes, edges }
}
