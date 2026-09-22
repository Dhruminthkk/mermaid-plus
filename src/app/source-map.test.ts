import { describe, expect, it } from 'vitest'
import { buildSourceMap } from '@/app/source-map'

describe('buildSourceMap', () => {
  const source = ['flowchart TD', '%%mp: node api archetype=service', '  api[API] --> db[(Postgres)]', '  db --> apiCache[Cache]'].join('\n')

  it('maps each node to the first non-comment line mentioning it as a whole word', () => {
    const map = buildSourceMap(source, ['api', 'db', 'apiCache'])
    expect(map.lineOf.get('api')).toBe(2)
    expect(map.lineOf.get('db')).toBe(2)
    expect(map.lineOf.get('apiCache')).toBe(3)
  })

  it('lists nodes per line and ignores directive lines', () => {
    const map = buildSourceMap(source, ['api', 'db', 'apiCache'])
    expect(map.nodesAt.get(2)).toEqual(['api', 'db'])
    expect(map.nodesAt.get(3)).toEqual(['db', 'apiCache'])
    expect(map.nodesAt.get(1)).toBeUndefined()
  })

  it('handles ids with regex metacharacters', () => {
    const map = buildSourceMap('flowchart TD\n  a.b --> c', ['a.b', 'c'])
    expect(map.lineOf.get('a.b')).toBe(1)
  })
})
