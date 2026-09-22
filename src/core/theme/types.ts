import type { Archetype } from '@/core/ir'

export interface ArchetypeColors {
  fill: string
  stroke: string
  text: string
}

export interface Theme {
  id: string
  name: string
  mode: 'light' | 'dark'
  color: {
    canvas: string
    surface: string
    surfaceRaised: string
    text: string
    textMuted: string
    stroke: string
    edge: string
    edgeMuted: string
    /** Ordered ramp used to tint groups. */
    accent: string[]
    /**
     * The travelling highlight on flowing edges. Defaults to the first accent,
     * which is only wrong where that accent is near the text colour.
     */
    flow?: string
    archetype: Record<Archetype, ArchetypeColors>
  }
  type: {
    family: string
    familyMono: string
    /** Font sizes in px, small to large. Index 1 is the node label size. */
    scale: [number, number, number, number]
    weightLabel: number
    weightTitle: number
  }
  geometry: {
    radius: number
    strokeWidth: number
    nodePaddingX: number
    nodePaddingY: number
    rankSpacing: number
    nodeSpacing: number
    groupPadding: number
  }
  depth: {
    /** SVG-compatible drop-shadow filter strings, low to high elevation. */
    elevation: [string, string, string]
  }
  edge: {
    routing: 'orthogonal' | 'curved' | 'straight'
    arrowhead: 'triangle' | 'open' | 'diamond' | 'circle'
    cornerRadius: number
    /**
     * Where an edge's label sits. 'on-line' centres it on the edge and masks
     * the line behind it; 'beside' offsets it clear of the line. Defaults to
     * 'on-line'; `%%mp: layout edgeLabels=beside` overrides per diagram.
     */
    labelPlacement?: 'on-line' | 'beside'
  }
  texture: 'crisp' | 'sketch'
}
