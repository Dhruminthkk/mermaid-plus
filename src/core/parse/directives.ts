import type { MpDirective } from '@/core/ir'

const DIRECTIVE_RE = /^\s*%%mp:\s*(.*)$/
const SUBJECT_TARGETS = new Set(['node', 'group', 'edge', 'step'])
const KNOWN_TARGETS = new Set(['theme', 'node', 'group', 'edge', 'layout', 'step'])

/**
 * Splits a directive body on whitespace, except inside quotes, so prose can be
 * carried as a value: `note="Handles auth for every request"`.
 */
function tokenize(body: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (const char of body.trim()) {
    if (quote) {
      if (char === quote) quote = null
      else current += char
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (/\s/.test(char)) {
      if (current) tokens.push(current)
      current = ''
    } else {
      current += char
    }
  }
  if (current) tokens.push(current)
  return tokens
}

export interface DirectiveParseResult {
  directives: MpDirective[]
  warnings: string[]
}

export function parseDirectives(source: string): DirectiveParseResult {
  const directives: MpDirective[] = []
  const warnings: string[] = []

  source.split('\n').forEach((text, line) => {
    const match = DIRECTIVE_RE.exec(text)
    if (!match) return

    const tokens = tokenize(match[1] ?? '')
    const target = tokens.shift()
    if (target === undefined) {
      warnings.push(`line ${line + 1}: empty directive`)
      return
    }
    if (!KNOWN_TARGETS.has(target)) {
      warnings.push(`line ${line + 1}: unknown directive target "${target}"`)
    }

    let subject: string | undefined
    if (SUBJECT_TARGETS.has(target) && tokens.length > 0 && !tokens[0]!.includes('=')) {
      subject = tokens.shift()
    }

    const attrs: Record<string, string> = {}
    for (const token of tokens) {
      const eq = token.indexOf('=')
      if (eq === -1) attrs[token] = 'true'
      else attrs[token.slice(0, eq)] = token.slice(eq + 1)
    }

    directives.push({ target, subject, attrs, line })
  })

  return { directives, warnings }
}
