// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import ELK from 'elkjs/lib/elk.bundled.js'
import { EXAMPLE_KINDS, findExample } from '@/app/gallery/examples'
import { parseDiagram } from '@/core/parse'
import { enrich } from '@/core/enrich'
import { validateIR } from '@/core/ir'
import { runLayout } from '@/core/layout'
import { cleanLight } from '@/core/theme'

const elk = new ELK()

describe('example library', () => {
  it('has exactly ten examples for each kind, with unique titles', () => {
    expect(Object.keys(EXAMPLE_KINDS)).toHaveLength(21)
    for (const [kind, entry] of Object.entries(EXAMPLE_KINDS)) {
      expect(entry.examples, kind).toHaveLength(10)
      expect(new Set(entry.examples.map((e) => e.title)).size, `${kind} titles`).toBe(10)
    }
  })

  for (const [kind, entry] of Object.entries(EXAMPLE_KINDS)) {
    it(`${kind}: every example parses on tier ${entry.tier}`, async () => {
      const failures: string[] = []
      for (const example of entry.examples) {
        const result = await parseDiagram(example.source)
        if (!result.ok) failures.push(`${example.title}: ${result.error.message.split('\n')[0]}`)
        else if (result.ir.tier !== (example.tier ?? entry.tier)) failures.push(`${example.title}: expected tier ${example.tier ?? entry.tier}, got ${result.ir.tier} (${result.ir.kind})`)
      }
      expect(failures).toEqual([])
    }, 60_000)
  }

  for (const [kind, entry] of Object.entries(EXAMPLE_KINDS).filter(([, e]) => e.tier === 1)) {
    it(`${kind}: every example validates and lays out`, async () => {
      const failures: string[] = []
      for (const example of entry.examples) {
        if ((example.tier ?? entry.tier) !== 1) continue
        const result = await parseDiagram(example.source)
        if (!result.ok) continue
        const ir = enrich(result.ir)
        const problems = validateIR(ir)
        if (problems.length > 0) {
          failures.push(`${example.title}: ${problems.join('; ')}`)
          continue
        }
        const laid = await runLayout(ir, cleanLight, elk)
        if (laid.nodes.length !== ir.nodes.length || laid.width <= 0) failures.push(`${example.title}: layout incomplete`)
      }
      expect(failures).toEqual([])
    }, 120_000)
  }

  it('resolves example references', () => {
    expect(findExample('flowchart:0')?.title).toBe('Sign-in with OAuth and PKCE')
    expect(findExample('pie:9')?.kind).toBe('pie')
    expect(findExample('flowchart:10')).toBeNull()
    expect(findExample('nope:0')).toBeNull()
    expect(findExample(null)).toBeNull()
  })
})
