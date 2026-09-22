import mermaid from 'mermaid'
import type { Theme } from '@/core/theme'
import { mermaidThemeVariables } from './theme-variables'
import { fitToContent, postprocessMermaidSvg, type Tier2Svg } from './postprocess'

export { mermaidThemeVariables } from './theme-variables'
export { postprocessMermaidSvg, svgSize, fitToContent } from './postprocess'
export type { Tier2Svg } from './postprocess'

let counter = 0

/**
 * Tier 2: let mermaid.js draw diagrams whose layout is their specification,
 * wearing our theme. Browser only — mermaid.render needs a real DOM.
 */
export async function renderTier2(source: string, theme: Theme): Promise<Tier2Svg> {
  mermaid.initialize({
    startOnLoad: false,
    suppressErrorRendering: true,
    maxEdges: 20000,
    maxTextSize: 500000,
    theme: 'base',
    themeVariables: mermaidThemeVariables(theme),
    fontFamily: theme.type.family,
    // Native <text>, never <foreignObject>: HTML inside SVG does not rasterize
    // when the diagram is drawn into a canvas, so PNG and PDF export would lose
    // every label on the diagram types that default to HTML labels.
    htmlLabels: false,
    flowchart: { htmlLabels: false },
    class: { htmlLabels: false },
    state: { htmlLabels: false },
    sequence: { useMaxWidth: false },
    gantt: { useMaxWidth: false },
    pie: { useMaxWidth: false },
    journey: { useMaxWidth: false },
    timeline: { useMaxWidth: false },
    xyChart: { useMaxWidth: false },
  } as Parameters<typeof mermaid.initialize>[0])

  const id = `mp-tier2-${++counter}`
  const { svg } = await mermaid.render(id, source)
  const processed = postprocessMermaidSvg(svg, theme)
  return fitToContent(processed.svg, processed)
}
