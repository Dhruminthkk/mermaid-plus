import { describe, expect, it } from 'vitest'
import { edgeLabelPlacement, effectiveRouting, pathStyle } from '@/core/layout/routing'
import { cleanLight } from '@/core/theme'
import type { DiagramIR } from '@/core/ir'

const base: DiagramIR = { kind: 'flowchart', tier: 1, direction: 'TB', nodes: [], edges: [], groups: [], directives: [], raw: '' }

describe('routing', () => {
  it('follows the theme by default', () => {
    expect(effectiveRouting(base, cleanLight)).toBe('ORTHOGONAL')
    expect(pathStyle(base, cleanLight)).toBe('rounded')
    const curved = { ...cleanLight, edge: { ...cleanLight.edge, routing: 'curved' as const } }
    expect(effectiveRouting(base, curved)).toBe('POLYLINE')
    expect(pathStyle(base, curved)).toBe('smooth')
    const straight = { ...cleanLight, edge: { ...cleanLight.edge, routing: 'straight' as const } }
    expect(pathStyle(base, straight)).toBe('straight')
  })

  it('lets the adapter hint override the theme', () => {
    const tree = { ...base, layout: { edgeRouting: 'POLYLINE' as const } }
    expect(effectiveRouting(tree, cleanLight)).toBe('POLYLINE')
    expect(pathStyle(tree, cleanLight)).toBe('smooth')
  })
})

describe('edge label placement', () => {
  it('sits on the line by default', () => {
    expect(edgeLabelPlacement(base, cleanLight)).toBe('on-line')
  })

  it('follows the theme when it asks for beside', () => {
    const beside = { ...cleanLight, edge: { ...cleanLight.edge, labelPlacement: 'beside' as const } }
    expect(edgeLabelPlacement(base, beside)).toBe('beside')
  })

  it('lets a layout directive override the theme either way', () => {
    const beside = { ...cleanLight, edge: { ...cleanLight.edge, labelPlacement: 'beside' as const } }
    const onLine = { ...base, directives: [{ target: 'layout', attrs: { edgeLabels: 'on-line' }, line: 0 }] }
    const asked = { ...base, directives: [{ target: 'layout', attrs: { edgeLabels: 'beside' }, line: 0 }] }
    expect(edgeLabelPlacement(onLine, beside)).toBe('on-line')
    expect(edgeLabelPlacement(asked, cleanLight)).toBe('beside')
  })

  it('ignores a value it does not understand', () => {
    const nonsense = { ...base, directives: [{ target: 'layout', attrs: { edgeLabels: 'sideways' }, line: 0 }] }
    expect(edgeLabelPlacement(nonsense, cleanLight)).toBe('on-line')
  })
})
