import { useRef, type CSSProperties } from 'react'
import type { Box, LaidOutDiagram, LaidOutEdge } from '@/core/layout'
import type { Theme } from '@/core/theme'
import type { IconMap } from '@/core/icons'
import { edgeLabelPlacement, pathStyle } from '@/core/layout'
import { edgeFlows, flowPolicy, flowTiming, motionEnabled, staggerIndex } from './motion'
import { baseStyles, flowKeyframes } from './styles'
import { useLayoutMorph } from './morph'
import { Markers } from './Markers'
import { Node } from './Node'
import { Edge } from './Edge'
import { Group } from './Group'

interface Props {
  layout: LaidOutDiagram
  theme: Theme
  /** Resolved icon bodies keyed by the node's icon reference. */
  icons?: IconMap
  selectedNodeId?: string | null
  /** Focus mode: nodes to keep bright; everything else dims. */
  focusSet?: ReadonlySet<string> | null
  /** Search hits. */
  matchSet?: ReadonlySet<string> | null
  /** Hover neighbourhood: everything outside it recedes. */
  emphasis?: { nodes: ReadonlySet<string>; edges: ReadonlySet<string> } | null
  /** The element the pointer is on. */
  hoveredId?: string | null
  /** Viewport in diagram coordinates; large diagrams skip elements outside it. */
  visible?: Box | null
  /** Level of detail: 'low' hides labels/icons for far-out zoom. */
  lod?: 'full' | 'low'
  /** Group title or collapsed node clicked. */
  onGroupToggle?: (groupId: string) => void
  /**
   * Whether the diagram may animate. The app clears it for reduced-motion
   * viewers and for exports; `%%mp: layout motion=off` clears it per diagram.
   */
  motion?: boolean
}

/** Below this many nodes, culling costs more than it saves. */
const CULL_THRESHOLD = 150
const CULL_MARGIN = 120

function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function edgeBox(edge: LaidOutEdge): Box {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of edge.points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export function DiagramSvg({ layout, theme, icons = {}, selectedNodeId = null, focusSet = null, matchSet = null, emphasis = null, hoveredId = null, visible = null, lod = 'full', onGroupToggle, motion = true }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const nodesById = new Map(layout.ir.nodes.map((n) => [n.id, n]))
  const edgesById = new Map(layout.ir.edges.map((e) => [e.id, e]))
  const groupsById = new Map(layout.ir.groups.map((g) => [g.id, g]))
  const edgeStyle = pathStyle(layout.ir, theme)
  const labelPlacement = edgeLabelPlacement(layout.ir, theme)
  const axis = layout.ir.direction === 'LR' || layout.ir.direction === 'RL' ? 'x' : 'y'
  const animating = motion && motionEnabled(layout.ir)
  const flow = flowPolicy(layout.ir)
  // One extra path per edge is cheap until it is not; past this the highlight
  // layer costs more than the explanation it buys.
  const FLOW_LAYER_LIMIT = 200
  const flowLayer = animating && layout.edges.length <= FLOW_LAYER_LIMIT
  const timing = flowTiming(layout.ir)
  const keyframes = flowKeyframes(timing.slicePercent)
  useLayoutMorph(svgRef, layout, animating)
  const motionVars = {
    '--mp-flow-name': keyframes.name,
    '--mp-flow-slice': String(timing.slicePercent),
    '--mp-flow-count': String(timing.count),
    '--mp-flow-cycle': `${timing.cycleSeconds}s`,
    '--mp-flow-step': `${timing.cycleSeconds / timing.count}s`,
  } as CSSProperties
  const cull = visible !== null && layout.nodes.length > CULL_THRESHOLD
    ? { x: visible.x - CULL_MARGIN, y: visible.y - CULL_MARGIN, width: visible.width + CULL_MARGIN * 2, height: visible.height + CULL_MARGIN * 2 }
    : null
  const dimmed = (id: string) => (focusSet ? !focusSet.has(id) : false)
  const receded = (id: string) => (emphasis ? !emphasis.nodes.has(id) : false)
  const recededEdge = (id: string) => (emphasis ? !emphasis.edges.has(id) : false)

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      className="mp-diagram"
      data-theme={theme.id}
      data-kind={layout.ir.kind}
      role="img"
      aria-label={`${layout.ir.kind} diagram with ${layout.nodes.length} nodes`}
      data-lod={lod}
      data-edge-labels={labelPlacement}
      data-motion={animating ? 'on' : undefined}
      data-emphasis={emphasis ? 'true' : undefined}
      data-focus={focusSet ? 'true' : undefined}
      style={animating ? motionVars : undefined}
      viewBox={`${layout.bounds.x} ${layout.bounds.y} ${layout.bounds.width} ${layout.bounds.height}`}
      width={layout.width}
      height={layout.height}
    >
      <title>{`${layout.ir.kind} diagram`}</title>
      <desc>{`${layout.nodes.length} nodes, ${layout.edges.length} connections${layout.groups.length ? `, ${layout.groups.length} groups` : ''}. ${layout.ir.nodes.map((n) => n.label).filter(Boolean).slice(0, 40).join(', ')}`}</desc>
      {/* Raw HTML: React would entity-escape the quotes in attribute selectors. */}
      <style dangerouslySetInnerHTML={{ __html: baseStyles(theme) + (animating ? keyframes.css : '') }} />
      <Markers theme={theme} />
      <rect className="mp-canvas" x={layout.bounds.x} y={layout.bounds.y} width={layout.bounds.width} height={layout.bounds.height} style={{ fill: 'var(--mp-color-canvas)' }} />
      <g className="mp-groups">
        {layout.groups.map((box, i) => {
          const group = groupsById.get(box.id)
          if (!group) return null
          const allDim = focusSet ? group.childNodeIds.every((id) => !focusSet.has(id)) : false
          return <Group key={box.id} group={group} box={box} theme={theme} index={i} dimmed={allDim} onToggle={onGroupToggle} />
        })}
      </g>
      <g className="mp-edges">
        {layout.edges.map((geometry, i) => {
          const edge = edgesById.get(geometry.id)
          if (!edge) return null
          if (cull && !intersects(cull, edgeBox(geometry))) return null
          const dim = focusSet ? !(focusSet.has(edge.source) && focusSet.has(edge.target)) : false
          return (
            <Edge
              key={geometry.id}
              edge={edge}
              geometry={geometry}
              theme={theme}
              style={edgeStyle}
              axis={axis}
              dimmed={dim}
              receded={recededEdge(edge.id)}
              flow={edgeFlows(edge, flow)}
              flowLayer={flowLayer}
              step={staggerIndex(i)}
              layer={timing.layers.get(edge.id) ?? 0}
            />
          )
        })}
      </g>
      <g className="mp-nodes">
        {layout.nodes.map((box, i) => {
          const node = nodesById.get(box.id)
          if (!node) return null
          if (cull && !intersects(cull, box)) return null
          const icon = node.icon ? icons[node.icon] : undefined
          return (
            <Node
              key={box.id}
              node={node}
              box={box}
              theme={theme}
              icon={icon}
              selected={box.id === selectedNodeId}
              dimmed={dimmed(box.id)}
              receded={receded(box.id)}
              hovered={box.id === hoveredId}
              matched={matchSet?.has(box.id) ?? false}
              onToggle={node.shapeHint === 'collapsed' ? onGroupToggle : undefined}
              step={staggerIndex(i)}
            />
          )
        })}
      </g>
    </svg>
  )
}
