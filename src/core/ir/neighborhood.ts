import type { DiagramIR } from './types'

/** Node ids within `hops` undirected steps of `start`, including `start`. */
export function neighborhood(ir: Pick<DiagramIR, 'edges'>, start: string, hops: number): Set<string> {
  const adjacency = new Map<string, Set<string>>()
  const link = (a: string, b: string) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set())
    adjacency.get(a)!.add(b)
  }
  for (const e of ir.edges) {
    link(e.source, e.target)
    link(e.target, e.source)
  }

  const seen = new Set<string>([start])
  let frontier = [start]
  for (let i = 0; i < hops && frontier.length > 0; i++) {
    const next: string[] = []
    for (const id of frontier) {
      for (const n of adjacency.get(id) ?? []) {
        if (!seen.has(n)) {
          seen.add(n)
          next.push(n)
        }
      }
    }
    frontier = next
  }
  return seen
}
