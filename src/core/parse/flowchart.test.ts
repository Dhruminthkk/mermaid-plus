// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseDiagram } from '@/core/parse'

describe('parseDiagram — flowchart', () => {
  it('extracts nodes and edges', async () => {
    const result = await parseDiagram('flowchart TD\n  a[API] --> b[Worker]')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.kind).toBe('flowchart')
    expect(result.ir.tier).toBe(1)
    expect(result.ir.nodes.map((n) => ({ id: n.id, label: n.label }))).toEqual([
      { id: 'a', label: 'API' },
      { id: 'b', label: 'Worker' },
    ])
    expect(result.ir.edges).toHaveLength(1)
    expect(result.ir.edges[0]).toMatchObject({ source: 'a', target: 'b', style: 'solid', semantics: 'flow' })
  })

  it('falls back to the node id when no label is given', async () => {
    const result = await parseDiagram('flowchart LR\n  alpha --> beta')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.nodes.map((n) => n.label)).toEqual(['alpha', 'beta'])
  })

  it('captures the flow direction, normalizing TD to TB', async () => {
    const lr = await parseDiagram('flowchart LR\n  a --> b')
    const td = await parseDiagram('flowchart TD\n  a --> b')
    if (!lr.ok || !td.ok) throw new Error('parse failed')
    expect(lr.ir.direction).toBe('LR')
    expect(td.ir.direction).toBe('TB')
  })

  it('captures the mermaid shape token as shapeHint', async () => {
    const result = await parseDiagram('flowchart TD\n  db[(Postgres)] --> q{{Queue}}')
    if (!result.ok) throw new Error(result.error.message)
    const hints = Object.fromEntries(result.ir.nodes.map((n) => [n.id, n.shapeHint]))
    expect(hints['db']).toBe('cylinder')
    expect(hints['q']).toBe('hexagon')
  })

  it('maps dashed and thick links to edge styles', async () => {
    const result = await parseDiagram('flowchart TD\n  a -.-> b\n  b ==> c')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.edges.map((e) => e.style)).toEqual(['dotted', 'thick'])
  })

  it('marks double-headed arrows as bidirectional and drops invisible links', async () => {
    const result = await parseDiagram('flowchart TD\n  a <--> b\n  b ~~~ c')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.edges).toHaveLength(1)
    expect(result.ir.edges[0]?.semantics).toBe('bidirectional')
  })

  it('carries edge labels through', async () => {
    const result = await parseDiagram('flowchart TD\n  a -->|writes| b')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.edges[0]?.label).toBe('writes')
  })

  it('builds groups from subgraphs and assigns member nodes', async () => {
    const source = ['flowchart TD', '  subgraph backend [Backend]', '    api --> db', '  end', '  client --> api'].join('\n')
    const result = await parseDiagram(source)
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.groups).toHaveLength(1)
    expect(result.ir.groups[0]?.label).toBe('Backend')
    expect(result.ir.groups[0]?.childNodeIds).toEqual(['api', 'db'])
    const groupOf = Object.fromEntries(result.ir.nodes.map((n) => [n.id, n.groupId]))
    expect(groupOf['api']).toBe('backend')
    expect(groupOf['client']).toBeUndefined()
  })

  it('derives parentId for nested subgraphs and keeps nested ids out of childNodeIds', async () => {
    const source = [
      'flowchart TD',
      '  subgraph outer [Outer]',
      '    a',
      '    subgraph inner [Inner]',
      '      b',
      '    end',
      '  end',
      '  a --> b',
    ].join('\n')
    const result = await parseDiagram(source)
    if (!result.ok) throw new Error(result.error.message)
    const byId = Object.fromEntries(result.ir.groups.map((g) => [g.id, g]))
    expect(byId['inner']?.parentId).toBe('outer')
    expect(byId['outer']?.parentId).toBeUndefined()
    expect(byId['outer']?.childNodeIds).toEqual(['a'])
    expect(byId['inner']?.childNodeIds).toEqual(['b'])
    expect(result.ir.nodes.find((n) => n.id === 'b')?.groupId).toBe('inner')
  })

  it('assigns stable, unique edge ids', async () => {
    const result = await parseDiagram('flowchart TD\n  a --> b\n  a --> b')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.edges.map((e) => e.id)).toEqual(['a->b', 'a->b#1'])
  })

  it('attaches parsed directives to the IR', async () => {
    const result = await parseDiagram('flowchart TD\n%%mp: node a archetype=queue\n  a --> b')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.directives).toHaveLength(1)
    expect(result.ir.directives[0]?.attrs).toEqual({ archetype: 'queue' })
  })

  it('returns an error result with a line number rather than throwing on invalid source', async () => {
    const result = await parseDiagram('flowchart TD\n  a -->')
    expect(result.ok).toBe(false)
    if (result.ok) return
    // The message is written for a reader; the parser's own words stay on detail.
    expect(result.error.message).toMatch(/Could not parse/)
    expect(result.error.detail).toMatch(/Parse error/)
    expect(result.error.line).toBeTypeOf('number')
  })

  it('reports a non-tier-1 diagram kind as tier 2', async () => {
    const result = await parseDiagram('pie title Votes\n  "A" : 10\n  "B" : 20')
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.tier).toBe(2)
    expect(result.ir.kind).toBe('pie')
    expect(result.ir.nodes).toEqual([])
    expect(result.ir.raw).toContain('pie title Votes')
  })
})
