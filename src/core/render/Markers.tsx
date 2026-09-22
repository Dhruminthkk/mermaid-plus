import type { Archetype } from '@/core/ir'
import type { Theme } from '@/core/theme'

const ARCHETYPES: Archetype[] = [
  'service', 'database', 'queue', 'storage', 'user', 'external', 'process', 'decision', 'note', 'default',
]

/**
 * Flat themes (Blueprint, Contrast, Slate) say so through their elevation
 * tokens; where a theme embraces depth, node fills get a light-from-above
 * gradient rather than a flat wash.
 */
export function usesGradient(theme: Theme): boolean {
  return theme.texture === 'crisp' && theme.depth.elevation[1] !== 'none'
}

/**
 * One marker per ArrowKind. All point along +x with the tip at refX so the
 * line's endpoint (on the node border) is the tip; orient="auto-start-reverse"
 * flips them for marker-start. Hollow heads are filled with the canvas color to
 * mask the line beneath.
 */
export function Markers({ theme }: { theme: Theme }) {
  const edge = 'var(--mp-color-edge)'
  const canvas = 'var(--mp-color-canvas)'
  const common = { markerUnits: 'userSpaceOnUse' as const, orient: 'auto-start-reverse' as const }
  const w = Math.max(1, theme.geometry.strokeWidth)

  return (
    <defs>
      {usesGradient(theme) && ARCHETYPES.map((a) => (
        <linearGradient key={a} id={`mp-fill-${a}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`color-mix(in srgb, var(--mp-arch-${a}-fill) 88%, white)`} />
          <stop offset="100%" stopColor={`var(--mp-arch-${a}-fill)`} />
        </linearGradient>
      ))}
      <marker id="mp-m-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" {...common}>
        {theme.edge.arrowhead === 'open' ? (
          <path d="M 1 1 L 9 5 L 1 9" style={{ fill: 'none', stroke: edge, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
        ) : theme.edge.arrowhead === 'circle' ? (
          <circle cx="5" cy="5" r="3.5" style={{ fill: edge }} />
        ) : theme.edge.arrowhead === 'diamond' ? (
          <path d="M 1 5 L 5 1 L 9 5 L 5 9 Z" style={{ fill: edge }} />
        ) : (
          <path d="M 0 0 L 10 5 L 0 10 Z" style={{ fill: edge }} />
        )}
      </marker>
      <marker id="mp-m-arrow-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" {...common}>
        <path d="M 1 1 L 9 5 L 1 9" style={{ fill: 'none', stroke: edge, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
      </marker>
      <marker id="mp-m-triangle-open" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" {...common}>
        <path d="M 1 1 L 13 7 L 1 13 Z" style={{ fill: canvas, stroke: edge, strokeWidth: w, strokeLinejoin: 'round' }} />
      </marker>
      <marker id="mp-m-diamond-open" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" {...common}>
        <path d="M 1 5 L 8 1 L 15 5 L 8 9 Z" style={{ fill: canvas, stroke: edge, strokeWidth: w, strokeLinejoin: 'round' }} />
      </marker>
      <marker id="mp-m-diamond-filled" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" {...common}>
        <path d="M 1 5 L 8 1 L 15 5 L 8 9 Z" style={{ fill: edge, stroke: edge, strokeWidth: w, strokeLinejoin: 'round' }} />
      </marker>
      {/* Crow's foot family: drawn so the bar/foot sits just before the tip. */}
      <marker id="mp-m-one" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" {...common}>
        <path d="M 6 1 L 6 11 M 0 6 L 11 6" style={{ fill: 'none', stroke: edge, strokeWidth: w }} />
      </marker>
      <marker id="mp-m-zero-or-one" viewBox="0 0 18 12" refX="17" refY="6" markerWidth="18" markerHeight="12" {...common}>
        <circle cx="5" cy="6" r="3.5" style={{ fill: canvas, stroke: edge, strokeWidth: w }} />
        <path d="M 12 1 L 12 11 M 8.5 6 L 17 6" style={{ fill: 'none', stroke: edge, strokeWidth: w }} />
      </marker>
      <marker id="mp-m-many" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" {...common}>
        <path d="M 0 6 L 11 6 M 3 6 L 11 1 M 3 6 L 11 11" style={{ fill: 'none', stroke: edge, strokeWidth: w }} />
      </marker>
      <marker id="mp-m-one-or-more" viewBox="0 0 16 12" refX="15" refY="6" markerWidth="16" markerHeight="12" {...common}>
        <path d="M 4 1 L 4 11 M 0 6 L 15 6 M 7 6 L 15 1 M 7 6 L 15 11" style={{ fill: 'none', stroke: edge, strokeWidth: w }} />
      </marker>
      <marker id="mp-m-zero-or-more" viewBox="0 0 20 12" refX="19" refY="6" markerWidth="20" markerHeight="12" {...common}>
        <circle cx="5" cy="6" r="3.5" style={{ fill: canvas, stroke: edge, strokeWidth: w }} />
        <path d="M 8.5 6 L 19 6 M 11 6 L 19 1 M 11 6 L 19 11" style={{ fill: 'none', stroke: edge, strokeWidth: w }} />
      </marker>
    </defs>
  )
}
