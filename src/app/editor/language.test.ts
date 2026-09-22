import { describe, expect, it } from 'vitest'
import { monarch, DIAGRAM_KEYWORDS } from '@/app/editor/mermaid-language'

describe('mermaid language definition', () => {
  it('declares a tokenizer with directive, comment, and operator rules', () => {
    const rules = (monarch.tokenizer as Record<string, unknown[]>)['root']!
    const tokens = rules.map((r) => (Array.isArray(r) ? r[1] : null))
    expect(tokens).toContain('keyword.directive')
    expect(tokens).toContain('comment')
    expect(tokens).toContain('operator')
  })

  it('knows every diagram kind the app can render', () => {
    for (const k of ['flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram-v2', 'erDiagram', 'mindmap', 'requirementDiagram', 'C4Context', 'gantt', 'pie']) {
      expect(DIAGRAM_KEYWORDS).toContain(k)
    }
  })
})
