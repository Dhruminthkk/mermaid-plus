import type { DiagramIR, Tier1Kind } from '@/core/ir'
import { parseDirectives } from './directives'
import { getC4Db, getDiagramType, getUnifiedDb } from './mermaid-adapter'
import { parseFlowchart } from './flowchart'
import { unifiedToIR } from './unified'
import { c4ToIR } from './c4'

export { parseDirectives } from './directives'

export interface ParseError {
  message: string
  /** Mermaid's untouched text, for anyone who wants the grammar's own words. */
  detail?: string
  line?: number
}

export type ParseResult =
  | { ok: true; ir: DiagramIR; warnings: string[] }
  | { ok: false; error: ParseError }

/** Tier 1 is a closed set (spec §5.2); anything else falls through to tier 2. */
const TIER1_BY_MERMAID_TYPE: Record<string, Tier1Kind> = {
  flowchart: 'flowchart',
  'flowchart-v2': 'flowchart',
  graph: 'flowchart',
  stateDiagram: 'state',
  classDiagram: 'class',
  class: 'class',
  er: 'er',
  mindmap: 'mindmap',
  requirement: 'requirement',
  c4: 'c4',
}

/**
 * Mermaid's parse errors carry a caret drawing of the offending line and the
 * full list of tokens its grammar would have accepted — forty of them, by
 * symbol name. None of that helps someone who is writing a diagram, and it
 * pushes the one useful part off the end of the strip.
 *
 * The summary keeps the shape of the complaint (\u201cgot EOF\u201d means the line
 * stops early) and drops the rest; the untouched text stays on `detail`.
 */
function readable(message: string): string {
  if (/no diagram type detected/i.test(message)) {
    return 'Not a diagram yet \u2014 the first line names the type, like "flowchart LR"'
  }
  const head = message.split('\n')[0]?.trim() ?? message
  const subject = /^Parse error on line \d+:?$/i.test(head) ? 'Could not parse this line' : head.replace(/:$/, '')

  // Only the tokens that mean something outside the grammar are worth showing.
  // "got 'EOF'" and "got 'NEWLINE'" both mean the line stops before it is
  // finished; the rest are internal names like eof_in_struct.
  const got = /got '([^']+)'/.exec(message)?.[1]
  if (got !== undefined && /^(EOF|NEWLINE)$/i.test(got)) return `${subject} \u2014 it ends before it is finished`
  return subject
}

/**
 * When a document ends mid-statement the parser gives up at end of input, which
 * it reports as the line after the last one. Pointing past the end helps nobody:
 * the incomplete line is the last one.
 */
function lineFromMessage(message: string, source: string): number | undefined {
  const match = /line (\d+)/i.exec(message)
  if (!match?.[1]) return undefined
  return Math.min(Number(match[1]), source.split('\n').length)
}

async function parseTier1(kind: Tier1Kind, source: string): Promise<Omit<DiagramIR, 'directives'>> {
  switch (kind) {
    case 'flowchart':
      return parseFlowchart(source)
    case 'c4':
      return c4ToIR(await getC4Db(source), source)
    default:
      return unifiedToIR(kind, await getUnifiedDb(source), source)
  }
}

export async function parseDiagram(source: string): Promise<ParseResult> {
  const { directives, warnings } = parseDirectives(source)

  try {
    const mermaidType = await getDiagramType(source)
    const tier1Kind = TIER1_BY_MERMAID_TYPE[mermaidType]

    if (tier1Kind === undefined) {
      return {
        ok: true,
        warnings,
        ir: { kind: mermaidType, tier: 2, direction: 'TB', nodes: [], edges: [], groups: [], directives, raw: source },
      }
    }

    const base = await parseTier1(tier1Kind, source)
    return { ok: true, warnings, ir: { ...base, directives } }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: { message: readable(message), detail: message, line: lineFromMessage(message, source) } }
  }
}
