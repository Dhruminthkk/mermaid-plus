import type { LaidOutDiagram } from '@/core/layout'
import type { Theme } from '@/core/theme'
import { buildStandaloneHtml, type HtmlExportOptions } from './html-export'
import { toDrawioXml } from './drawio-export'
import { exportMotionStyles } from '@/core/render'

/** Properties whose computed values are baked into exported SVG so it needs no CSS variables. */
const INLINED_PROPS = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
  'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'dominant-baseline',
  'text-transform', 'color', 'filter', 'stop-color', 'stop-opacity', 'paint-order',
] as const

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Deep-clones a live SVG with every element's computed style written inline.
 * Consumers without CSS-variable support (PDF converters, design tools) then
 * see exactly what the browser painted.
 */
export function inlineComputedStyles(live: SVGSVGElement): SVGSVGElement {
  const clone = live.cloneNode(true) as SVGSVGElement
  const liveEls = live.querySelectorAll<SVGElement>('*')
  const cloneEls = clone.querySelectorAll<SVGElement>('*')
  liveEls.forEach((el, i) => {
    const target = cloneEls[i]
    if (!target || el.tagName === 'style') return
    const computed = getComputedStyle(el)
    const decl: string[] = []
    for (const prop of INLINED_PROPS) {
      const value = computed.getPropertyValue(prop)
      if (value && value !== 'none' || (prop === 'fill' && value === 'none') || (prop === 'filter' && value === 'none')) {
        if (value) decl.push(`${prop}:${value}`)
      }
    }
    // The stylesheet is removed below, so anything hidden by a rule rather than
    // by an attribute comes back from the dead in the exported file. The
    // low-detail group chips did exactly that: invisible in the app, a
    // translucent slab across every group in every export.
    if (computed.getPropertyValue('display') === 'none') decl.push('display:none')
    if (decl.length > 0) target.setAttribute('style', decl.join(';'))
    // The inline style already carries the resolved value; a presentation
    // attribute still holding var()/color-mix() would travel with the file and
    // resolve to nothing outside the app.
    for (const prop of INLINED_PROPS) {
      const attr = target.getAttribute(prop)
      if (attr && /var\(|color-mix\(/.test(attr)) target.removeAttribute(prop)
    }
  })
  clone.querySelectorAll('style').forEach((s) => s.remove())
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', SVG_NS)
  return clone
}

/**
 * View state — semantic zoom, focus dimming, selection — belongs to the canvas,
 * not to the file. Without this an export made while zoomed out bakes in the
 * low-detail treatment: enlarged group titles and dimmed nodes.
 */
function withFullDetail<T>(live: SVGSVGElement, render: () => T): T {
  const lod = live.getAttribute('data-lod')
  const focus = live.getAttribute('data-focus')
  const marked = (attr: string) => Array.from(live.querySelectorAll(`[${attr}]`))
  const dimmed = marked('data-dimmed')
  const selected = marked('data-selected')
  const matched = marked('data-match')

  const motion = live.getAttribute('data-motion')
  live.setAttribute('data-lod', 'full')
  live.removeAttribute('data-focus')
  // A still frame of a travelling dash is not the diagram anyone meant to save.
  live.removeAttribute('data-motion')
  for (const el of [...dimmed, ...selected, ...matched]) {
    el.removeAttribute('data-dimmed')
    el.removeAttribute('data-selected')
    el.removeAttribute('data-match')
  }
  try {
    return render()
  } finally {
    if (lod === null) live.removeAttribute('data-lod')
    else live.setAttribute('data-lod', lod)
    if (focus !== null) live.setAttribute('data-focus', focus)
    if (motion !== null) live.setAttribute('data-motion', motion)
    for (const el of dimmed) el.setAttribute('data-dimmed', 'true')
    for (const el of selected) el.setAttribute('data-selected', 'true')
    for (const el of matched) el.setAttribute('data-match', 'true')
  }
}

export function svgToString(svg: SVGSVGElement): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function svgSize(svg: SVGSVGElement): { width: number; height: number } {
  const vb = svg.viewBox.baseVal
  if (vb && vb.width > 0 && vb.height > 0) return { width: vb.width, height: vb.height }
  return { width: Number(svg.getAttribute('width')) || 800, height: Number(svg.getAttribute('height')) || 600 }
}

export async function svgToPngBlob(svgString: string, width: number, height: number, scale: number, background?: string): Promise<Blob> {
  const img = new Image()
  img.decoding = 'async'
  const loaded = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('could not rasterize SVG'))
  })
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)
  await loaded

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * scale)
  canvas.height = Math.ceil(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png')
  })
}

