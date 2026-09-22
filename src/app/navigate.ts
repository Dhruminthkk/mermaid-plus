import type { LaidOutDiagram, LaidOutNode } from '@/core/layout'

export type Direction = 'up' | 'down' | 'left' | 'right'

const AXIS: Record<Direction, { x: number; y: number }> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
  up: { x: 0, y: -1 },
}

function centre(box: LaidOutNode): { x: number; y: number } {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** Where a reader starts: top-left first, so it matches how the diagram reads. */
export function firstNode(layout: LaidOutDiagram): string | null {
  let best: LaidOutNode | null = null
  for (const box of layout.nodes) {
    if (best === null || box.y + box.x < best.y + best.x) best = box
  }
  return best?.id ?? null
}

/**
 * The connected node that lies furthest in `direction` from `fromId`.
 *
 * Only neighbours count, in either direction along the edge: arrowing around a
 * diagram is for tracing what touches what, and a jump to an unrelated node
 * that merely sits nearby would break that thread. Among the neighbours, the
 * one whose bearing is closest to the requested axis wins, ties going to the
 * nearer one — so Right from a fan-out picks the branch pointing rightwards
 * rather than whichever happened to be declared first.
 */
export function neighbourInDirection(layout: LaidOutDiagram, fromId: string, direction: Direction): string | null {
  const boxes = new Map(layout.nodes.map((n) => [n.id, n]))
  const from = boxes.get(fromId)
  if (!from) return null

  const neighbours = new Set<string>()
  for (const edge of layout.ir.edges) {
    if (edge.source === fromId) neighbours.add(edge.target)
    if (edge.target === fromId) neighbours.add(edge.source)
  }
  neighbours.delete(fromId)

  const origin = centre(from)
  const axis = AXIS[direction]
  let best: { id: string; score: number } | null = null

  for (const id of neighbours) {
    const box = boxes.get(id)
    if (!box) continue
    const to = centre(box)
    const dx = to.x - origin.x
    const dy = to.y - origin.y
    const distance = Math.hypot(dx, dy)
    if (distance === 0) continue
    // cos of the angle between the step and the requested axis: 1 is dead on,
    // 0 is square to it. Anything behind the halfway line is not that way.
    const alignment = (dx * axis.x + dy * axis.y) / distance
    if (alignment <= 0.34) continue
    const score = alignment - distance / 100_000
    if (best === null || score > best.score) best = { id, score }
  }
  return best?.id ?? null
}
