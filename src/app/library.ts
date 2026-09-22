export interface SavedDoc {
  id: string
  title: string
  source: string
  themeId: string
  updatedAt: number
}

export interface Draft {
  source: string
  themeId: string
}

/** The subset of Storage we use, so tests can pass a Map-backed fake. */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const DOCS_KEY = 'mp:library'
const DRAFT_KEY = 'mp:draft'

function read<T>(store: KeyValueStore, key: string, fallback: T): T {
  try {
    const raw = store.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(store: KeyValueStore, key: string, value: unknown): void {
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage disabled: the library is a convenience, not a contract.
  }
}

export function makeLibrary(store: KeyValueStore) {
  return {
    list(): SavedDoc[] {
      return read<SavedDoc[]>(store, DOCS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt)
    },
    save(doc: Omit<SavedDoc, 'id' | 'updatedAt'> & { id?: string }, now = Date.now()): SavedDoc {
      const docs = read<SavedDoc[]>(store, DOCS_KEY, [])
      const id = doc.id ?? `${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`
      const saved: SavedDoc = { id, title: doc.title, source: doc.source, themeId: doc.themeId, updatedAt: now }
      write(store, DOCS_KEY, [saved, ...docs.filter((d) => d.id !== id)])
      return saved
    },
    remove(id: string): void {
      write(store, DOCS_KEY, read<SavedDoc[]>(store, DOCS_KEY, []).filter((d) => d.id !== id))
    },
    loadDraft(): Draft | null {
      const draft = read<Draft | null>(store, DRAFT_KEY, null)
      return draft && typeof draft.source === 'string' ? draft : null
    },
    saveDraft(draft: Draft): void {
      write(store, DRAFT_KEY, draft)
    },
  }
}

export type Library = ReturnType<typeof makeLibrary>

const DIAGRAM_DECLARATION = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|mindmap|requirementDiagram|C4\w*|gantt|pie|journey|timeline|gitGraph|quadrantChart|xychart-beta|sankey-beta|block-beta|packet-beta|kanban|architecture-beta)\b/i

/** Turns "stateDiagram-v2" into "State diagram", "xychart-beta" into "Xy chart". */
function humanizeKind(declaration: string): string {
  const words = declaration
    .replace(/-(v\d|beta)$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase()
}

/**
 * A name for the diagram: its own `title` if it has one, then the first label a
 * reader would recognise, and only then the kind of diagram it is. "flowchart
 * LR" is a declaration, not a name, so it is never the answer.
 */
export function suggestTitle(source: string): string {
  const declared = /^\s*title\s*:?\s+(.+)$/m.exec(source)?.[1]?.trim()
  if (declared) return declared.slice(0, 60)

  const lines = source.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('%%'))
  const first = lines[0]
  if (first === undefined) return 'Untitled'

  const kind = DIAGRAM_DECLARATION.exec(first)?.[1]
  if (kind === undefined) return first.slice(0, 60)

  for (const line of lines.slice(1)) {
    const label = /\[\(?"?([^\]|(){}"]{2,})"?\)?\]|\(\(([^)]{2,})\)\)|\{\{?([^}]{2,})\}?\}|"([^"]{2,})"/.exec(line)
    const text = label?.slice(1).find(Boolean)?.trim()
    if (text) return `${humanizeKind(kind)} — ${text}`.slice(0, 60)
  }
  return humanizeKind(kind)
}
