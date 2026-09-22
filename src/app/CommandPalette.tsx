import { useEffect, useMemo, useRef, useState } from 'react'
import { IconEnter } from './icons'

export interface Command {
  id: string
  /** Kept out of the idle list; only reachable by typing. Examples are many. */
  secondary?: boolean
  /** What the row reads as. */
  label: string
  /** Where it belongs: "Example", "Theme", "Export", "Action". */
  group: string
  /** Secondary text on the right of the row. */
  hint?: string
  /** Extra words that should match but are not shown. */
  keywords?: string
  run: () => void
}

interface Props {
  open: boolean
  commands: Command[]
  onClose: () => void
}

/**
 * Subsequence match, the behaviour people expect from an editor palette: "flg"
 * finds "Flowchart — Login flow". Earlier and tighter matches rank first, so
 * typing a prefix still puts the obvious answer on top.
 */
function score(haystack: string, needle: string): number | null {
  if (needle === '') return 0
  const text = haystack.toLowerCase()
  let at = -1
  let first = -1
  let gaps = 0
  for (const char of needle.toLowerCase()) {
    const found = text.indexOf(char, at + 1)
    if (found === -1) return null
    if (first === -1) first = found
    else gaps += found - at - 1
    at = found
  }
  return first * 2 + gaps
}

const MAX_ROWS = 60

export function CommandPalette({ open, commands, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    // Focus after the dialog paints, or the caret lands nowhere.
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  const results = useMemo(() => {
    // With no query this is a menu of what you can do, not a dump of every
    // examples; typing brings everything into scope.
    const pool = query.trim() === '' ? commands.filter((c) => !c.secondary) : commands
    const scored = pool
      .map((command) => ({ command, rank: score(`${command.label} ${command.group} ${command.keywords ?? ''}`, query) }))
      .filter((entry): entry is { command: Command; rank: number } => entry.rank !== null)
    scored.sort((a, b) => a.rank - b.rank)
    return scored.slice(0, MAX_ROWS).map((entry) => entry.command)
  }, [commands, query])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  if (!open) return null

  const choose = (command: Command | undefined) => {
    if (!command) return
    onClose()
    command.run()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') setActive((i) => Math.min(i + 1, results.length - 1))
    else if (event.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0))
    else if (event.key === 'Enter') choose(results[active])
    else if (event.key === 'Escape') onClose()
    else return
    event.preventDefault()
  }

  let lastGroup = ''
  return (
    <div className="mp-palette-backdrop" onPointerDown={onClose}>
      <div
        className="mp-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="mp-palette-field">
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search examples, themes and actions…"
            aria-label="Search commands"
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>esc</kbd>
        </div>
        <div className="mp-palette-list" ref={listRef} role="listbox">
          {results.length === 0 && <div className="mp-palette-empty">Nothing matches “{query}”</div>}
          {results.map((command, i) => {
            const heading = command.group !== lastGroup ? command.group : null
            lastGroup = command.group
            return (
              <div key={command.id}>
                {heading && <div className="mp-palette-group">{heading}</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  data-active={i === active ? 'true' : undefined}
                  className="mp-palette-row"
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(command)}
                >
                  <span className="mp-palette-label">{command.label}</span>
                  {command.hint && <span className="mp-palette-hint">{command.hint}</span>}
                  {i === active && <IconEnter className="mp-palette-enter" />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
