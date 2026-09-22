import { describe, expect, it } from 'vitest'
import ELK from 'elkjs/lib/elk.bundled.js'
import { runLayout } from '@/core/layout/run'
import { cleanLight } from '@/core/theme'
import type { DiagramIR } from '@/core/ir'
import type { Box, Point } from '@/core/layout/types'

const elk = new ELK()

function ir(partial: Partial<DiagramIR>): DiagramIR {
  return { kind: 'flowchart', tier: 1, direction: 'TB', nodes: [], edges: [], groups: [], directives: [], raw: '', ...partial }
}

const chain = ir({
  nodes: [
    { id: 'a', label: 'Client', archetype: 'user', meta: {} },
    { id: 'b', label: 'API Gateway', archetype: 'service', meta: {} },
    { id: 'c', label: 'Postgres', archetype: 'database', meta: {} },
  ],
  edges: [
    { id: 'a->b', source: 'a', target: 'b', semantics: 'flow', style: 'solid', label: 'HTTPS' },
    { id: 'b->c', source: 'b', target: 'c', semantics: 'flow', style: 'solid' },
  ],
})

const grouped = ir({
  nodes: [
    { id: 'client', label: 'Client', archetype: 'user', meta: {} },
    { id: 'api', label: 'API', archetype: 'service', groupId: 'backend', meta: {} },
    { id: 'db', label: 'DB', archetype: 'database', groupId: 'backend', meta: {} },
  ],
  edges: [
    { id: 'client->api', source: 'client', target: 'api', semantics: 'flow', style: 'solid' },
    { id: 'api->db', source: 'api', target: 'db', semantics: 'flow', style: 'solid' },
  ],
  groups: [{ id: 'backend', label: 'Backend', childNodeIds: ['api', 'db'] }],
})

const nested = ir({
  nodes: [
    { id: 'x', label: 'X', archetype: 'default', groupId: 'inner', meta: {} },
    { id: 'y', label: 'Y', archetype: 'default', groupId: 'outer', meta: {} },
    { id: 'z', label: 'Z', archetype: 'default', meta: {} },
  ],
  edges: [
    { id: 'z->y', source: 'z', target: 'y', semantics: 'flow', style: 'solid' },
    { id: 'y->x', source: 'y', target: 'x', semantics: 'flow', style: 'solid' },
  ],
  groups: [
    { id: 'outer', label: 'Outer', childNodeIds: ['y'] },
    { id: 'inner', label: 'Inner', parentId: 'outer', childNodeIds: ['x'] },
  ],
})

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function contains(outer: Box, inner: Box): boolean {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height
}

/** Distance from a point to the nearest point on a box's border. */
function distanceToBorder(p: Point, box: Box): number {
  const dx = Math.max(box.x - p.x, 0, p.x - (box.x + box.width))
  const dy = Math.max(box.y - p.y, 0, p.y - (box.y + box.height))
  const outside = Math.hypot(dx, dy)
  if (outside > 0) return outside
  return Math.min(p.x - box.x, box.x + box.width - p.x, p.y - box.y, box.y + box.height - p.y)
}

