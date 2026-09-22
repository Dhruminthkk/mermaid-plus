// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseDiagram } from '@/core/parse'
import { cleanText } from '@/core/parse/unified'
import type { DiagramIR } from '@/core/ir'

async function parse(source: string): Promise<DiagramIR> {
  const result = await parseDiagram(source)
  if (!result.ok) throw new Error(result.error.message)
  return result.ir
}

describe('cleanText', () => {
  it('decodes entities, guillemets, and jison escapes', () => {
    expect(cleanText('&lt;&lt;satisfies&gt;&gt;')).toBe('«satisfies»')
    expect(cleanText('\\+String name')).toBe('+String name')
    expect(cleanText(undefined)).toBe('')
  })
})

describe('state diagrams', () => {
  const source = `stateDiagram-v2
  direction LR
  [*] --> Idle
  Idle --> Running : start
  state Running {
    Working --> Waiting
  }
  Running --> [*]
  note right of Idle : waits here`

  it('is tier 1 with start/end pseudo-states carrying no label', async () => {
    const ir = await parse(source)
    expect(ir.kind).toBe('state')
    expect(ir.tier).toBe(1)
    expect(ir.direction).toBe('LR')
    const start = ir.nodes.find((n) => n.shapeHint === 'stateStart')
    const end = ir.nodes.find((n) => n.shapeHint === 'stateEnd')
    expect(start?.label).toBe('')
    expect(end?.label).toBe('')
  })

  it('turns composite states into groups and dissolves note wrappers', async () => {
    const ir = await parse(source)
    expect(ir.groups.map((g) => g.id)).toEqual(['Running'])
    expect(ir.groups[0]?.childNodeIds).toEqual(['Waiting', 'Working'])
    const note = ir.nodes.find((n) => n.shapeHint === 'note')
    expect(note?.archetype).toBe('note')
    expect(note?.label).toBe('waits here')
    expect(note?.groupId).toBeUndefined()
    expect(ir.nodes.find((n) => n.id === 'Idle')?.groupId).toBeUndefined()
  })

  it('keeps transition labels', async () => {
    const ir = await parse(source)
    expect(ir.edges.find((e) => e.source === 'Idle' && e.target === 'Running')?.label).toBe('start')
  })
})

describe('class diagrams', () => {
  const source = `classDiagram
  class Animal {
    +String name
    +makeSound() void
  }
  Animal <|-- Dog : inherits
  Animal "1" o-- "many" Toy : owns
  Dog ..> Food : eats
  Animal *-- Heart
  namespace Pets {
    class Cat
  }
  <<interface>> Food`

  it('builds compartments: header with annotations, members, methods', async () => {
    const ir = await parse(source)
    const animal = ir.nodes.find((n) => n.id === 'Animal')!
    expect(animal.compartments).toEqual([['Animal'], ['+String name'], ['+makeSound() : void']])
    expect(animal.label).toBe('Animal')
    const food = ir.nodes.find((n) => n.id === 'Food')!
    expect(food.compartments?.[0]).toEqual(['«interface»', 'Food'])
  })

  it('maps UML relationship heads and cardinalities', async () => {
    const ir = await parse(source)
    const byPair = Object.fromEntries(ir.edges.map((e) => [`${e.source}->${e.target}`, e]))
    expect(byPair['Animal->Dog']).toMatchObject({ arrowStart: 'triangle-open', arrowEnd: 'none', semantics: 'inheritance', label: 'inherits' })
    expect(byPair['Animal->Toy']).toMatchObject({ arrowStart: 'diamond-open', semantics: 'composition', labelStart: '1', labelEnd: 'many' })
    expect(byPair['Dog->Food']).toMatchObject({ arrowEnd: 'arrow-open', style: 'dashed', semantics: 'dependency' })
    expect(byPair['Animal->Heart']).toMatchObject({ arrowStart: 'diamond-filled' })
  })

  it('turns namespaces into groups', async () => {
    const ir = await parse(source)
    expect(ir.groups).toEqual([{ id: 'Pets', label: 'Pets', parentId: undefined, childNodeIds: ['Cat'] }])
    expect(ir.nodes.find((n) => n.id === 'Cat')?.groupId).toBe('Pets')
  })
})

describe('ER diagrams', () => {
  it('renders attributes as rows and cardinalities as crow-foot kinds', async () => {
    const ir = await parse(`erDiagram
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER {
    string name PK
    string email
  }`)
    const customer = ir.nodes.find((n) => n.label === 'CUSTOMER')!
    expect(customer.compartments).toEqual([['CUSTOMER'], ['string name PK', 'string email']])
    expect(ir.edges[0]).toMatchObject({ arrowStart: 'one', arrowEnd: 'zero-or-more', label: 'places', semantics: 'association' })
  })
})

describe('mindmaps', () => {
  it('asks for a tree layout with curved edges and tags sections', async () => {
    const ir = await parse(`mindmap
  root((Product))
    Design
      Themes
    Engineering`)
    expect(ir.kind).toBe('mindmap')
    expect(ir.layout).toEqual({ algorithm: 'mrtree', edgeRouting: 'POLYLINE' })
    expect(ir.direction).toBe('LR')
    const root = ir.nodes.find((n) => n.shapeHint === 'mindmapCircle')!
    expect(root.label).toBe('Product')
    expect(ir.nodes.find((n) => n.label === 'Design')?.meta['section']).toBe('0')
    expect(ir.edges.every((e) => e.arrowEnd === 'none')).toBe(true)
  })
})

describe('requirement diagrams', () => {
  it('lays requirement fields out as compartments and decodes the relation label', async () => {
    const ir = await parse(`requirementDiagram
  requirement test_req {
    id: 1
    text: the test text.
    risk: high
    verifymethod: test
  }
  element test_entity {
    type: simulation
  }
  test_entity - satisfies -> test_req`)
    const req = ir.nodes.find((n) => n.id === 'test_req')!
    expect(req.compartments).toEqual([['«Requirement»', 'test_req'], ['Id: 1', 'Text: the test text.', 'Risk: High', 'Verify: Test']])
    expect(ir.edges[0]).toMatchObject({ label: '«satisfies»', style: 'dashed', arrowEnd: 'arrow' })
  })
})

describe('C4 diagrams', () => {
  it('maps shapes to archetypes, boundaries to groups, and rels to labelled edges', async () => {
    const ir = await parse(`C4Context
  Person(customer, "Customer", "A user")
  System(webapp, "Web App", "Does things")
  System_Ext(mail, "Mail", "External")
  Enterprise_Boundary(b1, "Boundary") {
    SystemDb(db, "DB")
  }
  Rel(customer, webapp, "Uses", "HTTPS")`)
    expect(ir.kind).toBe('c4')
    const byId = Object.fromEntries(ir.nodes.map((n) => [n.id, n]))
    expect(byId['customer']?.archetype).toBe('user')
    expect(byId['webapp']?.archetype).toBe('service')
    expect(byId['mail']?.archetype).toBe('external')
    expect(byId['db']?.archetype).toBe('database')
    expect(byId['db']?.groupId).toBe('b1')
    expect(byId['customer']?.compartments).toEqual([['«Person»', 'Customer'], ['A user']])
    expect(ir.groups).toEqual([{ id: 'b1', label: 'Boundary', parentId: undefined, childNodeIds: ['db'] }])
    expect(ir.edges[0]).toMatchObject({ source: 'customer', target: 'webapp', label: 'Uses [HTTPS]' })
  })
})
