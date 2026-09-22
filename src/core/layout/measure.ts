import type { IRNode } from '@/core/ir'
import type { Theme } from '@/core/theme'
import { CYLINDER_CAP, isRoundShape } from '@/core/render/shapes'
import { measureTextWidth, type FontSpec } from './text-metrics'

const LINE_HEIGHT = 1.35
const MIN_NODE_WIDTH = 64
const MIN_NODE_HEIGHT = 36
const LINE_BREAK = /<br\s*\/?>|\n/i

export function splitLabelLines(text: string): string[] {
  const lines = text.split(LINE_BREAK).map((l) => l.trim())
  return lines.length === 0 ? [''] : lines
}

/** The face node and edge labels are drawn in. */
export function labelFont(theme: Theme): FontSpec {
  return { size: theme.type.scale[1], family: theme.type.family, weight: theme.type.weightLabel }
}

/** The monospace face compartment rows are drawn in. */
export function compartmentFont(theme: Theme): FontSpec {
  return { size: Math.round(theme.type.scale[1] * 0.85), family: theme.type.familyMono, weight: 400 }
}

export function measureLabel(text: string, theme: Theme, font: FontSpec = labelFont(theme)): { width: number; height: number } {
  const lines = splitLabelLines(text)
  return {
    width: Math.max(...lines.map((line) => measureTextWidth(line, font)), 0),
    height: Math.ceil(font.size * LINE_HEIGHT) * lines.length,
  }
}

/** Icon glyph size and the gap between it and the label, both from the label font size. */
export function iconMetrics(theme: Theme): { size: number; gap: number } {
  const size = Math.round(theme.type.scale[1] * 1.4)
  return { size, gap: Math.round(size * 0.45) }
}

/** Pseudo-states and connectors have fixed sizes independent of their (empty) label. */
const FIXED_SHAPES: Record<string, { width: number; height: number }> = {
  stateStart: { width: 18, height: 18 },
  stateEnd: { width: 24, height: 24 },
  fork: { width: 64, height: 8 },
  join: { width: 64, height: 8 },
  choice: { width: 36, height: 36 },
}

export interface CompartmentMetrics {
  width: number
  height: number
  /** Height of each section including its padding, in order. */
  sectionHeights: number[]
  /** Line height used for header (index 0) and body sections. */
  headerLine: number
  bodyLine: number
  padX: number
  padY: number
}

/**
 * Sizes a stacked-section node (class, ER, requirement, C4). The header uses
 * the label size; bodies use the small size. Empty sections collapse.
 */
export function measureCompartments(compartments: string[][], theme: Theme, iconSlot = 0): CompartmentMetrics {
  const headerFont = { ...labelFont(theme), weight: theme.type.weightTitle }
  const bodyFont = compartmentFont(theme)
  const headerLine = Math.ceil(headerFont.size * LINE_HEIGHT)
  const bodyLine = Math.ceil(bodyFont.size * LINE_HEIGHT)
  const padX = theme.geometry.nodePaddingX
  const padY = Math.round(theme.geometry.nodePaddingY * 0.7)

  let width = 0
  const sectionHeights = compartments.map((lines, i) => {
    const font = i === 0 ? headerFont : bodyFont
    const line = i === 0 ? headerLine : bodyLine
    for (const text of lines) {
      width = Math.max(width, measureTextWidth(text, font) + (i === 0 ? iconSlot : 0))
    }
    return lines.length === 0 ? 0 : lines.length * line + padY * 2
  })

  return {
    width: Math.max(MIN_NODE_WIDTH, width + padX * 2),
    height: Math.max(MIN_NODE_HEIGHT, sectionHeights.reduce((a, b) => a + b, 0)),
    sectionHeights,
    headerLine,
    bodyLine,
    padX,
    padY,
  }
}

/**
 * Horizontal room a shape's own geometry eats on each side: a hexagon's points,
 * a stadium's end caps, a parallelogram's skew. Content is laid out between
 * these, so both measurement and rendering must agree on the figure.
 */
