import type { ELK, ElkExtendedEdge, ElkNode } from 'elkjs'
import type { DiagramIR } from '@/core/ir'
import type { Theme } from '@/core/theme'
import { buildElkGraph } from './elk-graph'
import { resolveLabelCollisions } from './labels'
import { pointAlong, polylineLength } from './path'
import { edgeLabelPlacement } from './routing'
import type { Box, LaidOutDiagram, LaidOutEdge, LaidOutGroup, LaidOutNode, Point } from './types'

function byId<T extends { id: string }>(a: T, b: T): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

interface Flattened {
  nodes: LaidOutNode[]
  groups: LaidOutGroup[]
  edges: Array<{ edge: ElkExtendedEdge; containerId: string }>
  offsets: Map<string, Point>
}

/**
 * ELK reports node positions relative to the parent and edge sections relative
 * to the edge's `container`. Walk the tree once, accumulating absolute offsets.
 */
function flatten(root: ElkNode, groupIds: ReadonlySet<string>): Flattened {
  const out: Flattened = { nodes: [], groups: [], edges: [], offsets: new Map() }

  const walk = (node: ElkNode, origin: Point): void => {
    const abs: Box = {
      x: origin.x + (node.x ?? 0),
      y: origin.y + (node.y ?? 0),
      width: node.width ?? 0,
      height: node.height ?? 0,
    }
    out.offsets.set(node.id, { x: abs.x, y: abs.y })

    if (node.id !== root.id) {
      if (groupIds.has(node.id)) out.groups.push({ id: node.id, ...abs })
      else out.nodes.push({ id: node.id, ...abs })
    }

    for (const edge of node.edges ?? []) {
      // `container` is set by ELK on output edges but is absent from some
      // elkjs type versions; read it structurally rather than via the type.
      const container = (edge as { container?: string }).container
      out.edges.push({ edge, containerId: container ?? node.id })
    }
    for (const child of node.children ?? []) walk(child, { x: abs.x, y: abs.y })
  }

  walk(root, { x: 0, y: 0 })
  return out
}

function toLaidOutEdge(edge: ElkExtendedEdge, offset: Point): LaidOutEdge {
  const section = edge.sections?.[0]
  const points: Point[] = section
    ? [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map((p) => ({ x: p.x + offset.x, y: p.y + offset.y }))
    : []

  const label = edge.labels?.[0]
  const labelBox: Box | undefined =
    label && label.x !== undefined && label.y !== undefined
      ? { x: label.x + offset.x, y: label.y + offset.y, width: label.width ?? 0, height: label.height ?? 0 }
      : undefined

  return labelBox ? { id: edge.id, points, labelBox } : { id: edge.id, points }
}

/** Room for strokes, drop shadows, and sketch-texture wobble, none of which ELK knows about. */
const BOUNDS_PADDING = 12

function contentBounds(nodes: LaidOutNode[], groups: LaidOutGroup[], edges: LaidOutEdge[]): Box | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const add = (x: number, y: number, width = 0, height = 0): void => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x + width > maxX) maxX = x + width
    if (y + height > maxY) maxY = y + height
  }

  for (const n of nodes) add(n.x, n.y, n.width, n.height)
  for (const g of groups) add(g.x, g.y, g.width, g.height)
  for (const e of edges) {
    for (const p of e.points) add(p.x, p.y)
    if (e.labelBox) add(e.labelBox.x, e.labelBox.y, e.labelBox.width, e.labelBox.height)
  }

  if (minX === Infinity) return null
  const x = Math.floor(minX) - BOUNDS_PADDING
  const y = Math.floor(minY) - BOUNDS_PADDING
  return { x, y, width: Math.ceil(maxX) + BOUNDS_PADDING - x, height: Math.ceil(maxY) + BOUNDS_PADDING - y }
}

export async function runLayout(ir: DiagramIR, theme: Theme, elk: ELK): Promise<LaidOutDiagram> {
  const graph = buildElkGraph(ir, theme)
  const laid = await elk.layout(graph)

  const groupIds = new Set(ir.groups.map((g) => g.id))
  const flat = flatten(laid, groupIds)
  const rootOffset = flat.offsets.get(laid.id) ?? { x: 0, y: 0 }

  // ELK reserves space for a label but parks it to one side. Centring it on the
  // edge is a layout decision, not a drawing one: the bounds have to know.
  const onLine = edgeLabelPlacement(ir, theme) === 'on-line'
  const edges = flat.edges
    .map(({ edge, containerId }) => {
      const laid = toLaidOutEdge(edge, flat.offsets.get(containerId) ?? rootOffset)
      if (!onLine || !laid.labelBox || laid.points.length < 2) return laid
      const middle = pointAlong(laid.points, polylineLength(laid.points) / 2)
      return {
        ...laid,
        labelBox: { ...laid.labelBox, x: middle.x - laid.labelBox.width / 2, y: middle.y - laid.labelBox.height / 2 },
      }
    })
    .sort(byId)

  const nodes = flat.nodes.sort(byId)
  const groups = flat.groups.sort(byId)
  const spaced = resolveLabelCollisions(edges, nodes, groups)
  const bounds = contentBounds(nodes, groups, spaced)
    ?? { x: 0, y: 0, width: Math.ceil(laid.width ?? 0), height: Math.ceil(laid.height ?? 0) }

  return { ir, nodes, groups, edges: spaced, bounds, width: bounds.width, height: bounds.height }
}
