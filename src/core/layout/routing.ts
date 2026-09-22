import type { DiagramIR } from '@/core/ir'
import type { Theme } from '@/core/theme'

export type ElkRouting = 'ORTHOGONAL' | 'POLYLINE' | 'SPLINES'
export type PathStyle = 'rounded' | 'smooth' | 'straight'

/** The adapter's hint wins (mindmaps are always curved); otherwise the theme decides. */
export function effectiveRouting(ir: DiagramIR, theme: Theme): ElkRouting {
  if (ir.layout?.edgeRouting) return ir.layout.edgeRouting
  return theme.edge.routing === 'orthogonal' ? 'ORTHOGONAL' : 'POLYLINE'
}

export function pathStyle(ir: DiagramIR, theme: Theme): PathStyle {
  if (ir.layout?.edgeRouting && ir.layout.edgeRouting !== 'ORTHOGONAL') return 'smooth'
  switch (theme.edge.routing) {
    case 'orthogonal': return 'rounded'
    case 'straight': return 'straight'
    default: return 'smooth'
  }
}

export type EdgeLabelPlacement = 'on-line' | 'beside'

/**
 * Every `%%mp: layout …` line folded into one bag. Reading only the first
 * layout directive would silently drop settings written on their own line.
 */
export function layoutAttrs(ir: DiagramIR): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const directive of ir.directives) {
    if (directive.target === 'layout') Object.assign(attrs, directive.attrs)
  }
  return attrs
}

/** `%%mp: layout edgeLabels=…` wins, then the theme, then on the line. */
export function edgeLabelPlacement(ir: DiagramIR, theme: Theme): EdgeLabelPlacement {
  const directive = layoutAttrs(ir)['edgeLabels']
  if (directive === 'beside' || directive === 'on-line') return directive
  return theme.edge.labelPlacement ?? 'on-line'
}
