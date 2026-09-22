import { describe, expect, it } from 'vitest'
import { neighborhood } from '@/core/ir/neighborhood'

const edges = [
  { id: '1', source: 'a', target: 'b', semantics: 'flow' as const, style: 'solid' as const },
  { id: '2', source: 'b', target: 'c', semantics: 'flow' as const, style: 'solid' as const },
  { id: '3', source: 'c', target: 'd', semantics: 'flow' as const, style: 'solid' as const },
  { id: '4', source: 'x', target: 'y', semantics: 'flow' as const, style: 'solid' as const },
]

describe('neighborhood', () => {
  it('walks undirected hops from the start node', () => {
    expect(neighborhood({ edges }, 'b', 0)).toEqual(new Set(['b']))
    expect(neighborhood({ edges }, 'b', 1)).toEqual(new Set(['a', 'b', 'c']))
    expect(neighborhood({ edges }, 'a', 2)).toEqual(new Set(['a', 'b', 'c']))
    expect(neighborhood({ edges }, 'd', 3)).toEqual(new Set(['a', 'b', 'c', 'd']))
  })

  it('never reaches disconnected components', () => {
    expect(neighborhood({ edges }, 'a', 10).has('x')).toBe(false)
  })
})
