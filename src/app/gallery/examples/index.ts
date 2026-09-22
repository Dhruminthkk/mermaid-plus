import type { ExampleKind } from './types'
import { flowchart } from './flowchart'
import { sequence } from './sequence'
import { classDiagram } from './class'
import { state } from './state'
import { er } from './er'
import { mindmap } from './mindmap'
import { requirement } from './requirement'
import { c4 } from './c4'
import { gantt } from './gantt'
import { pie } from './pie'
import { timeline } from './timeline'
import { journey } from './journey'
import { gitgraph } from './gitgraph'
import { quadrant } from './quadrant'
import { xychart } from './xychart'
import { sankey } from './sankey'
import { block } from './block'
import { kanban } from './kanban'
import { packet } from './packet'
import { architecture } from './architecture'
import { showcase } from './showcase'

export type { Example, ExampleKind } from './types'

/**
 * Ten examples per diagram kind, keyed by a URL-safe slug (`?ex=<slug>:<index>`).
 *
 * `showcase` leads: one diagram per headline capability rather than per diagram
 * type, for demonstrating the tool rather than the notation.
 */
export const EXAMPLE_KINDS: Record<string, ExampleKind> = {
  showcase: { label: 'Showcase', tier: 1, examples: showcase },
  flowchart: { label: 'Flowchart', tier: 1, examples: flowchart },
  class: { label: 'Class diagram', tier: 1, examples: classDiagram },
  state: { label: 'State diagram', tier: 1, examples: state },
  er: { label: 'Entity relationship', tier: 1, examples: er },
  mindmap: { label: 'Mindmap', tier: 1, examples: mindmap },
  requirement: { label: 'Requirement diagram', tier: 1, examples: requirement },
  c4: { label: 'C4', tier: 1, examples: c4 },
  sequence: { label: 'Sequence diagram', tier: 2, examples: sequence },
  gantt: { label: 'Gantt', tier: 2, examples: gantt },
  pie: { label: 'Pie chart', tier: 2, examples: pie },
  timeline: { label: 'Timeline', tier: 2, examples: timeline },
  journey: { label: 'User journey', tier: 2, examples: journey },
  gitgraph: { label: 'Git graph', tier: 2, examples: gitgraph },
  quadrant: { label: 'Quadrant chart', tier: 2, examples: quadrant },
  xychart: { label: 'XY chart', tier: 2, examples: xychart },
  sankey: { label: 'Sankey', tier: 2, examples: sankey },
  block: { label: 'Block diagram', tier: 2, examples: block },
  kanban: { label: 'Kanban', tier: 2, examples: kanban },
  packet: { label: 'Packet diagram', tier: 2, examples: packet },
  architecture: { label: 'Architecture', tier: 2, examples: architecture },
}

export function findExample(ref: string | null): { kind: string; index: number; title: string; source: string } | null {
  if (!ref) return null
  const [kind = '', idx] = ref.split(':')
  const entry = EXAMPLE_KINDS[kind]
  const index = Number(idx ?? 0)
  const example = entry?.examples[index]
  return entry && example ? { kind, index, title: example.title, source: example.source } : null
}
