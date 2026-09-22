import type { DiagramIR } from '@/core/ir'

export interface Point {
  x: number
  y: number
}

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface LaidOutNode extends Box {
  id: string
}

export interface LaidOutEdge {
  id: string
  /** Absolute polyline from source boundary to target boundary. */
  points: Point[]
  labelBox?: Box
}

export interface LaidOutGroup extends Box {
  id: string
}

export interface LaidOutDiagram {
  ir: DiagramIR
  nodes: LaidOutNode[]
  edges: LaidOutEdge[]
  groups: LaidOutGroup[]
  /**
   * Content extent including padding, in layout coordinates. The origin can be
   * negative: ELK's reported size does not always contain everything it placed
   * (mrtree understates the rightmost column), so bounds are measured from the
   * laid-out geometry and drive the viewBox.
   */
  bounds: Box
  /** Convenience aliases for `bounds.width` / `bounds.height`. */
  width: number
  height: number
}
