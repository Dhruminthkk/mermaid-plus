import { describe, expect, it } from 'vitest'
import { validateIR } from '@/core/ir/validate'
import type { DiagramIR, IRNode } from '@/core/ir/types'

function node(id: string, groupId?: string): IRNode {
  return { id, label: id, archetype: 'default', groupId, meta: {} }
}

function ir(partial: Partial<DiagramIR>): DiagramIR {
  return {
    kind: 'flowchart',
    tier: 1,
    direction: 'TB',
    nodes: [],
    edges: [],
    groups: [],
    directives: [],
    raw: '',
    ...partial,
  }
}

describe('validateIR', () => {
  it('accepts a well-formed diagram', () => {
    const subject = ir({
      nodes: [node('a'), node('b')],
      edges: [{ id: 'e1', source: 'a', target: 'b', semantics: 'flow', style: 'solid' }],
    })
    expect(validateIR(subject)).toEqual([])
  })

  it('reports an edge referencing an unknown node', () => {
    const subject = ir({
      nodes: [node('a')],
      edges: [{ id: 'e1', source: 'a', target: 'ghost', semantics: 'flow', style: 'solid' }],
    })
    expect(validateIR(subject)).toEqual(['edge e1 targets unknown node "ghost"'])
  })

  it('accepts an edge that terminates on a group', () => {
    const subject = ir({
      nodes: [node('a'), node('b', 'g')],
      groups: [{ id: 'g', childNodeIds: ['b'] }],
      edges: [{ id: 'e1', source: 'a', target: 'g', semantics: 'flow', style: 'solid' }],
    })
    expect(validateIR(subject)).toEqual([])
  })

  it('reports a node assigned to an unknown group', () => {
    const subject = ir({ nodes: [node('a', 'nowhere')] })
    expect(validateIR(subject)).toEqual(['node a belongs to unknown group "nowhere"'])
  })

  it('reports duplicate node ids', () => {
    const subject = ir({ nodes: [node('a'), node('a')] })
    expect(validateIR(subject)).toEqual(['duplicate node id "a"'])
  })

  it('reports a cycle in the group hierarchy', () => {
    const subject = ir({
      groups: [
        { id: 'g1', parentId: 'g2', childNodeIds: [] },
        { id: 'g2', parentId: 'g1', childNodeIds: [] },
      ],
    })
    expect(validateIR(subject)).toEqual(['group hierarchy contains a cycle at "g1"'])
  })
})
