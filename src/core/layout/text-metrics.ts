/**
 * Text width for layout. Character-count estimates cannot tell "WWWW" from
 * "iiii" — they overflow the first and waste space on the second — so real
 * metrics are used wherever a canvas exists, which is every browser path.
 * Node (tests, and any future CLI) falls back to the estimate.
 */

/** Average glyph advance as a fraction of font size, for the fallback path. */
const CHAR_ADVANCE_EM = 0.58

type Measurer = Pick<CanvasRenderingContext2D, 'font' | 'measureText'>

export interface FontSpec {
  size: number
  family: string
  weight?: number
}

function fontString(font: FontSpec): string {
  return `${font.weight ?? 400} ${font.size}px ${font.family}`
}

let context: Measurer | null | undefined
const cache = new Map<string, number>()

/**
 * OffscreenCanvas is tried first because it exists in every browser we target
 * and, unlike a DOM canvas, does not make jsdom log a "not implemented" error
 * on the way to the fallback.
 */
function measurementContext(): Measurer | null {
  if (context !== undefined) return context
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      context = new OffscreenCanvas(1, 1).getContext('2d') as Measurer | null
    } else if (typeof document !== 'undefined' && !/jsdom/i.test(navigator.userAgent ?? '')) {
      context = document.createElement('canvas').getContext('2d')
    } else {
      context = null
    }
  } catch {
    context = null
  }
  return context
}

/** Only needed by tests that switch fonts; measurements are keyed by font. */
export function clearTextMetricsCache(): void {
  cache.clear()
}

export function measureTextWidth(text: string, font: FontSpec): number {
  if (text.length === 0) return 0
  const key = `${fontString(font)} ${text}`
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const ctx = measurementContext()
  let width: number
  if (ctx) {
    ctx.font = fontString(font)
    width = ctx.measureText(text).width
  } else {
    width = text.length * font.size * CHAR_ADVANCE_EM
  }
  // A whole pixel of slack keeps sub-pixel rounding from clipping a glyph.
  width = Math.ceil(width) + 1
  cache.set(key, width)
  return width
}
