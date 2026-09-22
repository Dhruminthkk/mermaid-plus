import { renderToStaticMarkup } from 'react-dom/server'
import type { LaidOutDiagram } from '@/core/layout'
import type { Theme } from '@/core/theme'
import type { IconMap } from '@/core/icons'
import { DiagramSvg } from './Diagram'

export { DiagramSvg } from './Diagram'
export { shapePath } from './shapes'
export { baseStyles, exportMotionStyles, flowKeyframes } from './styles'

/** Standalone SVG markup, suitable for export and for snapshot tests. */
export function renderSvg(layout: LaidOutDiagram, theme: Theme, icons: IconMap = {}): string {
  return renderToStaticMarkup(<DiagramSvg layout={layout} theme={theme} icons={icons} />)
}
