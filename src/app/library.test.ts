import { describe, expect, it } from 'vitest'
import { makeLibrary, suggestTitle, type KeyValueStore } from '@/app/library'

function fakeStore(): KeyValueStore {
  const map = new Map<string, string>()
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  }
}

describe('library', () => {
  it('saves, lists newest first, updates in place, and removes', () => {
    const lib = makeLibrary(fakeStore())
    const a = lib.save({ title: 'A', source: 'a', themeId: 'clean-light' }, 1000)
    const b = lib.save({ title: 'B', source: 'b', themeId: 'clean-light' }, 2000)
    expect(lib.list().map((d) => d.id)).toEqual([b.id, a.id])
    lib.save({ id: a.id, title: 'A2', source: 'a2', themeId: 'slate-dark' }, 3000)
    expect(lib.list().map((d) => d.title)).toEqual(['A2', 'B'])
    lib.remove(b.id)
    expect(lib.list()).toHaveLength(1)
  })

  it('keeps a draft separately', () => {
    const lib = makeLibrary(fakeStore())
    expect(lib.loadDraft()).toBeNull()
    lib.saveDraft({ source: 'x', themeId: 'vivid-dark' })
    expect(lib.loadDraft()).toEqual({ source: 'x', themeId: 'vivid-dark' })
  })

  it('survives corrupt storage', () => {
    const store = fakeStore()
    store.setItem('mp:library', '{not json')
    expect(makeLibrary(store).list()).toEqual([])
  })
})

describe('suggestTitle', () => {
  it('prefers the diagram\'s own title', () => {
    expect(suggestTitle('flowchart TD\n  title: My Flow\n  a --> b')).toBe('My Flow')
    expect(suggestTitle('gantt\n  title Q4 release\n  dateFormat YYYY-MM-DD')).toBe('Q4 release')
  })

  it('never returns a bare declaration, naming the first label instead', () => {
    expect(suggestTitle('flowchart LR\n  user[Browser Client] --> cdn[CDN]')).toBe('Flowchart — Browser Client')
    expect(suggestTitle('erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  CUSTOMER {\n    uuid id PK\n  }')).toBe('Er diagram')
    expect(suggestTitle('stateDiagram-v2\n  [*] --> Idle\n  Idle --> Running : start')).toBe('State diagram')
  })

  it('skips directives and falls back gracefully', () => {
    expect(suggestTitle('%%mp: theme x\nsequenceDiagram\n  participant A as Checkout')).toBe('Sequence diagram')
    expect(suggestTitle('')).toBe('Untitled')
    expect(suggestTitle('just some text')).toBe('just some text')
  })
})
