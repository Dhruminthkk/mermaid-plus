import { JSDOM } from 'jsdom'
const dom = new JSDOM('<!doctype html><html><body></body></html>')
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.DOMParser = dom.window.DOMParser
const mermaid = (await import('mermaid')).default
mermaid.initialize({ startOnLoad: false })
const api = mermaid.mermaidAPI

const SAMPLES = {
  state: `stateDiagram-v2
  direction LR
  [*] --> Idle
  Idle --> Running : start
  state Running {
    Working --> Waiting
  }
  Running --> [*]
  note right of Idle : waits here`,
  class: `classDiagram
  direction LR
  class Animal {
    +String name
    +int age
    +makeSound() void
  }
  class Dog
  Animal <|-- Dog : inherits
  Animal "1" o-- "many" Toy : owns
  Dog ..> Food : eats
  namespace Pets {
    class Cat
  }
  <<interface>> Food`,
  er: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  CUSTOMER {
    string name PK
    string email
  }
  ORDER {
    int id PK
    date created
  }`,
  mindmap: `mindmap
  root((Product))
    Design
      Themes
      Icons
    Engineering
      Layout
      ::icon(fa fa-book)
      Render`,
  requirement: `requirementDiagram
  requirement test_req {
    id: 1
    text: the test text.
    risk: high
    verifymethod: test
  }
  element test_entity {
    type: simulation
  }
  test_entity - satisfies -> test_req`,
  c4: `C4Context
  title System Context
  Person(customer, "Customer", "A user")
  System(webapp, "Web App", "Does things")
  System_Ext(mail, "Mail", "External")
  Enterprise_Boundary(b1, "Boundary") {
    System(db, "DB")
  }
  Rel(customer, webapp, "Uses", "HTTPS")
  Rel(webapp, mail, "Sends")`,
}

const fns = (db) => Object.keys(db).filter((k) => typeof db[k] === 'function' && k.startsWith('get')).sort().join(', ')
const short = (v) => { const s = JSON.stringify(v, (k, val) => (val instanceof Map ? Object.fromEntries(val) : val)); return s && s.length > 900 ? s.slice(0, 900) + '…' : s }

for (const [name, src] of Object.entries(SAMPLES)) {
  try {
    const d = await api.getDiagramFromText(src)
    console.log(`\n===== ${name} → type "${d.type}"`)
    console.log('getters:', fns(d.db))
    for (const g of ['getRootDoc', 'getRelations', 'getClasses', 'getNamespaces', 'getNotes', 'getEntities', 'getRelationships', 'getMindmap', 'getRequirements', 'getElements', 'getDirection', 'getNodes', 'getEdges', 'getStates', 'getC4ShapeArray', 'getBoundaries', 'getRels', 'getC4ShapeKeys', 'getData']) {
      if (typeof d.db[g] === 'function') {
        try { const v = d.db[g](); console.log(`  ${g}():`, short(v)) } catch (e) { console.log(`  ${g}() threw`, String(e).slice(0, 80)) }
      }
    }
  } catch (e) { console.log(`\n===== ${name} FAILED:`, String(e).slice(0, 200)) }
}
