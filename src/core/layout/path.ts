import type { Point } from './types'

function fmt(n: number): string {
  return String(Math.round(n * 1000) / 1000)
}

function pt(p: Point): string {
  return `${fmt(p.x)} ${fmt(p.y)}`
}

function towards(from: Point, to: Point, distance: number): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  return { x: from.x + (dx / length) * distance, y: from.y + (dy / length) * distance }
}

/**
 * Builds an SVG path through `points`, rounding every interior vertex with a
 * quadratic curve of the given radius, clamped so curves never overlap.
 */
export function roundedPath(points: Point[], radius: number): string {
  if (points.length < 2) return ''
  const first = points[0]!
  const parts = [`M ${pt(first)}`]

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!
    const corner = points[i]!
    const next = points[i + 1]!
    const inLen = Math.hypot(corner.x - prev.x, corner.y - prev.y)
    const outLen = Math.hypot(next.x - corner.x, next.y - corner.y)
    const r = Math.min(radius, inLen / 2, outLen / 2)
    if (r <= 0) {
      parts.push(`L ${pt(corner)}`)
      continue
    }
    parts.push(`L ${pt(towards(corner, prev, r))}`)
    parts.push(`Q ${pt(corner)} ${pt(towards(corner, next, r))}`)
  }

  parts.push(`L ${pt(points[points.length - 1]!)}`)
  return parts.join(' ')
}

/** Straight polyline. */
export function straightPath(points: Point[]): string {
  if (points.length < 2) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pt(p)}`).join(' ')
}

/**
 * Tree/curved link: one cubic Bézier from the first point to the last, with
 * tangents along the layout axis ('x' for LR/RL flows, 'y' for TB/BT) or, when
 * unspecified, the dominant axis. Intermediate bend points are ignored on
 * purpose — splines through orthogonal bends overshoot into loops.
 */
export function smoothPath(points: Point[], axis?: 'x' | 'y'): string {
  if (points.length < 2) return ''
  const a = points[0]!
  const b = points[points.length - 1]!
  const dx = b.x - a.x
  const dy = b.y - a.y
  const horizontal = axis ? axis === 'x' : Math.abs(dx) >= Math.abs(dy)
  if (horizontal) {
    const mx = a.x + dx / 2
    return `M ${pt(a)} C ${pt({ x: mx, y: a.y })} ${pt({ x: mx, y: b.y })} ${pt(b)}`
  }
  const my = a.y + dy / 2
  return `M ${pt(a)} C ${pt({ x: a.x, y: my })} ${pt({ x: b.x, y: my })} ${pt(b)}`
}

/** Total length of a polyline. */
export function polylineLength(points: Point[]): number {
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    total += Math.hypot(points[i + 1]!.x - points[i]!.x, points[i + 1]!.y - points[i]!.y)
  }
  return total
}

/** The point `distance` along a polyline, measured from the start or the end. */
export function pointAlong(points: Point[], distance: number, fromEnd = false): Point {
  const ordered = fromEnd ? [...points].reverse() : points
  let remaining = distance
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]!
    const b = ordered[i + 1]!
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    if (length >= remaining) {
      const t = length === 0 ? 0 : remaining / length
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
    remaining -= length
  }
  return ordered[ordered.length - 1]!
}
