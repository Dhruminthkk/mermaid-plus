import { JSDOM } from 'jsdom'
const dom = new JSDOM('<!doctype html><html><body></body></html>')
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.DOMParser = dom.window.DOMParser

const mermaid = (await import('mermaid')).default
const src = `flowchart LR
  a[API] -->|writes| b[(Postgres)]
  a -.-> c{{Queue}}
  a ==> d{Decision?}
  e([Stadium]) --> a
  f>Note] --> a
  subgraph backend [Backend]
    b
    subgraph inner [Inner]
      c
    end
  end`

mermaid.initialize({ startOnLoad: false })
const api = mermaid.mermaidAPI ?? mermaid
console.log('mermaid version:', (await import('mermaid/package.json', { with: { type: 'json' } })).default.version)
console.log('mermaid.getDiagramFromText:', typeof mermaid.getDiagramFromText)
console.log('mermaidAPI.getDiagramFromText:', typeof api.getDiagramFromText)

const diagram = await api.getDiagramFromText(src)
const db = diagram.db
console.log('type:', diagram.type)
console.log('db methods:', Object.keys(db).filter((k) => typeof db[k] === 'function').sort().join(', '))
const v = db.getVertices?.()
console.log('vertices is Map:', v instanceof Map)
const vs = v instanceof Map ? [...v.values()] : Object.values(v ?? {})
console.log('vertices:', JSON.stringify(vs.map(({ id, text, type, labelType, shape }) => ({ id, text, type, labelType, shape }))))
console.log('edges:', JSON.stringify(db.getEdges?.().map(({ id, start, end, text, stroke, type, length }) => ({ id, start, end, text, stroke, type, length }))))
console.log('subGraphs:', JSON.stringify(db.getSubGraphs?.().map(({ id, title, nodes, dir }) => ({ id, title, nodes, dir }))))
console.log('direction:', db.getDirection?.())

const pie = await api.getDiagramFromText('pie title Votes\n  "A" : 10')
console.log('pie type:', pie.type)
try { await api.getDiagramFromText('flowchart TD\n  a -->') } catch (e) { console.log('error class:', e?.constructor?.name, '| message:', String(e.message).split('\n')[0], '| hash:', JSON.stringify(e.hash ?? null)) }