/**
 * Vertical room a shape's own outline takes from the label. A cylinder's top cap
 * is the case that matters: centring text in the full box puts it a pixel below
 * the cap curve. The bottom cap bulges away from the centre, so only the top
 * needs reserving.
 */
export function shapeVerticalInsets(node: IRNode): { top: number; bottom: number } {
  if (node.archetype === 'database') return { top: CYLINDER_CAP * 2, bottom: 0 }
  return { top: 0, bottom: 0 }
}

export function shapeSideInset(node: IRNode, height: number, theme: Theme): number {
  if (node.archetype === 'queue') return Math.min(height / 2, 22)
  if (node.archetype === 'user' || node.shapeHint === 'stadium') return Math.round(height * 0.28)
  if (node.shapeHint === 'lean_right' || node.shapeHint === 'lean_left'
    || node.shapeHint === 'trapezoid' || node.shapeHint === 'inv_trapezoid') {
    return Math.min(Math.round(height * 0.4), 26)
  }
  if (node.archetype === 'note') return Math.round(theme.geometry.nodePaddingX * 0.5)
  return 0
}

export function measureNode(node: IRNode, theme: Theme): { width: number; height: number } {
  const fixed = node.shapeHint ? FIXED_SHAPES[node.shapeHint] : undefined
  if (fixed) return fixed

  if (node.compartments) {
    const icon = node.icon ? iconMetrics(theme) : null
    const { width, height } = measureCompartments(node.compartments, theme, icon ? icon.size + icon.gap : 0)
    return { width, height }
  }

  const label = measureLabel(node.label, theme)
  const { nodePaddingX, nodePaddingY } = theme.geometry
  const icon = node.icon ? iconMetrics(theme) : null
  const iconSlot = icon ? icon.size + icon.gap : 0

  const vertical = shapeVerticalInsets(node)
  let height = Math.max(MIN_NODE_HEIGHT, label.height + nodePaddingY * 2) + vertical.top + vertical.bottom
  let width = Math.max(MIN_NODE_WIDTH, label.width + iconSlot + nodePaddingX * 2 + shapeSideInset(node, height, theme) * 2)

  if (node.archetype === 'decision') {
    // A diamond's inscribed rectangle is half its bounding box in each axis.
    width = Math.ceil(width * 1.6)
    height = Math.ceil(height * 1.6)
  } else if (isRoundShape(node.shapeHint)) {
    // Circles need a square box, sized so the label fits the inscribed square.
    const side = Math.ceil(Math.max(width, height) * 1.25)
    width = side
    height = side
  }

  return { width, height }
}

/**
 * Group titles are drawn smaller, bolder, uppercased and tracked out, so the
 * label font measures the wrong string in the wrong face. The chip behind the
 * title has to be measured the way the title is actually painted or the text
 * runs out past its right edge.
 */
export const GROUP_TITLE_SIZE_RATIO = 0.82
export const GROUP_TITLE_TRACKING = 0.06
/** How much bigger the title gets when the diagram drops to low detail. */
export const GROUP_TITLE_LOD_SCALE = 2.2 / GROUP_TITLE_SIZE_RATIO

export function groupTitleFont(theme: Theme, scale = 1): FontSpec {
  return {
    size: theme.type.scale[1] * GROUP_TITLE_SIZE_RATIO * scale,
    family: theme.type.family,
    weight: theme.type.weightTitle,
  }
}

/** Width of a group title as painted, tracking included. */
export function measureGroupTitle(text: string, theme: Theme, scale = 1): number {
  const font = groupTitleFont(theme, scale)
  const shown = text.toUpperCase()
  // Tracking is inserted after every glyph including the last, but that trailing
  // gap is not ink, so it does not count towards the chip's right padding.
  const tracking = GROUP_TITLE_TRACKING * font.size
  return measureTextWidth(shown, font) + tracking * Math.max(shown.length - 1, 0)
}
