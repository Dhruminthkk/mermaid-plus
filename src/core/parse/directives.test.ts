import { describe, expect, it } from 'vitest'
import { parseDirectives } from '@/core/parse/directives'

describe('parseDirectives', () => {
  it('returns nothing for source with no directives', () => {
    expect(parseDirectives('flowchart TD\n  a --> b')).toEqual({ directives: [], warnings: [] })
  })

  it('parses a target with a bare subject', () => {
    const { directives } = parseDirectives('%%mp: theme slate-dark')
    expect(directives).toEqual([
      { target: 'theme', subject: undefined, attrs: { 'slate-dark': 'true' }, line: 0 },
    ])
  })

  it('parses a node directive with key=value attributes', () => {
    const { directives } = parseDirectives('flowchart TD\n%%mp: node api archetype=service icon=aws:lambda')
    expect(directives).toEqual([
      { target: 'node', subject: 'api', attrs: { archetype: 'service', icon: 'aws:lambda' }, line: 1 },
    ])
  })

  it('treats a bare token after a subject as a true flag', () => {
    const { directives } = parseDirectives('%%mp: group backend collapsed')
    expect(directives[0]).toEqual({ target: 'group', subject: 'backend', attrs: { collapsed: 'true' }, line: 0 })
  })

  it('parses an edge directive keyed by an arrow pair', () => {
    const { directives } = parseDirectives('%%mp: edge api->db semantics=async')
    expect(directives[0]).toEqual({ target: 'edge', subject: 'api->db', attrs: { semantics: 'async' }, line: 0 })
  })

  it('tolerates extra whitespace and a missing space after the colon', () => {
    const { directives } = parseDirectives('   %%mp:layout   direction=RIGHT  ')
    expect(directives[0]).toEqual({ target: 'layout', subject: undefined, attrs: { direction: 'RIGHT' }, line: 0 })
  })

  it('keeps a quoted value whole, so prose can be an attribute', () => {
    const { directives } = parseDirectives('%%mp: node api note="Handles auth for every request"')
    expect(directives[0]).toEqual({
      target: 'node', subject: 'api',
      attrs: { note: 'Handles auth for every request' },
      line: 0,
    })
  })

  it('accepts single quotes and several quoted values on one line', () => {
    const { directives } = parseDirectives(`%%mp: node db note='Primary, read-write' owner="Platform team"`)
    expect(directives[0]?.attrs).toEqual({ note: 'Primary, read-write', owner: 'Platform team' })
  })

  it('does not let an unterminated quote swallow the parse', () => {
    const { directives } = parseDirectives('%%mp: node api note="never closed')
    expect(directives[0]?.attrs).toEqual({ note: 'never closed' })
  })

  it('warns about an unknown target but still returns it', () => {
    const result = parseDirectives('%%mp: sprocket wibble=1')
    expect(result.warnings).toEqual(['line 1: unknown directive target "sprocket"'])
    expect(result.directives).toHaveLength(1)
  })

  it('warns about an empty directive without throwing', () => {
    const result = parseDirectives('%%mp:')
    expect(result.directives).toEqual([])
    expect(result.warnings).toEqual(['line 1: empty directive'])
  })
})
