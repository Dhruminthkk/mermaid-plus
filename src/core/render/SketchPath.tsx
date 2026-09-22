import { sketchPath } from './sketch'

interface Props {
  d: string
  seed: number
  fill?: string
  stroke: string
  strokeWidth: number
  roughness?: number
  className?: string
  markerEnd?: string
  markerStart?: string
  singleStroke?: boolean
}

/** Renders a path in the sketch texture: an optional hachure fill pass, then the outline. */
export function Sketch({ d, seed, fill, stroke, strokeWidth, roughness, className, markerEnd, markerStart, singleStroke }: Props) {
  const paths = sketchPath(d, { seed, fill, stroke, strokeWidth, roughness, singleStroke })
  const last = paths.length - 1
  return (
    <g className={`mp-sketch${className ? ` ${className}` : ''}`}>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          className={p.stroke === fill ? 'mp-sketch-fill' : 'mp-sketch-outline'}
          style={{ stroke: p.stroke, strokeWidth: p.strokeWidth, fill: p.fill }}
          markerEnd={i === last ? markerEnd : undefined}
          markerStart={i === last ? markerStart : undefined}
        />
      ))}
    </g>
  )
}
