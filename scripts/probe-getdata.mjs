import { JSDOM } from 'jsdom'
import { writeFileSync } from 'node:fs'
const dom = new JSDOM('<!doctype html><html><body></body></html>')
globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.DOMParser = dom.window.DOMParser
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
  state fork_state <<fork>>
  Running --> fork_state
  fork_state --> [*]
  note right of Idle : waits here`,
  class: `classDiagram
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
  <<interface>> Food
  note for Dog "Good boy"`,
  er: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER {
    string name PK
  }`,
  mindmap: `mindmap
  root((Product))
    Design
      Themes
    Engineering
      Layout`,
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
}
const out = {}
for (const [name, src] of Object.entries(SAMPLES)) {
  const d = await api.getDiagramFromText(src)
  const data = d.db.getData()
  out[name] = { type: d.type, nodes: data.nodes, edges: data.edges, other: data.other, direction: data.direction }
  const keys = (arr) => Array.from(new Set(arr.flatMap((n) => Object.keys(n)))).sort().join(',')
  console.log(`\n== ${name} (${d.type}) nodes:${data.nodes.length} edges:${data.edges.length}`)
  console.log('  node keys:', keys(data.nodes))
  console.log('  edge keys:', keys(data.edges))
  console.log('  shapes:', Array.from(new Set(data.nodes.map((n) => n.shape))).join(','))
  console.log('  groups:', data.nodes.filter((n) => n.isGroup).map((n) => `${n.id}(${n.shape})`).join(','), '| parents:', data.nodes.filter((n) => n.parentId).map((n) => `${n.id}->${n.parentId}`).join(','))
  console.log('  edge sample:', JSON.stringify(data.edges[0]).slice(0, 400))
  console.log('  edge arrow types:', Array.from(new Set(data.edges.map((e) => `${e.arrowTypeStart}|${e.arrowTypeEnd}|${e.pattern}`))).join(' ; '))
  console.log('  direction:', data.direction)
}
writeFileSync('/tmp/getdata.json', JSON.stringify(out, null, 1))
