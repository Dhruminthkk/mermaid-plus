import type { Archetype } from '@/core/ir'

function f(n: number): string {
  return String(Math.round(n * 100) / 100)
}

/**
 * Depth of a cylinder's end cap. Fixed rather than proportional so
 * `shapeVerticalInsets` can reserve room for it without the two definitions
 * chasing each other through the height calculation.
 */
export const CYLINDER_CAP = 7

function cylinder(w: number, h: number): string {
  const ry = Math.min(CYLINDER_CAP, h * 0.22)
  return [
    `M 0 ${f(ry)}`,
    `A ${f(w / 2)} ${f(ry)} 0 0 1 ${f(w)} ${f(ry)}`,
    `L ${f(w)} ${f(h - ry)}`,
    `A ${f(w / 2)} ${f(ry)} 0 0 1 0 ${f(h - ry)}`,
    `Z`,
    `M 0 ${f(ry)}`,
    `A ${f(w / 2)} ${f(ry)} 0 0 0 ${f(w)} ${f(ry)}`,
    `Z`,
  ].join(' ')
}

function hexagon(w: number, h: number): string {
  const inset = Math.min(h / 2, w * 0.18)
  return `M ${f(inset)} 0 L ${f(w - inset)} 0 L ${f(w)} ${f(h / 2)} L ${f(w - inset)} ${f(h)} L ${f(inset)} ${f(h)} L 0 ${f(h / 2)} Z`
}

function diamond(w: number, h: number): string {
  return `M ${f(w / 2)} 0 L ${f(w)} ${f(h / 2)} L ${f(w / 2)} ${f(h)} L 0 ${f(h / 2)} Z`
}

function note(w: number, h: number): string {
  const fold = Math.min(12, h / 3)
  const outline = `M 0 0 L ${f(w - fold)} 0 L ${f(w)} ${f(fold)} L ${f(w)} ${f(h)} L 0 ${f(h)} Z`
  const corner = `M ${f(w - fold)} 0 L ${f(w - fold)} ${f(fold)} L ${f(w)} ${f(fold)} Z`
  return `${outline} ${corner}`
}

function stadium(w: number, h: number): string {
  const r = h / 2
  return `M ${f(r)} 0 L ${f(w - r)} 0 A ${f(r)} ${f(r)} 0 0 1 ${f(w - r)} ${f(h)} L ${f(r)} ${f(h)} A ${f(r)} ${f(r)} 0 0 1 ${f(r)} 0 Z`
}

function ellipse(w: number, h: number): string {
  const rx = w / 2
  const ry = h / 2
  return `M 0 ${f(ry)} A ${f(rx)} ${f(ry)} 0 1 0 ${f(w)} ${f(ry)} A ${f(rx)} ${f(ry)} 0 1 0 0 ${f(ry)} Z`
}

function doubleEllipse(w: number, h: number): string {
  const inset = 4
  const inner = `M ${f(inset)} ${f(h / 2)} A ${f(w / 2 - inset)} ${f(h / 2 - inset)} 0 1 0 ${f(w - inset)} ${f(h / 2)} A ${f(w / 2 - inset)} ${f(h / 2 - inset)} 0 1 0 ${f(inset)} ${f(h / 2)} Z`
  return `${ellipse(w, h)} ${inner}`
}

function subroutine(w: number, h: number): string {
  const bar = 8
  return `M 0 0 L ${f(w)} 0 L ${f(w)} ${f(h)} L 0 ${f(h)} Z M ${f(bar)} 0 L ${f(bar)} ${f(h)} Z M ${f(w - bar)} 0 L ${f(w - bar)} ${f(h)} Z`
}

function parallelogram(w: number, h: number, leanRight: boolean): string {
  const skew = Math.min(h * 0.4, w * 0.2)
  return leanRight
    ? `M ${f(skew)} 0 L ${f(w)} 0 L ${f(w - skew)} ${f(h)} L 0 ${f(h)} Z`
    : `M 0 0 L ${f(w - skew)} 0 L ${f(w)} ${f(h)} L ${f(skew)} ${f(h)} Z`
}

function trapezoid(w: number, h: number, inverted: boolean): string {
  const skew = Math.min(h * 0.4, w * 0.2)
  return inverted
    ? `M 0 0 L ${f(w)} 0 L ${f(w - skew)} ${f(h)} L ${f(skew)} ${f(h)} Z`
    : `M ${f(skew)} 0 L ${f(w - skew)} 0 L ${f(w)} ${f(h)} L 0 ${f(h)} Z`
}

/** Geometry implied by a mermaid shape token when the archetype does not dictate one. */
function hintPath(shapeHint: string | undefined, w: number, h: number): string | null {
  switch (shapeHint) {
    case 'stadium':
    case 'mindmapCircle':
      return stadium(w, h)
    case 'circle':
      return ellipse(w, h)
    case 'doublecircle':
      return doubleEllipse(w, h)
    case 'subroutine':
      return subroutine(w, h)
    case 'lean_right':
      return parallelogram(w, h, true)
    case 'lean_left':
      return parallelogram(w, h, false)
    case 'trapezoid':
      return trapezoid(w, h, false)
    case 'inv_trapezoid':
      return trapezoid(w, h, true)
    case 'cylinder':
      return cylinder(w, h)
    case 'hexagon':
      return hexagon(w, h)
    case 'diamond':
      return diamond(w, h)
    case 'odd':
      return note(w, h)
    default:
      return null
  }
}

/**
 * Returns an SVG path in local (0,0)-(w,h) space, or null to use a rounded rect.
 * The archetype's shape language wins; otherwise mermaid's shape token is honored.
 */
export function shapePath(archetype: Archetype, shapeHint: string | undefined, width: number, height: number): string | null {
  switch (archetype) {
    case 'database':
      return cylinder(width, height)
    case 'queue':
      return hexagon(width, height)
    case 'decision':
      return diamond(width, height)
    case 'note':
      return note(width, height)
    case 'user':
      return stadium(width, height)
    default:
      return hintPath(shapeHint, width, height)
  }
}

/** Shapes whose bounding box should be square so the geometry reads correctly. */
export function isRoundShape(shapeHint: string | undefined): boolean {
  return shapeHint === 'circle' || shapeHint === 'doublecircle'
}
