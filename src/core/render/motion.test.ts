import { describe, expect, it } from 'vitest'
import type { DiagramIR, IREdge } from '@/core/ir'
import { edgeFlows, flowPolicy, flowTiming, motionEnabled, staggerIndex, MAX_STAGGER_STEPS } from './motion'

function ir(directives: DiagramIR['directives']): DiagramIR {
  return { kind: 'flowchart', tier: 1, direction: 'TB', nodes: [], edges: [], groups: [], directives, raw: '' }
}

function edge(over: Partial<IREdge> = {}): IREdge {
  return { id: 'e', source: 'a', target: 'b', semantics: 'flow', style: 'solid', ...over }
}

describe('motion', () => {
  it('animates unless the diagram says otherwise', () => {
    expect(motionEnabled(ir([]))).toBe(true)
    expect(motionEnabled(ir([{ target: 'layout', attrs: { motion: 'off' }, line: 0 }]))).toBe(false)
  })

  it('reads settings from any layout line, not just the first', () => {
    const directives: DiagramIR['directives'] = [
      { target: 'layout', attrs: { edgeLabels: 'beside' }, line: 0 },
      { target: 'layout', attrs: { motion: 'off' }, line: 1 },
    ]
    expect(motionEnabled(ir(directives))).toBe(false)
  })

  it('flows every edge by default', () => {
    const policy = flowPolicy(ir([]))
    expect(policy).toBe('all')
    for (const style of ['solid', 'dashed', 'dotted', 'thick'] as const) {
      expect(edgeFlows(edge({ style }), policy)).toBe(true)
    }
  })

  it('narrows to the broken lines on request', () => {
    const policy = flowPolicy(ir([{ target: 'layout', attrs: { flow: 'auto' }, line: 0 }]))
    expect(policy).toBe('auto')
    expect(edgeFlows(edge({ semantics: 'async' }), policy)).toBe(true)
    expect(edgeFlows(edge({ style: 'dashed' }), policy)).toBe(true)
    expect(edgeFlows(edge({ style: 'dotted' }), policy)).toBe(true)
    expect(edgeFlows(edge({ style: 'solid' }), policy)).toBe(false)
    expect(edgeFlows(edge({ style: 'thick' }), policy)).toBe(false)
  })

  it('lets the diagram silence the flow', () => {
    const none = flowPolicy(ir([{ target: 'layout', attrs: { flow: 'none' }, line: 0 }]))
    expect(none).toBe('none')
    expect(edgeFlows(edge({ style: 'dashed' }), none)).toBe(false)
    expect(edgeFlows(edge({ style: 'solid' }), none)).toBe(false)
  })

  it('lets one edge overrule the diagram either way', () => {
    expect(edgeFlows(edge({ meta: { flow: 'true' } }), 'none')).toBe(true)
    expect(edgeFlows(edge({ style: 'dashed', meta: { flow: 'false' } }), 'auto')).toBe(false)
  })

  it('caps the entrance stagger so large diagrams still arrive promptly', () => {
    expect(staggerIndex(3)).toBe(3)
    expect(staggerIndex(500)).toBe(MAX_STAGGER_STEPS)
  })
})

describe('flow timing', () => {
  const chain: DiagramIR = {
    kind: 'flowchart', tier: 1, direction: 'LR', groups: [], directives: [], raw: '',
    nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, label: id, archetype: 'default', shapeHint: 'rect', meta: {} })),
    edges: [
      { id: 'a->b', source: 'a', target: 'b', semantics: 'flow', style: 'solid' },
      { id: 'b->c', source: 'b', target: 'c', semantics: 'flow', style: 'solid' },
      { id: 'c->d', source: 'c', target: 'd', semantics: 'flow', style: 'solid' },
    ],
  }

  it('gives each edge the slot its source sits at, counting from the entry node', () => {
    const timing = flowTiming(chain)
    expect([...timing.layers.entries()]).toEqual([['a->b', 0], ['b->c', 1], ['c->d', 2]])
    expect(timing.count).toBe(3)
  })

  it('splits the cycle evenly so one slot ends as the next begins', () => {
    const timing = flowTiming(chain)
    expect(timing.slicePercent).toBeCloseTo(33.3, 1)
    expect(timing.cycleSeconds / timing.count).toBeGreaterThan(0)
  })

  it('holds the cycle inside a watchable range however deep the graph', () => {
    const deep: DiagramIR = { ...chain, nodes: [], edges: [] }
    for (let i = 0; i < 40; i++) {
      deep.nodes.push({ id: `n${i}`, label: `n${i}`, archetype: 'default', shapeHint: 'rect', meta: {} })
      if (i > 0) deep.edges.push({ id: `n${i - 1}->n${i}`, source: `n${i - 1}`, target: `n${i}`, semantics: 'flow', style: 'solid' })
    }
    expect(flowTiming(deep).cycleSeconds).toBeLessThanOrEqual(9)
    expect(flowTiming({ ...chain, edges: [chain.edges[0]!] }).cycleSeconds).toBeGreaterThanOrEqual(2.4)
  })

  it('starts everything together when the graph is all cycle and has no entry', () => {
    const loop: DiagramIR = {
      ...chain,
      edges: [
        { id: 'a->b', source: 'a', target: 'b', semantics: 'flow', style: 'solid' },
        { id: 'b->a', source: 'b', target: 'a', semantics: 'flow', style: 'solid' },
      ],
    }
    const timing = flowTiming(loop)
    expect([...timing.layers.values()]).toEqual([0, 0])
    expect(timing.count).toBe(1)
  })
})
