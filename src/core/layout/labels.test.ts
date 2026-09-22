import { describe, expect, it } from 'vitest'
import { resolveLabelCollisions } from '@/core/layout/labels'
import type { Box, LaidOutEdge, LaidOutNode } from '@/core/layout/types'

const node = (id: string, x: number, y: number, width = 80, height = 36): LaidOutNode => ({ id, x, y, width, height })

function edge(id: string, points: Array<[number, number]>, label?: Box): LaidOutEdge {
  const laid: LaidOutEdge = { id, points: points.map(([x, y]) => ({ x, y })) }
  return label ? { ...laid, labelBox: label } : laid
}

function hits(a: Box, b: Box): boolean {
  return Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1
    && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1
}

describe('resolveLabelCollisions', () => {
  it('leaves an already-clear label where it is', () => {
    const label = { x: 140, y: 0, width: 40, height: 16 }
    const edges = [edge('a->b', [[0, 8], [300, 8]], label)]
    const out = resolveLabelCollisions(edges, [node('a', -80, -10), node('b', 320, -10)], [])
    expect(out[0]?.labelBox).toEqual(label)
  })

  it('moves a label off a node it was sitting on', () => {
    const blocking = node('mid', 120, -10, 90, 40)
    const edges = [edge('a->b', [[0, 8], [400, 8]], { x: 140, y: 0, width: 50, height: 16 })]
    const out = resolveLabelCollisions(edges, [blocking], [])
    const box = out[0]!.labelBox!
    expect(hits(box, { x: blocking.x, y: blocking.y, width: blocking.width, height: blocking.height })).toBe(false)
  })

  it('separates two labels that landed on top of each other', () => {
    const overlapping = { x: 190, y: 0, width: 60, height: 16 }
    const edges = [
      edge('a->b', [[0, 8], [400, 8]], { ...overlapping }),
      edge('c->d', [[0, 8], [400, 8]], { ...overlapping }),
    ]
    const out = resolveLabelCollisions(edges, [], [])
    expect(hits(out[0]!.labelBox!, out[1]!.labelBox!)).toBe(false)
  })

  it('keeps every label on or beside its own edge', () => {
    const edges = [
      edge('a->b', [[0, 8], [400, 8]], { x: 190, y: 0, width: 60, height: 16 }),
      edge('c->d', [[0, 8], [400, 8]], { x: 190, y: 0, width: 60, height: 16 }),
    ]
    const out = resolveLabelCollisions(edges, [], [])
    for (const laid of out) {
      const centre = { x: laid.labelBox!.x + laid.labelBox!.width / 2, y: laid.labelBox!.y + laid.labelBox!.height / 2 }
      expect(Math.abs(centre.y - 8)).toBeLessThan(40)
      expect(centre.x).toBeGreaterThanOrEqual(0)
      expect(centre.x).toBeLessThanOrEqual(400)
    }
  })

  it('is deterministic and leaves unlabelled edges untouched', () => {
    const edges = [edge('a->b', [[0, 8], [400, 8]], { x: 190, y: 0, width: 60, height: 16 }), edge('c->d', [[0, 40], [400, 40]])]
    const once = resolveLabelCollisions(edges, [node('n', 150, -10)], [])
    const twice = resolveLabelCollisions(edges, [node('n', 150, -10)], [])
    expect(JSON.stringify(twice)).toBe(JSON.stringify(once))
    expect(once[1]?.labelBox).toBeUndefined()
  })
})
