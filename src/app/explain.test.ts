// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { describeEdge, describeGroup, describeNode, neighbourhoodOf } from '@/app/explain'
import { enrich } from '@/core/enrich'
import { parseDiagram } from '@/core/parse'
import type { DiagramIR } from '@/core/ir'

const SOURCE = `flowchart LR
%%mp: node api note="Every request enters here" owner="Platform"
%%mp: edge api->db note="Synchronous read"
%%mp: group backend note="Off the request path"
  client[Browser] -->|HTTPS| api[API Gateway]
  api --> db[(Postgres)]
  api --> cache[(Redis)]
  worker[Worker] --> db
  subgraph backend [Backend]
    api
    db
  end`

async function ir(): Promise<DiagramIR> {
  const result = await parseDiagram(SOURCE)
  if (!result.ok) throw new Error(result.error.message)
  return enrich(result.ir)
}

describe('describeNode', () => {
  it('reports what the node is, where it lives, and the author’s note', async () => {
    const detail = describeNode(await ir(), 'api', { sourceLine: 4 })!
    expect(detail).toMatchObject({
      kind: 'node',
      label: 'API Gateway',
      archetype: 'service',
      note: 'Every request enters here',
      groupLabel: 'Backend',
      sourceLine: 4,
    })
  })

  it('lists both directions of every connection, with edge labels', async () => {
    const detail = describeNode(await ir(), 'api')!
    expect(detail.outgoing.map((c) => c.label).sort()).toEqual(['Postgres', 'Redis'])
    expect(detail.incoming.map((c) => c.label)).toEqual(['Browser'])
    expect(detail.incoming[0]?.edgeLabel).toBe('HTTPS')
  })

  it('surfaces authored metadata but not the fields shown elsewhere', async () => {
    const detail = describeNode(await ir(), 'api')!
    expect(detail.meta).toEqual([['owner', 'Platform']])
  })

  it('returns nothing for a node that is not there', async () => {
    expect(describeNode(await ir(), 'ghost')).toBeNull()
  })
})

describe('describeEdge', () => {
  it('names both ends and reads the relationship out', async () => {
    const detail = describeEdge(await ir(), 'api->db')!
    expect(detail).toMatchObject({ kind: 'edge', fromLabel: 'API Gateway', toLabel: 'Postgres', semantics: 'flow' })
    expect(detail.note).toBe('Synchronous read')
  })

  it('carries the edge label when there is one', async () => {
    expect(describeEdge(await ir(), 'client->api')?.label).toBe('HTTPS')
  })
})

describe('describeGroup', () => {
  it('lists members and the author’s note', async () => {
    const detail = describeGroup(await ir(), 'backend', false)!
    expect(detail.label).toBe('Backend')
    expect(detail.memberLabels.sort()).toEqual(['API Gateway', 'Postgres'])
    expect(detail.note).toBe('Off the request path')
    expect(detail.collapsed).toBe(false)
  })
})

describe('neighbourhoodOf', () => {
  it('is the node, its edges and whatever is on the other end', async () => {
    const model = await ir()
    const { nodes, edges } = neighbourhoodOf(model, 'api')
    expect([...nodes].sort()).toEqual(['api', 'cache', 'client', 'db'])
    expect([...edges].sort()).toEqual(['api->cache', 'api->db', 'client->api'])
    // A node two hops away is not in it.
    expect(nodes.has('worker')).toBe(false)
  })
})
