import { describe, expect, it } from 'vitest'
import { enrich } from '@/core/enrich'
import type { DiagramIR, MpDirective } from '@/core/ir'

function ir(nodes: Array<{ id: string; label: string; shapeHint?: string }>, directives: MpDirective[] = []): DiagramIR {
  return {
    kind: 'flowchart',
    tier: 1,
    direction: 'TB',
    nodes: nodes.map((n) => ({ ...n, archetype: 'default', meta: {} })),
    edges: [],
    groups: [],
    directives,
    raw: '',
  }
}

describe('enrich', () => {
  it('assigns inferred archetypes to every node', () => {
    const result = enrich(ir([{ id: 'a', label: 'Auth Service' }, { id: 'b', label: 'Postgres' }]))
    expect(result.nodes.map((n) => n.archetype)).toEqual(['service', 'database'])
  })

  it('lets a node directive override inference', () => {
    const result = enrich(ir([{ id: 'b', label: 'Postgres' }], [{ target: 'node', subject: 'b', attrs: { archetype: 'queue' }, line: 0 }]))
    expect(result.nodes[0]?.archetype).toBe('queue')
  })

  it('applies an icon from a node directive', () => {
    const result = enrich(ir([{ id: 'a', label: 'API' }], [{ target: 'node', subject: 'a', attrs: { icon: 'aws:lambda' }, line: 0 }]))
    expect(result.nodes[0]?.icon).toBe('aws:lambda')
  })

  it('gives archetypes their default glyph unless the node opts out', () => {
    const result = enrich(ir(
      [{ id: 'a', label: 'Auth Service' }, { id: 'b', label: 'Postgres' }, { id: 'c', label: 'Step 4' }],
      [{ target: 'node', subject: 'b', attrs: { icon: 'none' }, line: 0 }],
    ))
    expect(result.nodes.map((n) => n.icon)).toEqual(['general:server', undefined, undefined])
  })

  it('copies unrecognized directive attributes into node meta', () => {
    const result = enrich(ir([{ id: 'a', label: 'API' }], [{ target: 'node', subject: 'a', attrs: { owner: 'platform' }, line: 0 }]))
    expect(result.nodes[0]?.meta).toEqual({ owner: 'platform' })
  })

  it('ignores an invalid archetype value and keeps the inferred one', () => {
    const result = enrich(ir([{ id: 'b', label: 'Postgres' }], [{ target: 'node', subject: 'b', attrs: { archetype: 'banana' }, line: 0 }]))
    expect(result.nodes[0]?.archetype).toBe('database')
  })

  it('ignores a directive naming an unknown node', () => {
    const result = enrich(ir([{ id: 'a', label: 'API' }], [{ target: 'node', subject: 'ghost', attrs: { archetype: 'queue' }, line: 0 }]))
    expect(result.nodes[0]?.archetype).toBe('service')
  })

  it('does not mutate the input IR', () => {
    const input = ir([{ id: 'b', label: 'Postgres' }])
    enrich(input)
    expect(input.nodes[0]?.archetype).toBe('default')
  })

  it('returns tier-2 IR untouched', () => {
    const input: DiagramIR = { ...ir([]), tier: 2, kind: 'pie', raw: 'pie' }
    expect(enrich(input)).toEqual(input)
  })
})
