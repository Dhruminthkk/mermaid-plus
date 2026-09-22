import type { Box, LaidOutEdge, LaidOutGroup, LaidOutNode, Point } from './types'
import { pointAlong, polylineLength } from './path'

function boxAt(centre: Point, size: { width: number; height: number }): Box {
  return { x: centre.x - size.width / 2, y: centre.y - size.height / 2, width: size.width, height: size.height }
}

/** Unit normal to the polyline at `distance`, for pushing a label off the line. */
function normalAt(points: Point[], distance: number): Point {
  const step = 2
  const before = pointAlong(points, Math.max(0, distance - step))
  const after = pointAlong(points, distance + step)
  const dx = after.x - before.x
  const dy = after.y - before.y
  const length = Math.hypot(dx, dy) || 1
  return { x: -dy / length, y: dx / length }
}

/** How far into obstacles a candidate box reaches; 0 means clear. */
function penalty(box: Box, obstacles: Box[]): number {
  let total = 0
  for (const obstacle of obstacles) {
    const dx = Math.min(box.x + box.width, obstacle.x + obstacle.width) - Math.max(box.x, obstacle.x)
    const dy = Math.min(box.y + box.height, obstacle.y + obstacle.height) - Math.max(box.y, obstacle.y)
    if (dx > 1 && dy > 1) total += dx * dy
  }
  return total
}

/** Fractions of the edge length to try, nearest the middle first. */
const ALONG = [0, -0.13, 0.13, -0.26, 0.26, -0.38, 0.38]

/**
 * Nudges edge labels that land on a node or on each other. Candidates walk out
 * from the middle of the edge and, failing that, step off the line along its
 * normal — so a label stays attached to the edge it belongs to, which is the
 * whole point of putting it there.
 *
 * Order is by edge id, so the result is the same on every run.
 */
export function resolveLabelCollisions(
  edges: LaidOutEdge[],
  nodes: LaidOutNode[],
  groups: LaidOutGroup[],
): LaidOutEdge[] {
  const labelled = edges.filter((e) => e.labelBox && e.points.length >= 2)
  if (labelled.length === 0) return edges

  // Group boxes are containers, not obstacles: a label inside one is fine.
  const obstacles: Box[] = nodes.map((n) => ({ x: n.x, y: n.y, width: n.width, height: n.height }))
  void groups

  const placed = new Map<string, Box>()
  for (const edge of labelled) {
    const size = { width: edge.labelBox!.width, height: edge.labelBox!.height }
    const length = polylineLength(edge.points)
    const middle = length / 2

    // A label that is already clear stays exactly where placement put it —
    // otherwise this pass would quietly undo 'beside'.
    const original = edge.labelBox!
    if (penalty(original, obstacles) === 0) {
      obstacles.push(original)
      continue
    }

    let best: Box | null = null
    let bestPenalty = Infinity
    for (const fraction of ALONG) {
      const distance = Math.min(length, Math.max(0, middle + fraction * length))
      const anchor = pointAlong(edge.points, distance)
      const normal = normalAt(edge.points, distance)
      for (const side of [0, 1, -1, 2, -2]) {
        const offset = side * (size.height * 0.85)
        const candidate = boxAt({ x: anchor.x + normal.x * offset, y: anchor.y + normal.y * offset }, size)
        const cost = penalty(candidate, obstacles)
        if (cost === 0) {
          best = candidate
          bestPenalty = 0
          break
        }
        if (cost < bestPenalty) {
          best = candidate
          bestPenalty = cost
        }
      }
      if (bestPenalty === 0) break
    }
    if (best) {
      placed.set(edge.id, best)
      obstacles.push(best)
    }
  }

  return edges.map((edge) => {
    const box = placed.get(edge.id)
    return box && edge.labelBox ? { ...edge, labelBox: box } : edge
  })
}
