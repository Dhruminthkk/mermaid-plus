import { describe, expect, it } from 'vitest'
import { collapseGroups, directiveCollapsedGroups } from '@/core/ir/collapse'
import type { DiagramIR, IRNode } from '@/core/ir/types'

function node(id: string, groupId?: string): IRNode {
  return { id, label: id, archetype: 'default', groupId, meta: {} }
}
function edge(source: string, target: string, id = `${source}->${target}`) {
  return { id, source, target, semantics: 'flow' as const, style: 'solid' as const }
}

const ir: DiagramIR = {
  kind: 'flowchart', tier: 1, direction: 'TB', directives: [], raw: '',
  nodes: [node('client'), node('api', 'backend'), node('db', 'backend'), node('cache', 'data'), node('ext')],
  groups: [
    { id: 'backend', label: 'Backend', childNodeIds: ['api', 'db'] },
    { id: 'data', label: 'Data', parentId: 'backend', childNodeIds: ['cache'] },
  ],
  edges: [edge('client', 'api'), edge('api', 'db'), edge('db', 'cache'), edge('api', 'ext'), edge('db', 'ext'), edge('ext', 'client')],
}

describe('collapseGroups', () => {
  it('returns the same IR when nothing is collapsed', () => {
    expect(collapseGroups(ir, new Set())).toBe(ir)
  })

  it('replaces a group and everything inside it with one node', () => {
    const out = collapseGroups(ir, new Set(['backend']))
    expect(out.nodes.map((n) => n.id).sort()).toEqual(['backend', 'client', 'ext'])
    expect(out.groups).toEqual([])
    const collapsed = out.nodes.find((n) => n.id === 'backend')!
    expect(collapsed).toMatchObject({ label: 'Backend', shapeHint: 'collapsed', meta: { collapsed: 'true', members: '3' } })
  })

  it('reroutes crossing edges, bundles duplicates, and drops internal ones', () => {
    const out = collapseGroups(ir, new Set(['backend']))
    const ids = out.edges.map((e) => `${e.source}->${e.target}`).sort()
    expect(ids).toEqual(['backend->ext', 'client->backend', 'ext->client'])
    const bundle = out.edges.find((e) => e.source === 'backend' && e.target === 'ext')!
    expect(bundle.meta?.['weight']).toBe('2')
    expect(bundle.label).toBe('×2')
    expect(bundle.style).toBe('thick')
  })

  it('collapses a nested group inside a surviving parent', () => {
    const out = collapseGroups(ir, new Set(['data']))
    expect(out.nodes.map((n) => n.id).sort()).toEqual(['api', 'client', 'data', 'db', 'ext'])
    expect(out.nodes.find((n) => n.id === 'data')?.groupId).toBe('backend')
    expect(out.groups.map((g) => g.id)).toEqual(['backend'])
    expect(out.groups[0]?.childNodeIds).toEqual(['api', 'data', 'db'])
    expect(out.edges.some((e) => e.source === 'db' && e.target === 'data')).toBe(true)
  })

  it('reads initial collapse state from directives', () => {
    const withDirective: DiagramIR = { ...ir, directives: [{ target: 'group', subject: 'backend', attrs: { collapsed: 'true' }, line: 0 }] }
    expect(directiveCollapsedGroups(withDirective)).toEqual(new Set(['backend']))
    expect(directiveCollapsedGroups(ir)).toEqual(new Set())
  })

  it('does not mutate its input', () => {
    const before = JSON.stringify(ir)
    collapseGroups(ir, new Set(['backend', 'data']))
    expect(JSON.stringify(ir)).toBe(before)
  })
})
