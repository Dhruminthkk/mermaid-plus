import { describe, expect, it } from 'vitest'
import type { DiagramIR, IREdge } from '@/core/ir'
import type { LaidOutDiagram, LaidOutNode } from '@/core/layout'
import { firstNode, neighbourInDirection } from '@/app/navigate'

function node(id: string, x: number, y: number): LaidOutNode {
  return { id, x, y, width: 80, height: 40 }
}

function edge(source: string, target: string): IREdge {
  return { id: `${source}->${target}`, source, target, semantics: 'flow', style: 'solid' }
}

function layout(nodes: LaidOutNode[], edges: IREdge[]): LaidOutDiagram {
  const ir: DiagramIR = {
    kind: 'flowchart', tier: 1, direction: 'LR', groups: [], directives: [], raw: '',
    nodes: nodes.map((n) => ({ id: n.id, label: n.id, archetype: 'default', shapeHint: 'rect', meta: {} })),
    edges,
  }
  return { ir, nodes, edges: [], groups: [], bounds: { x: 0, y: 0, width: 500, height: 500 }, width: 500, height: 500 }
}

//   b (above-right)
//  /
// a — c (right)
//  \
//   d (below-right)        z sits to the right but is not connected
const fan = layout(
  [node('a', 0, 100), node('b', 200, 0), node('c', 200, 100), node('d', 200, 200), node('z', 400, 100)],
  [edge('a', 'b'), edge('a', 'c'), edge('a', 'd')],
)

describe('arrowing around a diagram', () => {
  it('picks the branch that actually points that way', () => {
    expect(neighbourInDirection(fan, 'a', 'right')).toBe('c')
    expect(neighbourInDirection(fan, 'a', 'up')).toBe('b')
    expect(neighbourInDirection(fan, 'a', 'down')).toBe('d')
  })

  it('goes back the way it came, against the arrow', () => {
    expect(neighbourInDirection(fan, 'c', 'left')).toBe('a')
  })

  it('stays on the thread rather than jumping to whatever is nearby', () => {
    // 'z' is directly right of 'c' and closer than anything else, but nothing
    // connects them: arrowing is for tracing what touches what.
    expect(neighbourInDirection(fan, 'c', 'right')).toBeNull()
  })

  it('refuses to move when nothing lies that way', () => {
    expect(neighbourInDirection(fan, 'a', 'left')).toBeNull()
    expect(neighbourInDirection(fan, 'nope', 'right')).toBeNull()
  })

  it('prefers the nearer of two neighbours on the same bearing', () => {
    const chain = layout(
      [node('a', 0, 0), node('near', 150, 0), node('far', 400, 0)],
      [edge('a', 'near'), edge('a', 'far')],
    )
    expect(neighbourInDirection(chain, 'a', 'right')).toBe('near')
  })

  it('starts where the diagram starts', () => {
    expect(firstNode(fan)).toBe('a')
    expect(firstNode(layout([], []))).toBeNull()
  })
})