export type ExportKind = 'svg' | 'html' | 'drawio' | 'png1' | 'png2' | 'png4' | 'pdf' | 'copy'

export interface ExportOptions {
  /** Canvas color to paint behind the diagram; omit for transparency. */
  background?: string
  /**
   * Drop the ground entirely: no background, and the diagram's own canvas rect
   * removed. Edge label plates stay — they mask the line behind a label, and a
   * label that has to be read on an unknown background still needs them.
   */
  transparent?: boolean
  filename?: string
  /** Chrome for the standalone HTML page. */
  html?: Omit<HtmlExportOptions, 'width' | 'height'>
  /** Editable-format export needs the model, not the rendered picture. */
  drawio?: { layout: LaidOutDiagram; theme: Theme; title: string }
}

/** Exports the live diagram element. Everything is derived from what is on screen. */
export async function exportDiagram(live: SVGSVGElement, kind: ExportKind, options: ExportOptions = {}): Promise<void> {
  const name = options.filename ?? 'diagram'
  const clone = withFullDetail(live, () => inlineComputedStyles(live))
  const { width, height } = svgSize(live)
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  if (options.transparent) clone.querySelector('.mp-canvas')?.remove()
  if (options.background && !options.transparent) {
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', options.background)
    clone.insertBefore(rect, clone.firstChild)
  }
  const svgString = svgToString(clone)

  switch (kind) {
    case 'svg':
      downloadBlob(new Blob([svgString], { type: 'image/svg+xml' }), `${name}.svg`)
      return
    case 'drawio': {
      if (!options.drawio) throw new Error('draw.io export needs the diagram model')
      const { layout, theme, title } = options.drawio
      downloadBlob(new Blob([toDrawioXml(layout, theme, title)], { type: 'application/xml' }), `${name}.drawio`)
      return
    }
    case 'html': {
      // The page wraps the very same SVG, so it is the same picture as every
      // other export — with pan, zoom and the source it came from. It is also
      // the one format that can move, so the flowing edges keep flowing.
      const animated = clone.cloneNode(true) as SVGSVGElement
      animated.setAttribute('data-motion', 'on')
      const motionSheet = document.createElementNS(SVG_NS, 'style')
      const timingVar = (name: string, fallback: number) =>
        parseFloat(getComputedStyle(live).getPropertyValue(name)) || fallback
      motionSheet.textContent = exportMotionStyles({
        slicePercent: timingVar('--mp-flow-slice', 100),
        cycleSeconds: timingVar('--mp-flow-cycle', 2.4),
        count: timingVar('--mp-flow-count', 1),
      })
      animated.insertBefore(motionSheet, animated.firstChild)
      const page = buildStandaloneHtml(svgToString(animated).replace(/^<\?xml[^>]*\?>\s*/, ''), {
        title: options.html?.title ?? name,
        background: options.transparent ? 'transparent' : options.html?.background ?? options.background ?? '#ffffff',
        foreground: options.html?.foreground ?? '#111827',
        muted: options.html?.muted ?? '#6b7280',
        border: options.html?.border ?? '#e5e7eb',
        fontFamily: options.html?.fontFamily ?? 'system-ui, sans-serif',
        source: options.html?.source,
        width,
        height,
      })
      downloadBlob(new Blob([page], { type: 'text/html;charset=utf-8' }), `${name}.html`)
      return
    }
    case 'png1':
    case 'png2':
    case 'png4': {
      const scale = Number(kind.slice(3))
      downloadBlob(await svgToPngBlob(svgString, width, height, scale, options.transparent ? undefined : options.background), `${name}@${scale}x.png`)
      return
    }
    case 'copy': {
      const blob = await svgToPngBlob(svgString, width, height, 2, options.transparent ? undefined : options.background)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return
    }
    case 'pdf': {
      const [{ jsPDF }] = await Promise.all([import('jspdf'), import('svg2pdf.js')])
      const doc = new jsPDF({ unit: 'px', format: [width, height], orientation: width >= height ? 'landscape' : 'portrait', hotfixes: ['px_scaling'] })
      await doc.svg(clone, { x: 0, y: 0, width, height })
      doc.save(`${name}.pdf`)
      return
    }
  }
}
