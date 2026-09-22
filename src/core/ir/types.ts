/** Diagram kinds laid out by our own pipeline. Closed set — see spec §5.2. */
export type Tier1Kind =
  | 'flowchart' | 'class' | 'er' | 'state' | 'c4' | 'mindmap' | 'requirement'

/** Any kind mermaid can parse. Non-tier-1 kinds fall through to tier 2. */
export type DiagramKind = Tier1Kind | (string & {})

/** Mermaid's flow direction. Layout translates it to an ELK direction. */
export type FlowDirection = 'TB' | 'LR' | 'BT' | 'RL'

export type Archetype =
  | 'service' | 'database' | 'queue' | 'storage' | 'user'
  | 'external' | 'process' | 'decision' | 'note' | 'default'

export type EdgeSemantics =
  | 'flow' | 'dependency' | 'inheritance' | 'composition'
  | 'association' | 'async' | 'bidirectional'

export type EdgeStyle = 'solid' | 'dashed' | 'dotted' | 'thick'

/** Line-end decorations: UML relationship heads and ER crow's-foot cardinalities. */
export type ArrowKind =
  | 'none' | 'arrow' | 'arrow-open' | 'triangle-open' | 'diamond-open' | 'diamond-filled'
  | 'one' | 'zero-or-one' | 'many' | 'one-or-more' | 'zero-or-more'

/** Per-diagram layout preferences the adapter knows better than the theme does. */
export interface LayoutHints {
  algorithm?: 'layered' | 'mrtree' | 'radial'
  edgeRouting?: 'ORTHOGONAL' | 'POLYLINE' | 'SPLINES'
}

/** Zero-based line range in the original source, for bidirectional selection. */
export interface SourceRange {
  startLine: number
  endLine: number
}

export interface IRNode {
  id: string
  label: string
  archetype: Archetype
  icon?: string
  groupId?: string
  /** Original mermaid shape token, e.g. "cylinder". Drives archetype inference. */
  shapeHint?: string
  /** Stacked text sections (class members, ER attributes, requirement fields). Header is index 0. */
  compartments?: string[][]
  source?: SourceRange
  meta: Record<string, string>
}

export interface IREdge {
  id: string
  source: string
  target: string
  label?: string
  semantics: EdgeSemantics
  style: EdgeStyle
  /** Defaults: end = arrow (or none for association), start = none (arrow when bidirectional). */
  arrowStart?: ArrowKind
  arrowEnd?: ArrowKind
  /** Labels near the endpoints, e.g. class cardinalities. */
  labelStart?: string
  labelEnd?: string
  source_range?: SourceRange
  meta?: Record<string, string>
}

export interface IRGroup {
  id: string
  label?: string
  parentId?: string
  childNodeIds: string[]
}

export interface MpDirective {
  target: string
  subject?: string
  attrs: Record<string, string>
  line: number
}

export interface DiagramIR {
  kind: DiagramKind
  tier: 1 | 2
  direction: FlowDirection
  nodes: IRNode[]
  edges: IREdge[]
  groups: IRGroup[]
  directives: MpDirective[]
  layout?: LayoutHints
  /** Original source. Tier 2 hands this straight to mermaid. */
  raw: string
}
