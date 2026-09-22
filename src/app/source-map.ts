export interface SourceMap {
  /** First source line (0-based) that mentions each node id. */
  lineOf: Map<string, number>
  /** Node ids mentioned on each line, in order of appearance. */
  nodesAt: Map<number, string[]>
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Mermaid's parsers do not report positions, so map node ids back to source
 * lines by lexical search. Ids are matched as whole words outside comments.
 */
export function buildSourceMap(source: string, nodeIds: readonly string[]): SourceMap {
  const lineOf = new Map<string, number>()
  const nodesAt = new Map<number, string[]>()
  const lines = source.split('\n')
  const patterns = nodeIds.map((id) => ({ id, re: new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(id)}(?![A-Za-z0-9_])`) }))

  lines.forEach((line, i) => {
    if (/^\s*%%/.test(line)) return
    const hits: string[] = []
    for (const { id, re } of patterns) {
      if (re.test(line)) {
        hits.push(id)
        if (!lineOf.has(id)) lineOf.set(id, i)
      }
    }
    if (hits.length > 0) nodesAt.set(i, hits)
  })

  return { lineOf, nodesAt }
}
