import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { DIAGRAM_KEYWORDS, STRUCTURE_KEYWORDS } from './mermaid-language'

export interface CompletionContext {
  themeIds: string[]
  nodeIds: string[]
  iconNames: string[]
}

const ARCHETYPES = ['service', 'database', 'queue', 'storage', 'user', 'external', 'process', 'decision', 'note', 'default']
const PACKS = ['general', 'aws', 'gcp', 'azure', 'k8s']

const DIRECTIVE_SNIPPETS: Array<{ label: string; insert: string; doc: string }> = [
  { label: '%%mp: theme', insert: '%%mp: theme ${1:slate-dark}', doc: 'Pin a theme for this diagram (overrides the UI selection).' },
  { label: '%%mp: node', insert: '%%mp: node ${1:id} archetype=${2:service} icon=${3:general:server}', doc: "Set a node's archetype and icon." },
  { label: '%%mp: edge', insert: '%%mp: edge ${1:a}->${2:b} semantics=${3:async}', doc: "Override an edge's semantics." },
  { label: '%%mp: layout', insert: '%%mp: layout direction=${1:RIGHT}', doc: 'Layout direction: DOWN, RIGHT, UP, LEFT.' },
  { label: '%%mp: group', insert: '%%mp: group ${1:id} collapsed', doc: 'Start a subgraph collapsed.' },
  { label: '%%mp: layout flow', insert: '%%mp: layout flow=${1:auto}', doc: 'Which edges carry a travelling highlight: all (the default), auto (broken lines only), or none.' },
  { label: '%%mp: layout motion', insert: '%%mp: layout motion=off', doc: 'Still this diagram: no entrance, no travelling highlights.' },
]

/**
 * Context-aware completions: directive snippets, theme ids after `theme`,
 * archetypes/icons after `archetype=`/`icon=`, node ids anywhere, keywords.
 */
export function provideCompletions(
  monaco: typeof Monaco,
  model: Monaco.editor.ITextModel,
  position: Monaco.Position,
  ctx: CompletionContext,
): Monaco.languages.CompletionList {
  const line = model.getLineContent(position.lineNumber)
  const before = line.slice(0, position.column - 1)
  const word = model.getWordUntilPosition(position)
  const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
  const K = monaco.languages.CompletionItemKind
  const items: Monaco.languages.CompletionItem[] = []

  const add = (label: string, kind: Monaco.languages.CompletionItemKind, insertText = label, detail?: string, snippet = false) =>
    items.push({
      label, kind, insertText, detail, range,
      insertTextRules: snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      sortText: kind === K.Snippet ? '0' + label : '1' + label,
    })

  if (/%%mp:\s*theme\s+[\w-]*$/.test(before)) {
    for (const id of ctx.themeIds) add(id, K.Color)
    return { suggestions: items }
  }
  if (/archetype=[\w-]*$/.test(before)) {
    for (const a of ARCHETYPES) add(a, K.EnumMember)
    return { suggestions: items }
  }
  if (/icon=[\w:-]*$/.test(before)) {
    const partial = /icon=([\w:-]*)$/.exec(before)?.[1] ?? ''
    const colon = partial.indexOf(':')
    if (colon === -1) {
      for (const p of PACKS) add(`${p}:`, K.Module, `${p}:`, 'icon pack')
      for (const name of ctx.iconNames.slice(0, 200)) add(name, K.Value)
    } else {
      for (const name of ctx.iconNames) if (name.startsWith(partial.slice(0, colon + 1))) add(name, K.Value)
    }
    add('none', K.Value, 'none', 'no icon')
    return { suggestions: items }
  }
  if (/%%mp:\s*(node|edge|group)\s+[\w.-]*$/.test(before)) {
    for (const id of ctx.nodeIds) add(id, K.Variable)
    return { suggestions: items }
  }
  if (/^\s*%/.test(before)) {
    for (const d of DIRECTIVE_SNIPPETS) add(d.label, K.Snippet, d.insert, d.doc, true)
    return { suggestions: items }
  }

  for (const d of DIRECTIVE_SNIPPETS) add(d.label, K.Snippet, d.insert, d.doc, true)
  for (const id of ctx.nodeIds) add(id, K.Variable, id, 'node')
  if (position.lineNumber === 1 || /^\s*$/.test(before)) for (const k of DIAGRAM_KEYWORDS) add(k, K.Keyword)
  for (const k of STRUCTURE_KEYWORDS) add(k, K.Keyword)
  return { suggestions: items }
}
