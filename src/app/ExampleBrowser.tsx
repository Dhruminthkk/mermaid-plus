import { useEffect, useMemo, useRef, useState } from 'react'
import { CORPUS } from './gallery/corpus'
import { EXAMPLE_KINDS } from './gallery/examples'
import { IconSearch } from './icons'

interface Entry {
  id: string
  kind: string
  kindLabel: string
  tier: 1 | 2
  title: string
  source: string
}

interface Props {
  open: boolean
  onPick: (source: string) => void
  onClose: () => void
}

function allEntries(): Entry[] {
  const out: Entry[] = Object.entries(CORPUS).map(([name, entry]) => ({
    id: `corpus:${name}`, kind: 'showcase', kindLabel: 'Showcase', tier: 1, title: entry.title, source: entry.source,
  }))
  for (const [kind, group] of Object.entries(EXAMPLE_KINDS)) {
    group.examples.forEach((example, i) => {
      out.push({ id: `${kind}:${i}`, kind, kindLabel: group.label, tier: group.tier, title: example.title, source: example.source })
    })
  }
  return out
}

function preview(source: string): string {
  const lines = source.split('\n').filter((l) => !l.trim().startsWith('%%mp:'))
  return lines.slice(0, 5).join('\n')
}

/**
 * Browsing examples is a different job from running a command: you want to see
 * what is there, by category, rather than recall a name. It lives in the app
 * rather than on its own page so picking one does not feel like leaving.
 */
export function ExampleBrowser({ open, onPick, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<string>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const entries = useMemo(allEntries, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const kinds = useMemo(() => {
    const seen = new Map<string, string>([['all', 'All']])
    for (const entry of entries) seen.set(entry.kind, entry.kindLabel)
    return Array.from(seen, ([id, label]) => ({ id, label }))
  }, [entries])

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return entries.filter((entry) =>
      (kind === 'all' || entry.kind === kind)
      && (needle === '' || `${entry.title} ${entry.kindLabel}`.toLowerCase().includes(needle)))
  }, [entries, kind, query])

  if (!open) return null

  return (
    <div className="mp-sheet-backdrop" onPointerDown={onClose}>
      <div className="mp-sheet" role="dialog" aria-modal="true" aria-label="Examples" onPointerDown={(e) => e.stopPropagation()}>
        <header className="mp-sheet-head">
          <div className="mp-sheet-field">
            <IconSearch />
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder={`Search ${entries.length} examples…`}
              aria-label="Search examples"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="button" className="mp-sheet-close" onClick={onClose} aria-label="Close examples">×</button>
        </header>

        <nav className="mp-sheet-kinds" aria-label="Diagram kind">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              className={k.id === kind ? 'mp-on' : undefined}
              aria-pressed={k.id === kind}
              onClick={() => setKind(k.id)}
            >
              {k.label}
            </button>
          ))}
        </nav>

        <div className="mp-sheet-grid">
          {shown.length === 0 && <p className="mp-sheet-empty">Nothing matches “{query}”</p>}
          {shown.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="mp-example-card"
              onClick={() => { onClose(); onPick(entry.source) }}
            >
              <span className="mp-example-kind">{entry.kindLabel}{entry.tier === 2 ? ' · mermaid' : ''}</span>
              <strong>{entry.title}</strong>
              <pre>{preview(entry.source)}</pre>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
