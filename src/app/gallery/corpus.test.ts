// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { CORPUS, stressFlowchart } from '@/app/gallery/corpus'
import { parseDiagram } from '@/core/parse'

describe('gallery corpus', () => {
  it('includes the showcase entries', () => {
    expect(Object.keys(CORPUS)).toEqual(expect.arrayContaining(['basic', 'shapes', 'subgraphs', 'labels', 'architecture', 'walkthrough', 'stress-200', 'stress-500', 'platform', 'class', 'er', 'mindmap', 'requirement', 'c4', 'state']))
  })

  it('parses every entry without error', async () => {
    for (const [name, entry] of Object.entries(CORPUS)) {
      const result = await parseDiagram(entry.source)
      expect(result.ok, `${name}: ${result.ok ? '' : result.error.message}`).toBe(true)
    }
  })

  it('puts every graph-shaped entry on tier 1', async () => {
    for (const name of ['basic', 'state', 'class', 'er', 'mindmap', 'requirement', 'c4']) {
      const result = await parseDiagram(CORPUS[name]!.source)
      expect(result.ok && result.ir.tier, name).toBe(1)
    }
  })

  it('generates a deterministic stress diagram with the requested node count', async () => {
    expect(stressFlowchart(30)).toBe(stressFlowchart(30))
    const result = await parseDiagram(stressFlowchart(30))
    if (!result.ok) throw new Error(result.error.message)
    expect(result.ir.nodes).toHaveLength(30)
  })
})
