// The ONLY file permitted to reach into mermaid's internals (spec, Global
// Constraints). Verified against mermaid 11.17.2 via scripts/probe-mermaid.mjs:
//   mermaid.mermaidAPI.getDiagramFromText(src) -> { type: 'flowchart-v2', db }
//   db.getVertices() -> Map<id, { id, text, type: 'square'|'cylinder'|'hexagon'|
//                       'diamond'|'stadium'|'odd'|..., labelType }>
//   db.getEdges()    -> [{ id, start, end, text, stroke: 'normal'|'dotted'|'thick'|
//                       'invisible', type: 'arrow_point'|'arrow_open'|'double_arrow_point'|... }]
//   db.getSubGraphs()-> [{ id, title, nodes: string[] }]  (nested subgraph ids appear
//                       inside the parent's `nodes`; nodes list only their innermost group)
//   db.getDirection()-> 'TB'|'TD'|'LR'|'BT'|'RL'
//   parse failure    -> throws Error('Parse error on line N: ...') with a jison `hash`
import mermaid from 'mermaid'

export interface RawVertex {
  id: string
  text?: string
  type?: string
}

export interface RawEdge {
  start: string
  end: string
  text?: string
  stroke?: string
  type?: string
}

export interface RawSubGraph {
  id: string
  title?: string
  nodes: string[]
}

export interface FlowchartDb {
  vertices: RawVertex[]
  edges: RawEdge[]
  subGraphs: RawSubGraph[]
  direction: string
}

let initialized = false

function ensureInitialized(): void {
  if (initialized) return
  // mermaid caps edges at 500 by default; our layout handles far more.
  mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true, maxEdges: 20000, maxTextSize: 500000 })
  initialized = true
}

/** mermaid v11 returns Maps from some getters and plain objects from others. */
function toArray<T>(value: Map<string, T> | Record<string, T> | T[] | undefined): T[] {
  if (value === undefined) return []
  if (Array.isArray(value)) return value
  if (value instanceof Map) return Array.from(value.values())
  return Object.values(value)
}

interface MermaidDiagram {
  type: string
  db: Record<string, unknown>
}

async function getDiagram(source: string): Promise<MermaidDiagram> {
  ensureInitialized()
  const api = (mermaid as unknown as {
    mermaidAPI?: { getDiagramFromText: (s: string) => Promise<MermaidDiagram> }
  }).mermaidAPI
  if (!api?.getDiagramFromText) {
    throw new Error('mermaid: mermaidAPI.getDiagramFromText unavailable on this version')
  }
  return api.getDiagramFromText(source)
}

/** Returns the mermaid diagram type string, e.g. "flowchart-v2" or "pie". */
export async function getDiagramType(source: string): Promise<string> {
  const diagram = await getDiagram(source)
  return diagram.type
}

export async function getFlowchartDb(source: string): Promise<FlowchartDb> {
  const diagram = await getDiagram(source)
  const db = diagram.db as {
    getVertices?: () => Map<string, RawVertex> | Record<string, RawVertex>
    getEdges?: () => RawEdge[]
    getSubGraphs?: () => RawSubGraph[]
    getDirection?: () => string
  }

  return {
    vertices: toArray(db.getVertices?.()),
    edges: toArray(db.getEdges?.()),
    subGraphs: toArray(db.getSubGraphs?.()),
    direction: db.getDirection?.() ?? 'TB',
  }
}

// ---- Unified layout data (mermaid v11 `db.getData()`), shared by state, class,
// er, requirement and mindmap. Shapes seen: rect, classBox, erBox, requirementBox,
// note, noteGroup (synthetic wrapper around a state + its note), stateStart,
// stateEnd, fork, join, choice, roundedWithTitle (composite state), mindmapCircle,
// defaultMindmapNode. Groups carry isGroup; membership is parentId.

export interface RawMember {
  text?: string
  visibility?: string
  id?: string
  memberType?: string
}

export interface RawAttribute {
  type?: string
  name?: string
  keys?: string[]
  comment?: string
}

export interface RawDataNode {
  id: string
  label?: string
  shape?: string
  isGroup?: boolean
  parentId?: string
  // class
  members?: RawMember[]
  methods?: RawMember[]
  annotations?: string[]
  // er
  attributes?: RawAttribute[]
  // requirement
  name?: string
  type?: string
  requirementId?: string
  text?: string
  risk?: string
  verifyMethod?: string
  docRef?: string
  // mindmap
  level?: number
  section?: number
  nodeId?: string
  icon?: string
}

export interface RawDataEdge {
  id: string
  start: string
  end: string
  label?: string
  pattern?: string
  thickness?: string
  arrowTypeStart?: string
  arrowTypeEnd?: string
  startLabelRight?: string
  endLabelLeft?: string
}

export interface UnifiedDb {
  nodes: RawDataNode[]
  edges: RawDataEdge[]
  direction: string
}

export async function getUnifiedDb(source: string): Promise<UnifiedDb> {
  const diagram = await getDiagram(source)
  const db = diagram.db as {
    getData?: () => { nodes?: RawDataNode[]; edges?: RawDataEdge[]; direction?: string }
    getDirection?: () => string
  }
  if (!db.getData) throw new Error(`mermaid: "${diagram.type}" exposes no getData()`)
  const data = db.getData()
  return {
    nodes: data.nodes ?? [],
    edges: data.edges ?? [],
    direction: data.direction ?? db.getDirection?.() ?? 'TB',
  }
}

// ---- C4 (no getData). Shapes: person, external_person, system, external_system,
// system_db, system_queue, container, container_db, container_queue, component, ...
export interface RawC4Shape {
  alias: string
  label?: { text?: string }
  descr?: { text?: string }
  techn?: { text?: string }
  typeC4Shape?: { text?: string }
  parentBoundary?: string
}

export interface RawC4Boundary {
  alias: string
  label?: { text?: string }
  type?: { text?: string }
  parentBoundary?: string
}

export interface RawC4Rel {
  from: string
  to: string
  label?: { text?: string }
  techn?: { text?: string }
  descr?: { text?: string }
  type?: string
}

export interface C4Db {
  shapes: RawC4Shape[]
  boundaries: RawC4Boundary[]
  rels: RawC4Rel[]
  title?: string
}

export async function getC4Db(source: string): Promise<C4Db> {
  const diagram = await getDiagram(source)
  const db = diagram.db as {
    getC4ShapeArray?: () => RawC4Shape[]
    getBoundaries?: () => RawC4Boundary[]
    getRels?: () => RawC4Rel[]
    getTitle?: () => string
  }
  return {
    shapes: db.getC4ShapeArray?.() ?? [],
    boundaries: db.getBoundaries?.() ?? [],
    rels: db.getRels?.() ?? [],
    title: db.getTitle?.() || undefined,
  }
}