describe('runLayout', () => {
  it('orders a top-to-bottom chain vertically', async () => {
    const out = await runLayout(chain, cleanLight, elk)
    const byId = Object.fromEntries(out.nodes.map((n) => [n.id, n]))
    expect(byId['a']!.y + byId['a']!.height).toBeLessThanOrEqual(byId['b']!.y)
    expect(byId['b']!.y + byId['b']!.height).toBeLessThanOrEqual(byId['c']!.y)
  })

  it('orders a left-to-right chain horizontally', async () => {
    const out = await runLayout({ ...chain, direction: 'LR' }, cleanLight, elk)
    const byId = Object.fromEntries(out.nodes.map((n) => [n.id, n]))
    expect(byId['a']!.x + byId['a']!.width).toBeLessThanOrEqual(byId['b']!.x)
  })

  it('never overlaps nodes', async () => {
    const out = await runLayout(chain, cleanLight, elk)
    for (const a of out.nodes) for (const b of out.nodes) {
      if (a.id !== b.id) expect(overlaps(a, b), `${a.id} overlaps ${b.id}`).toBe(false)
    }
  })

  it('terminates every edge on its source and target borders', async () => {
    for (const subject of [chain, grouped, nested]) {
      const out = await runLayout(subject, cleanLight, elk)
      const byId = Object.fromEntries(out.nodes.map((n) => [n.id, n]))
      for (const edge of out.edges) {
        const irEdge = subject.edges.find((e) => e.id === edge.id)!
        const first = edge.points[0]!
        const last = edge.points[edge.points.length - 1]!
        expect(distanceToBorder(first, byId[irEdge.source]!), `${edge.id} start`).toBeLessThan(1.5)
        expect(distanceToBorder(last, byId[irEdge.target]!), `${edge.id} end`).toBeLessThan(1.5)
      }
    }
  })

  it('places grouped nodes inside their group box in absolute coordinates', async () => {
    const out = await runLayout(grouped, cleanLight, elk)
    const backend = out.groups.find((g) => g.id === 'backend')!
    const byId = Object.fromEntries(out.nodes.map((n) => [n.id, n]))
    expect(contains(backend, byId['api']!)).toBe(true)
    expect(contains(backend, byId['db']!)).toBe(true)
    expect(contains(backend, byId['client']!)).toBe(false)
  })

  it('nests group boxes and their members through two levels', async () => {
    const out = await runLayout(nested, cleanLight, elk)
    const groups = Object.fromEntries(out.groups.map((g) => [g.id, g]))
    const byId = Object.fromEntries(out.nodes.map((n) => [n.id, n]))
    expect(contains(groups['outer']!, groups['inner']!)).toBe(true)
    expect(contains(groups['inner']!, byId['x']!)).toBe(true)
    expect(contains(groups['outer']!, byId['y']!)).toBe(true)
    expect(contains(groups['outer']!, byId['z']!)).toBe(false)
  })

  it('returns an absolute label box for labelled edges', async () => {
    const out = await runLayout(chain, cleanLight, elk)
    const labelled = out.edges.find((e) => e.id === 'a->b')!
    expect(labelled.labelBox).toBeDefined()
    expect(labelled.labelBox!.width).toBeGreaterThan(0)
    expect(labelled.labelBox!.x).toBeGreaterThanOrEqual(0)
    expect(labelled.labelBox!.x + labelled.labelBox!.width).toBeLessThanOrEqual(out.width)
  })

  it('reports bounds that contain every node, group, edge point and edge label', async () => {
    for (const subject of [chain, grouped, nested]) {
      const out = await runLayout(subject, cleanLight, elk)
      const b = out.bounds
      expect(out.width).toBe(b.width)
      expect(out.height).toBe(b.height)
      for (const box of [...out.nodes, ...out.groups]) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(b.x)
        expect(box.y, box.id).toBeGreaterThanOrEqual(b.y)
        expect(box.x + box.width, box.id).toBeLessThanOrEqual(b.x + b.width)
        expect(box.y + box.height, box.id).toBeLessThanOrEqual(b.y + b.height)
      }
      for (const edge of out.edges) {
        for (const p of edge.points) {
          expect(p.x, edge.id).toBeGreaterThanOrEqual(b.x)
          expect(p.x, edge.id).toBeLessThanOrEqual(b.x + b.width)
          expect(p.y, edge.id).toBeGreaterThanOrEqual(b.y)
          expect(p.y, edge.id).toBeLessThanOrEqual(b.y + b.height)
        }
        if (edge.labelBox) {
          expect(edge.labelBox.x + edge.labelBox.width, edge.id).toBeLessThanOrEqual(b.x + b.width)
        }
      }
    }
  })

  it('pads the bounds so strokes and shadows are not clipped', async () => {
    const out = await runLayout(chain, cleanLight, elk)
    const leftmost = Math.min(...out.nodes.map((n) => n.x))
    expect(leftmost - out.bounds.x).toBeGreaterThanOrEqual(8)
  })

  it('is byte-for-byte deterministic', async () => {
    const first = JSON.stringify(await runLayout(grouped, cleanLight, elk))
    const second = JSON.stringify(await runLayout(grouped, cleanLight, elk))
    expect(second).toBe(first)
  })

  it('sorts output collections by id', async () => {
    const out = await runLayout(grouped, cleanLight, elk)
    expect(out.nodes.map((n) => n.id)).toEqual(['api', 'client', 'db'])
    expect(out.edges.map((e) => e.id)).toEqual(['api->db', 'client->api'])
  })
})
