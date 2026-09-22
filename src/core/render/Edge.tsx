import type { CSSProperties } from 'react'
import type { ArrowKind, IREdge } from '@/core/ir'
import type { LaidOutEdge, PathStyle, Point } from '@/core/layout'
import { roundedPath, smoothPath, splitLabelLines, straightPath } from '@/core/layout'
import type { Theme } from '@/core/theme'
import { sketchSeed } from './sketch'
import { Sketch } from './SketchPath'

interface Props {
  edge: IREdge
  geometry: LaidOutEdge
  theme: Theme
  style: PathStyle
  /** Layout flow axis, for curved links. */
  axis: 'x' | 'y'
  dimmed?: boolean
  /** Outside the hovered neighbourhood. */
  receded?: boolean
  /** Carries a travelling highlight while motion is on. */
  flow?: boolean
  /** Draw the overlay the highlight rides on. Off for very large diagrams. */
  flowLayer?: boolean
  /** Entrance stagger step. */
  step?: number
  /** Slot in the flow cycle: how far this edge's source is from an entry point. */
  layer?: number
}

function markerUrl(kind: ArrowKind | undefined): string | undefined {
  return kind && kind !== 'none' ? `url(#mp-m-${kind})` : undefined
}

/** A point `distance` along the polyline from one end, for endpoint labels. */
function alongFrom(points: Point[], fromEnd: boolean, distance: number): Point {
  const pts = fromEnd ? [...points].reverse() : points
  let remaining = distance
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    if (len >= remaining) {
      const t = len === 0 ? 0 : remaining / len
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
    remaining -= len
  }
  return pts[pts.length - 1]!
}

export function Edge({ edge, geometry, theme, style, axis, dimmed = false, receded = false, flow = false, flowLayer = false, step = 0, layer = 0 }: Props) {
  const label = geometry.labelBox
  const d =
    style === 'rounded' ? roundedPath(geometry.points, theme.edge.cornerRadius)
    : style === 'smooth' ? smoothPath(geometry.points, axis)
    : straightPath(geometry.points)
  const sketch = theme.texture === 'sketch'

  const endKind: ArrowKind = edge.arrowEnd ?? 'arrow'
  const startKind: ArrowKind = edge.arrowStart ?? (edge.semantics === 'bidirectional' ? 'arrow' : 'none')
  const markerEnd = markerUrl(endKind)
  const markerStart = markerUrl(startKind)

  // Far enough along the edge to clear the node it belongs to.
  const ENDPOINT_LABEL_OFFSET = 26
  const startLabelAt = edge.labelStart ? alongFrom(geometry.points, false, ENDPOINT_LABEL_OFFSET) : null
  const endLabelAt = edge.labelEnd ? alongFrom(geometry.points, true, ENDPOINT_LABEL_OFFSET) : null

  return (
    <g className="mp-edge" data-edge-id={edge.id} data-edge-style={edge.style} data-semantics={edge.semantics} data-dimmed={dimmed ? 'true' : undefined} data-receded={receded ? 'true' : undefined} data-weight={edge.meta?.['weight']} data-flow={flow ? 'true' : undefined} data-layer={layer} style={{ '--mp-i': step, '--mp-d': layer } as CSSProperties}>
      {sketch ? (
        <Sketch
          className="mp-edge-path-sketch"
          d={d}
          seed={sketchSeed(edge.id)}
          stroke="var(--mp-color-edge)"
          strokeWidth={edge.style === 'thick' ? theme.geometry.strokeWidth * 2 : theme.geometry.strokeWidth}
          roughness={0.7}
          singleStroke
          markerEnd={markerEnd}
          markerStart={markerStart}
        />
      ) : (
        <path className="mp-edge-path" data-edge-style={edge.style} d={d} markerEnd={markerEnd} markerStart={markerStart} />
      )}
      {/* pathLength normalises every edge to 100 units, so one keyframe drives
          the highlight along a short link and a long one at the same speed. */}
      {flowLayer && <path className="mp-edge-flow" d={d} pathLength={100} />}
      {edge.label && label && (() => {
        // Labels carry mermaid's <br> markup; the plate was already measured for
        // the wrapped height, so lines divide it evenly.
        const lines = splitLabelLines(edge.label)
        const lineHeight = label.height / lines.length
        return (
          <g className="mp-edge-label-group">
            <rect className="mp-edge-label-plate" x={label.x - 4} y={label.y - 2} width={label.width + 8} height={label.height + 4} rx={4} />
            <text className="mp-edge-label" x={label.x + label.width / 2} y={label.y}>
              {lines.map((line, i) => (
                <tspan key={i} x={label.x + label.width / 2} y={label.y + (i + 0.5) * lineHeight}>{line}</tspan>
              ))}
            </text>
          </g>
        )
      })()}
      {startLabelAt && (
        <text className="mp-edge-endlabel" x={startLabelAt.x} y={startLabelAt.y - 9}>{edge.labelStart}</text>
      )}
      {endLabelAt && (
        <text className="mp-edge-endlabel" x={endLabelAt.x} y={endLabelAt.y - 9}>{edge.labelEnd}</text>
      )}
    </g>
  )
}
