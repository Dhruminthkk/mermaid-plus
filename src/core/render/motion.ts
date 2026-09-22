import type { DiagramIR, IREdge } from '@/core/ir'
import { layoutAttrs } from '@/core/layout'

/** Which edges carry a travelling highlight. */
export type FlowPolicy = 'auto' | 'all' | 'none'

/** Total stagger is capped so a 200-node diagram does not take four seconds to arrive. */
export const MAX_STAGGER_STEPS = 24

export function staggerIndex(index: number): number {
  return Math.min(index, MAX_STAGGER_STEPS)
}

/** `%%mp: layout motion=off` stills the diagram; everything else animates. */
export function motionEnabled(ir: DiagramIR): boolean {
  return layoutAttrs(ir)['motion'] !== 'off'
}

/**
 * Every edge flows unless the diagram says otherwise. `%%mp: layout flow=auto`
 * narrows it to the broken lines; `flow=none` stills them all.
 */
export function flowPolicy(ir: DiagramIR): FlowPolicy {
  const declared = layoutAttrs(ir)['flow']
  return declared === 'auto' || declared === 'none' ? declared : 'all'
}

/** `%%mp: edge a->b flow` (or `flow=false`) beats the diagram-wide policy. */
export function edgeFlows(edge: IREdge, policy: FlowPolicy): boolean {
  const declared = edge.meta?.['flow']
  if (declared !== undefined) return declared !== 'false' && declared !== 'off'
  if (policy === 'none') return false
  if (policy === 'all') return true
  // 'auto': a broken line already says "indirect" in Mermaid's own vocabulary,
  // so the highlight reinforces a meaning the author has already written.
  return edge.semantics === 'async' || edge.style === 'dashed' || edge.style === 'dotted'
}


/**
 * When each edge's highlight runs, so a pulse walks the graph instead of every
 * line shimmering at once.
 *
 * An edge's layer is how far its source node sits from an entry point, so the
 * pulse leaves the entry nodes, arrives, and only then sets off again — the
 * order a reader would trace the diagram in.
 */
export interface FlowTiming {
  /** Layer per edge id: its slot in the cycle. */
  layers: Map<string, number>
  /** How many slots the cycle has. */
  count: number
  /** Whole cycle, seconds. */
  cycleSeconds: number
  /** One slot as a percentage of the cycle — the moving part of the keyframes. */
  slicePercent: number
}

/** Kept between "alive" and "waiting for it": deep graphs step faster. */
const SECONDS_PER_LAYER = 0.75
const MIN_CYCLE_SECONDS = 2.4
const MAX_CYCLE_SECONDS = 9

export function flowTiming(ir: DiagramIR): FlowTiming {
  const incoming = new Map<string, number>()
  for (const node of ir.nodes) incoming.set(node.id, 0)
  for (const edge of ir.edges) incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1)

  const out = new Map<string, string[]>()
  for (const edge of ir.edges) {
    const list = out.get(edge.source)
    if (list) list.push(edge.target)
    else out.set(edge.source, [edge.target])
  }

  // Entry points first. A graph that is all cycles has none, so everything
  // starts together rather than not at all.
  const depth = new Map<string, number>()
  const queue = ir.nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0).map((n) => n.id)
  for (const id of queue) depth.set(id, 0)
  for (let head = 0; head < queue.length; head++) {
    const id = queue[head]!
    const next = (depth.get(id) ?? 0) + 1
    for (const target of out.get(id) ?? []) {
      if (depth.has(target)) continue
      depth.set(target, next)
      queue.push(target)
    }
  }

  const layers = new Map<string, number>()
  let max = 0
  for (const edge of ir.edges) {
    const layer = depth.get(edge.source) ?? 0
    layers.set(edge.id, layer)
    if (layer > max) max = layer
  }

  const count = max + 1
  const cycleSeconds = Math.min(Math.max(count * SECONDS_PER_LAYER, MIN_CYCLE_SECONDS), MAX_CYCLE_SECONDS)
  return { layers, count, cycleSeconds, slicePercent: Math.round((100 / count) * 10) / 10 }
}
