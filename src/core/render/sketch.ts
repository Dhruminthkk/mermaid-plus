import rough from 'roughjs'
import type { Options } from 'roughjs/bin/core'

export interface SketchPath {
  d: string
  stroke: string
  strokeWidth: number
  fill: string
}

const generator = rough.generator()

/** Stable per-element seed so a sketch never jitters between re-renders. */
export function sketchSeed(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 2147483647 || 1
}

/** Axis-aligned rounded rectangle as a path, for shapes that would otherwise be <rect>. */
export function roundedRectPath(w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  if (rr === 0) return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
  return [
    `M ${rr} 0`, `L ${w - rr} 0`, `Q ${w} 0 ${w} ${rr}`, `L ${w} ${h - rr}`, `Q ${w} ${h} ${w - rr} ${h}`,
    `L ${rr} ${h}`, `Q 0 ${h} 0 ${h - rr}`, `L 0 ${rr}`, `Q 0 0 ${rr} 0`, `Z`,
  ].join(' ')
}

interface SketchOptions {
  seed: number
  fill?: string
  stroke: string
  strokeWidth: number
  roughness?: number
  fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch'
  /** One wobbly stroke instead of rough's default double stroke (edges). */
  singleStroke?: boolean
}

/**
 * Hand-drawn rendition of an SVG path. Colors pass straight through, so CSS
 * custom properties work as fill/stroke values.
 */
export function sketchPath(d: string, options: SketchOptions): SketchPath[] {
  const roughOptions: Options = {
    seed: options.seed,
    roughness: options.roughness ?? 1,
    bowing: 0.8,
    stroke: options.stroke,
    strokeWidth: options.strokeWidth,
    fill: options.fill,
    fillStyle: options.fillStyle ?? 'hachure',
    hachureGap: 5,
    hachureAngle: -41,
    fillWeight: Math.max(0.5, options.strokeWidth / 2),
    disableMultiStroke: options.singleStroke ?? false,
  }
  const drawable = generator.path(d, roughOptions)
  return generator.toPaths(drawable).map((p) => ({
    d: p.d,
    stroke: p.stroke,
    strokeWidth: p.strokeWidth,
    fill: p.fill ?? 'none',
  }))
}
