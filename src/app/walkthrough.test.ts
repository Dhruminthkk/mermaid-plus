// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseWalkthrough, stepHighlight } from '@/app/walkthrough'
import { enrich } from '@/core/enrich'
import { parseDiagram } from '@/core/parse'
import type { DiagramIR } from '@/core/ir'

const SOURCE = `flowchart LR
%%mp: step 2 focus=api,db note="Then it reads the database"
%%mp: step 1 focus=user,api title="Request" note="A shopper hits the gateway"
%%mp: step 3 note="And that is the whole picture"
%%mp: step 4 focus=backend
%%mp: step nine focus=api
  user[Browser] --> api[Gateway]
  api --> db[(Postgres)]
  db --> archive[(Archive)]
  subgraph backend [Backend]
    api
    db
  end`

async function ir(): Promise<DiagramIR> {
  const result = await parseDiagram(SOURCE)
  if (!result.ok) throw new Error(result.error.message)
  return enrich(result.ir)
}

describe('parseWalkthrough', () => {
  it('orders steps by their number, not by where they appear', async () => {
    expect((await parseWalkthrough(await ir())).map((s) => s.number)).toEqual([1, 2, 3, 4])
  })

  it('reads the title, note and focused ids', async () => {
    const [first] = await parseWalkthrough(await ir())
    expect(first).toEqual({ number: 1, title: 'Request', note: 'A shopper hits the gateway', ids: ['user', 'api'] })
  })

  it('treats a step with no focus as a title card over the whole diagram', async () => {
    const third = (await parseWalkthrough(await ir()))[2]!
    expect(third.ids).toEqual([])
    expect(third.note).toBe('And that is the whole picture')
  })

  it('ignores ids that are not in the diagram, and steps without a number', async () => {
    const steps = await parseWalkthrough(await ir())
    expect(steps).toHaveLength(4)
    expect(steps.every((s) => s.ids.every((id) => id !== 'ghost'))).toBe(true)
  })

  it('finds nothing in a diagram without steps', async () => {
    const plain = await parseDiagram('flowchart TD\n  a --> b')
    if (!plain.ok) throw new Error('parse failed')
    expect(parseWalkthrough(plain.ir)).toEqual([])
  })
})

describe('stepHighlight', () => {
  it('lights the named nodes and the edges between them', async () => {
    const model = await ir()
    const step = parseWalkthrough(model)[1]!
    const highlight = stepHighlight(model, step)!
    expect([...highlight.nodes].sort()).toEqual(['api', 'db'])
    expect([...highlight.edges]).toEqual(['api->db'])
  })

  it('naming a group names everything inside it', async () => {
    const model = await ir()
    const step = parseWalkthrough(model)[3]!
    const highlight = stepHighlight(model, step)!
    expect([...highlight.nodes].sort()).toEqual(['api', 'backend', 'db'])
  })

  it('a step with no focus highlights nothing, so nothing dims', async () => {
    const model = await ir()
    expect(stepHighlight(model, parseWalkthrough(model)[2]!)).toBeNull()
  })
})
