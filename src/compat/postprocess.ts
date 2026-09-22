import type { Theme } from '@/core/theme'
import { cssVarsToStyle, themeToCssVars } from '@/core/theme'

export interface Tier2Svg {
  svg: string
  width: number
  height: number
}

/** Reads width/height from the viewBox, falling back to width/height attributes. */
export function svgSize(svg: string): { width: number; height: number } {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]?.trim().split(/[\s,]+/).map(Number)
  if (viewBox && viewBox.length === 4 && viewBox.every((n) => Number.isFinite(n))) {
    return { width: Math.ceil(viewBox[2]!), height: Math.ceil(viewBox[3]!) }
  }
  const w = Number(/\swidth="([\d.]+)/.exec(svg)?.[1])
  const h = Number(/\sheight="([\d.]+)/.exec(svg)?.[1])
  return { width: Number.isFinite(w) ? Math.ceil(w) : 0, height: Number.isFinite(h) ? Math.ceil(h) : 0 }
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Room around measured content, matching the tier-1 renderer's padding. */
const FIT_PADDING = 12

/**
 * Replaces mermaid's HTML-in-SVG labels with native <text>. Browsers refuse to
 * rasterize <foreignObject> when an SVG is drawn into a canvas, so anything left
 * as HTML would vanish from PNG and PDF export. `htmlLabels: false` covers most
 * diagram types; journey and any future ones are caught here.
 */
function replaceForeignObjects(root: SVGSVGElement): void {
  for (const fo of Array.from(root.querySelectorAll('foreignObject'))) {
    const text = (fo.textContent ?? '').replace(/\s+/g, ' ').trim()
    const num = (name: string): number => Number(fo.getAttribute(name) ?? 0) || 0
    const x = num('x')
    const y = num('y')
    const width = num('width')
    const height = num('height')
    const label = document.createElementNS(SVG_NS, 'text')
    label.setAttribute('class', 'mp-fo-label')
    label.setAttribute('x', String(x + width / 2))
    label.setAttribute('y', String(y + height / 2))
    label.textContent = text
    fo.replaceWith(label)
  }
}

/**
 * Re-derives the viewBox from what mermaid actually drew. Several diagram types
 * report a viewBox that does not contain their content — gantt can place row
 * labels thousands of units left of the origin — so the rendered geometry is
 * measured and becomes the viewBox. Browser only: it needs layout.
 */
export function fitToContent(svg: string, fallback: { width: number; height: number }): Tier2Svg {
  if (typeof document === 'undefined') return { svg, ...fallback }
  const host = document.createElement('div')
  host.setAttribute('style', 'position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none')
  host.innerHTML = svg
  document.body.appendChild(host)
  try {
    const el = host.querySelector('svg')
    if (!el) return { svg, ...fallback }
    replaceForeignObjects(el)
    const b = el.getBBox()
    if (!Number.isFinite(b.width) || b.width <= 0 || !Number.isFinite(b.height) || b.height <= 0) {
      return { svg, ...fallback }
    }
    const x = Math.floor(b.x) - FIT_PADDING
    const y = Math.floor(b.y) - FIT_PADDING
    const width = Math.ceil(b.x + b.width) + FIT_PADDING - x
    const height = Math.ceil(b.y + b.height) + FIT_PADDING - y
    el.setAttribute('viewBox', `${x} ${y} ${width} ${height}`)
    el.setAttribute('width', String(width))
    el.setAttribute('height', String(height))
    return { svg: el.outerHTML, width, height }
  } catch {
    return { svg, ...fallback }
  } finally {
    host.remove()
  }
}

/**
 * Makes mermaid's SVG behave like ours: explicit pixel size (so the viewport
 * can scale it), our theme tokens as custom properties, and typography overrides.
 */
export function postprocessMermaidSvg(rawSvg: string, theme: Theme): Tier2Svg {
  const { width, height } = svgSize(rawSvg)
  const vars = cssVarsToStyle(themeToCssVars(theme))
  const overrides = [
    `:root,svg{${vars}}`,
    `svg{font-family:var(--mp-font-family)!important;background:var(--mp-color-canvas);text-rendering:geometricPrecision}`,
    `.messageText,.loopText,.noteText,.labelText,text{font-family:var(--mp-font-family)!important}`,
    `.edgeLabel{background-color:var(--mp-color-canvas)}`,

    // Pie: mermaid centres a slice's percentage on the arc centroid, which for a
    // thin slice lands half outside it. An outline keeps the label legible on
    // both the slice and the canvas.
    // mermaid scopes its own rules by the diagram's id, so these overrides have
    // to win on weight rather than order.
    `text.slice{paint-order:stroke;stroke:var(--mp-color-text)!important;stroke-width:2.5px!important;stroke-linejoin:round;fill:var(--mp-color-canvas)!important}`,
    `circle.pieOuterCircle{stroke:var(--mp-color-stroke)!important}`,

    // Packet and architecture expose no theme variables of their own.
    `rect.packetBlock{fill:var(--mp-arch-default-fill)!important;stroke:var(--mp-color-stroke)!important}`,
    `text.packetLabel{fill:var(--mp-arch-default-text)!important}`,
    `text.packetByte,text.packetTitle{fill:var(--mp-color-text-muted)!important}`,
    `.architecture-groups rect.node-bkg{stroke:var(--mp-color-stroke)!important}`,
    `.architecture-edges path.edge{stroke:var(--mp-color-edge)!important}`,
    `.architecture-service text,.architecture-groups text{fill:var(--mp-color-text)!important}`,

    `.mp-fo-label{fill:var(--mp-color-text);font-family:var(--mp-font-family);font-size:var(--mp-font-size-label);text-anchor:middle;dominant-baseline:central}`,

    // XY chart and gantt paint opaque or near-black chrome that ignores the theme.
    `g.main > rect.background{fill:var(--mp-color-canvas)!important}`,
    `.grid path.domain,.grid line{stroke:var(--mp-color-stroke)!important}`,
    `.grid .tick text{fill:var(--mp-color-text-muted)!important}`,
  ].join('')

  let svg = rawSvg
    .replace(/\sstyle="[^"]*max-width:[^"]*"/, '')
    .replace(/\swidth="100%"/, ` width="${width}"`)
  if (!/\swidth="/.test(svg)) svg = svg.replace('<svg', `<svg width="${width}"`)
  if (!/\sheight="/.test(svg)) svg = svg.replace('<svg', `<svg height="${height}"`)
  svg = svg.replace(/<svg([^>]*)>/, `<svg$1 class="mp-diagram mp-tier2" data-theme="${theme.id}">`)
    .replace(/<svg([^>]*)class="([^"]*)"([^>]*)class="mp-diagram mp-tier2"/, '<svg$1class="$2 mp-diagram mp-tier2"$3')
  svg = svg.replace(/(<svg[^>]*>)/, `$1<style>${overrides}</style>`)

  return { svg, width, height }
}
