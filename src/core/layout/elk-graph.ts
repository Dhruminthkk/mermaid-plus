import type { ElkExtendedEdge, ElkNode } from 'elkjs'
import type { DiagramIR, IRGroup, IRNode } from '@/core/ir'
import type { Theme } from '@/core/theme'
import { measureLabel, measureNode } from './measure'
import { edgeLabelPlacement, effectiveRouting, layoutAttrs } from './routing'

export type ElkDirection = 'DOWN' | 'RIGHT' | 'UP' | 'LEFT'

/** Above this many nodes, layout trades a little polish for an order of magnitude in speed. */
export const LARGE_GRAPH_NODES = 150

const DIRECTION: Record<string, ElkDirection> = {
  TB: 'DOWN', TD: 'DOWN', DOWN: 'DOWN',
  LR: 'RIGHT', RIGHT: 'RIGHT',
  BT: 'UP', UP: 'UP',
  RL: 'LEFT', LEFT: 'LEFT',
}

export function elkDirection(ir: DiagramIR): ElkDirection {
  // Every `%%mp: layout …` line, not just the first: a diagram that puts
  // `direction` on its own line after another layout setting was silently
  // falling back to the direction in the source.
  const directive = layoutAttrs(ir)['direction']
  const requested = (directive ?? ir.direction).toUpperCase()
  return DIRECTION[requested] ?? 'DOWN'
}

function byId<T extends { id: string }>(a: T, b: T): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

function nodeToElk(node: IRNode, theme: Theme): ElkNode {
  return { id: node.id, ...measureNode(node, theme) }
}

function groupToElk(
  group: IRGroup,
  childGroups: Map<string | undefined, IRGroup[]>,
  nodesByGroup: Map<string | undefined, IRNode[]>,
  theme: Theme,
): ElkNode {
  const pad = theme.geometry.groupPadding
  const titleHeight = group.label ? measureLabel(group.label, theme).height + pad / 2 : 0
  return {
    id: group.id,
    labels: group.label ? [{ text: group.label, ...measureLabel(group.label, theme) }] : [],
    layoutOptions: {
      'elk.padding': `[top=${pad + titleHeight},left=${pad},bottom=${pad},right=${pad}]`,
      'elk.nodeLabels.placement': '[H_LEFT, V_TOP, INSIDE]',
    },
    children: [
      ...(nodesByGroup.get(group.id) ?? []).sort(byId).map((n) => nodeToElk(n, theme)),
      ...(childGroups.get(group.id) ?? []).sort(byId).map((g) => groupToElk(g, childGroups, nodesByGroup, theme)),
    ],
  }
}

export function buildElkGraph(ir: DiagramIR, theme: Theme): ElkNode {
  const nodesByGroup = new Map<string | undefined, IRNode[]>()
  for (const node of ir.nodes) {
    const list = nodesByGroup.get(node.groupId) ?? []
    list.push(node)
    nodesByGroup.set(node.groupId, list)
  }

  const childGroups = new Map<string | undefined, IRGroup[]>()
  for (const group of ir.groups) {
    const list = childGroups.get(group.parentId) ?? []
    list.push(group)
    childGroups.set(group.parentId, list)
  }

  const edges: ElkExtendedEdge[] = [...ir.edges].sort(byId).map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
    labels: edge.label ? [{ text: edge.label, ...measureLabel(edge.label, theme) }] : [],
  }))

  const pad = theme.geometry.groupPadding
  const algorithm = ir.layout?.algorithm ?? 'layered'
  const large = ir.nodes.length > LARGE_GRAPH_NODES
  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': algorithm,
      'elk.direction': elkDirection(ir),
      'elk.edgeRouting': effectiveRouting(ir, theme),
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      // Network simplex placement and model-order preservation read best on
      // small graphs but cost ~10x on large ones (500 nodes: 1250ms vs 90ms).
      ...(large
        ? { 'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF', 'elk.layered.thoroughness': '1', 'elk.layered.considerModelOrder.strategy': 'NONE' }
        : { 'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX', 'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES' }),
      'elk.spacing.nodeNode': String(theme.geometry.nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(theme.geometry.rankSpacing),
      'elk.spacing.edgeNode': String(Math.round(theme.geometry.nodeSpacing / 2)),
      'elk.layered.spacing.edgeNodeBetweenLayers': String(Math.round(theme.geometry.rankSpacing / 2)),
      'elk.spacing.edgeLabel': '6',
      'elk.edgeLabels.inline': String(edgeLabelPlacement(ir, theme) === 'on-line'),
      ...(algorithm === 'mrtree' ? { 'elk.mrtree.searchOrder': 'DFS', 'elk.spacing.nodeNode': String(theme.geometry.nodeSpacing * 0.75) } : {}),
      'elk.padding': `[top=${pad},left=${pad},bottom=${pad},right=${pad}]`,
    },
    children: [
      ...(nodesByGroup.get(undefined) ?? []).sort(byId).map((n) => nodeToElk(n, theme)),
      ...(childGroups.get(undefined) ?? []).sort(byId).map((g) => groupToElk(g, childGroups, nodesByGroup, theme)),
    ],
    edges,
  }
}
