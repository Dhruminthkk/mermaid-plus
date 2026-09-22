import type { DiagramIR } from '@/core/ir'

export interface Step {
  /** The number the author wrote; steps are ordered by it, not by line. */
  number: number
  title?: string
  note?: string
  /** Node and group ids this step is about. Empty means "the whole diagram". */
  ids: string[]
}

function splitIds(value: string | undefined): string[] {
  return (value ?? '').split(/[,\s]+/).map((id) => id.trim()).filter(Boolean)
}

/**
 * Reads `%%mp: step 1 focus=a,b note="…"` out of a diagram.
 *
 * A walkthrough turns a diagram into something you can present: each step names
 * the parts it is about, and the rest of the diagram recedes while its note is
 * read. Steps that name nothing act as a title card over the whole picture.
 */
export function parseWalkthrough(ir: DiagramIR): Step[] {
  const known = new Set<string>([...ir.nodes.map((n) => n.id), ...ir.groups.map((g) => g.id)])
  const steps: Step[] = []

  for (const directive of ir.directives) {
    if (directive.target !== 'step') continue
    const number = Number(directive.subject)
    if (!Number.isFinite(number)) continue

    const step: Step = {
      number,
      ids: splitIds(directive.attrs['focus'] ?? directive.attrs['nodes']).filter((id) => known.has(id)),
    }
    const title = directive.attrs['title']
    if (title) step.title = title
    const note = directive.attrs['note']
    if (note) step.note = note
    steps.push(step)
  }

  steps.sort((a, b) => a.number - b.number)
  return steps
}

/**
 * Everything a step should keep lit: the nodes it names, plus the edges that run
 * between them, so a step about two services shows the link as well.
 */
export function stepHighlight(ir: DiagramIR, step: Step): { nodes: Set<string>; edges: Set<string> } | null {
  if (step.ids.length === 0) return null

  const nodes = new Set(step.ids)
  // Naming a group is a way of naming everything inside it.
  for (const group of ir.groups) {
    if (nodes.has(group.id)) for (const child of group.childNodeIds) nodes.add(child)
  }

  const edges = new Set<string>()
  for (const edge of ir.edges) {
    if (nodes.has(edge.source) && nodes.has(edge.target)) edges.add(edge.id)
  }
  return { nodes, edges }
}
