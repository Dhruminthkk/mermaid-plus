import { describe, expect, it } from 'vitest'
import { buildElkGraph, elkDirection } from '@/core/layout/elk-graph'
import { cleanLight } from '@/core/theme'
import type { DiagramIR } from '@/core/ir'

function ir(partial: Partial<DiagramIR>): DiagramIR {
  return { kind: 'flowchart', tier: 1, direction: 'TB', nodes: [], edges: [], groups: [], directives: [], raw: '', ...partial }
}

const twoNodes = ir({
  nodes: [
    { id: 'a', label: 'A', archetype: 'default', meta: {} },
    { id: 'b', label: 'B', archetype: 'default', meta: {} },
  ],
  edges: [{ id: 'a->b', source: 'a', target: 'b', semantics: 'flow', style: 'solid' }],
})

describe('elkDirection', () => {
  it('maps mermaid directions to ELK', () => {
    expect(elkDirection(ir({ direction: 'TB' }))).toBe('DOWN')
    expect(elkDirection(ir({ direction: 'LR' }))).toBe('RIGHT')
    expect(elkDirection(ir({ direction: 'BT' }))).toBe('UP')
    expect(elkDirection(ir({ direction: 'RL' }))).toBe('LEFT')
  })

  it('lets a layout directive override the source direction', () => {
    expect(elkDirection(ir({ direction: 'TB', directives: [{ target: 'layout', attrs: { direction: 'RIGHT' }, line: 0 }] }))).toBe('RIGHT')
  })

  it('accepts mermaid spellings in the directive too', () => {
    expect(elkDirection(ir({ directives: [{ target: 'layout', attrs: { direction: 'LR' }, line: 0 }] }))).toBe('RIGHT')
  })

  // Settings are commonly written one per line. Reading only the first layout
  // directive dropped the direction whenever another setting came before it.
  it('finds the direction on any layout line, not just the first', () => {
    expect(elkDirection(ir({
      direction: 'TB',
      directives: [
        { target: 'layout', attrs: { edgeLabels: 'beside' }, line: 0 },
        { target: 'layout', attrs: { direction: 'RIGHT' }, line: 1 },
      ],
    }))).toBe('RIGHT')
  })
})

describe('buildElkGraph', () => {
  it('sets the layered algorithm with orthogonal routing and child hierarchy', () => {
    expect(buildElkGraph(twoNodes, cleanLight).layoutOptions).toMatchObject({
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    })
  })

  it('takes spacing from theme geometry', () => {
    const graph = buildElkGraph(twoNodes, cleanLight)
    expect(graph.layoutOptions?.['elk.spacing.nodeNode']).toBe(String(cleanLight.geometry.nodeSpacing))
    expect(graph.layoutOptions?.['elk.layered.spacing.nodeNodeBetweenLayers']).toBe(String(cleanLight.geometry.rankSpacing))
  })

  it('gives every node a measured width and height', () => {
    for (const child of buildElkGraph(twoNodes, cleanLight).children ?? []) {
      expect(child.width).toBeGreaterThan(0)
      expect(child.height).toBeGreaterThan(0)
    }
  })

  it('places all edges on the root with source/target arrays', () => {
    expect(buildElkGraph(twoNodes, cleanLight).edges).toEqual([
      expect.objectContaining({ id: 'a->b', sources: ['a'], targets: ['b'] }),
    ])
  })

  it('nests grouped nodes under their group node', () => {
    const grouped = ir({
      nodes: [
        { id: 'api', label: 'API', archetype: 'service', groupId: 'backend', meta: {} },
        { id: 'client', label: 'Client', archetype: 'user', meta: {} },
      ],
      groups: [{ id: 'backend', label: 'Backend', childNodeIds: ['api'] }],
    })
    const graph = buildElkGraph(grouped, cleanLight)
    expect((graph.children ?? []).map((c) => c.id).sort()).toEqual(['backend', 'client'])
    const backend = graph.children?.find((c) => c.id === 'backend')
    expect(backend?.children?.map((c) => c.id)).toEqual(['api'])
    expect(backend?.labels?.[0]?.text).toBe('Backend')
  })

  it('nests groups under parent groups', () => {
    const nested = ir({
      nodes: [{ id: 'x', label: 'X', archetype: 'default', groupId: 'inner', meta: {} }],
      groups: [{ id: 'outer', childNodeIds: [] }, { id: 'inner', parentId: 'outer', childNodeIds: ['x'] }],
    })
    const graph = buildElkGraph(nested, cleanLight)
    expect(graph.children?.[0]?.id).toBe('outer')
    expect(graph.children?.[0]?.children?.[0]?.id).toBe('inner')
    expect(graph.children?.[0]?.children?.[0]?.children?.[0]?.id).toBe('x')
  })

  it('attaches edge labels with measured sizes', () => {
    const labelled = ir({ ...twoNodes, edges: [{ id: 'a->b', source: 'a', target: 'b', label: 'writes', semantics: 'flow', style: 'solid' }] })
    const label = buildElkGraph(labelled, cleanLight).edges?.[0]?.labels?.[0]
    expect(label?.text).toBe('writes')
    expect(label?.width).toBeGreaterThan(0)
  })

  it('switches to fast placement above the large-graph threshold', () => {
    const big = ir({ nodes: Array.from({ length: 151 }, (_, i) => ({ id: `n${i}`, label: `N${i}`, archetype: 'default' as const, meta: {} })) })
    const opts = buildElkGraph(big, cleanLight).layoutOptions!
    expect(opts['elk.layered.nodePlacement.strategy']).toBe('BRANDES_KOEPF')
    expect(opts['elk.layered.considerModelOrder.strategy']).toBe('NONE')
    expect(buildElkGraph(twoNodes, cleanLight).layoutOptions?.['elk.layered.nodePlacement.strategy']).toBe('NETWORK_SIMPLEX')
  })

  it('honors adapter layout hints for algorithm and routing', () => {
    const tree = buildElkGraph(ir({ ...twoNodes, layout: { algorithm: 'mrtree', edgeRouting: 'POLYLINE' } }), cleanLight)
    expect(tree.layoutOptions?.['elk.algorithm']).toBe('mrtree')
    expect(tree.layoutOptions?.['elk.edgeRouting']).toBe('POLYLINE')
  })

  it('emits children in a stable sorted order regardless of input order', () => {
    const forward = buildElkGraph(twoNodes, cleanLight)
    const reversed = buildElkGraph(ir({ ...twoNodes, nodes: [...twoNodes.nodes].reverse() }), cleanLight)
    expect(forward.children?.map((c) => c.id)).toEqual(reversed.children?.map((c) => c.id))
  })
})
