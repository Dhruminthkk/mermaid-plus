// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseDiagram } from '@/core/parse'

/**
 * Mermaid's own parse errors carry a caret drawing and the full list of tokens
 * its grammar would have accepted. What reaches the reader is a sentence.
 */
describe('parse errors as a reader sees them', () => {
  it('says which line, and that the line stops early', async () => {
    const result = await parseDiagram('flowchart TD\n  a --> b\n  b -->')
    expect(result.ok).toBe(false)
    if (result.ok) return
    // Three lines in, and the third is the incomplete one: the parser gives up
    // at end of input and calls that line four.
    expect(result.error.line).toBe(3)
    expect(result.error.message).toBe('Could not parse this line — it ends before it is finished')
  })

  it('keeps the grammar out of it when the token means nothing outside the grammar', async () => {
    const result = await parseDiagram('classDiagram\n  class A {')
    expect(result.ok).toBe(false)
    if (result.ok) return
    // Not "unexpected eof_in_struct".
    expect(result.error.message).toBe('Could not parse this line')
  })

  it('points at a bad line in the middle of a document', async () => {
    const result = await parseDiagram('flowchart TD\n  a --> b\n  ((((\n  c --> d')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.line).toBe(3)
  })

  it('explains an unrecognised document rather than quoting it back', async () => {
    const result = await parseDiagram('not a diagram at all')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.message).toContain('the first line names the type')
    expect(result.error.message).not.toContain('No diagram type detected')
  })

  it('keeps the parser’s own words available', async () => {
    const result = await parseDiagram('flowchart TD\n  a -->')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.detail).toContain('Expecting')
    expect(result.error.message).not.toContain('Expecting')
  })
})
