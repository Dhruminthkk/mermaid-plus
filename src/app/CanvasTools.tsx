interface Props {
  query: string
  onQuery: (q: string) => void
  matchCount: number
  onJump: () => void
  selectedNodeId: string | null
  focusHops: number | null
  onFocusHops: (hops: number | null) => void
  collapsedCount: number
  onExpandAll: () => void
  legendOpen: boolean
  onToggleLegend: () => void
  /** Current flow direction, and where to write a change. Absent on tier 2. */
  direction?: 'DOWN' | 'RIGHT' | 'UP' | 'LEFT'
  onDirection?: (direction: 'DOWN' | 'RIGHT' | 'UP' | 'LEFT') => void
  /**
   * Whether to offer the aids for getting around a big diagram — find, match
   * count, focus-by-hops. A six-node chain needs none of them, but it still
   * wants the flow direction and the legend, which describe the document rather
   * than the view.
   */
  navigation: boolean
}

/** Overlay controls for navigating large diagrams: search, focus, expand-all. */
const DIRECTIONS = [
  { value: 'DOWN', glyph: '\u2193', label: 'Top to bottom' },
  { value: 'RIGHT', glyph: '\u2192', label: 'Left to right' },
  { value: 'UP', glyph: '\u2191', label: 'Bottom to top' },
  { value: 'LEFT', glyph: '\u2190', label: 'Right to left' },
] as const

export function CanvasTools({ query, onQuery, matchCount, onJump, selectedNodeId, focusHops, onFocusHops, collapsedCount, onExpandAll, legendOpen, onToggleLegend, direction, onDirection, navigation }: Props) {
  return (
    <div className="mp-canvas-tools" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      {navigation && (
        <input
          type="search"
          placeholder="Find node…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onJump(); if (e.key === 'Escape') onQuery('') }}
          aria-label="Find node"
        />
      )}
      {direction && onDirection && (
        // Flipping the flow rewrites the source rather than holding view state:
        // it changes the whole picture, so it belongs in the document.
        <span className="mp-chip mp-chip-group" role="radiogroup" aria-label="Flow direction">
          {DIRECTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={direction === option.value}
              aria-label={option.label}
              title={option.label}
              className={direction === option.value ? 'mp-on' : undefined}
              onClick={() => onDirection(option.value)}
            >
              {option.glyph}
            </button>
          ))}
        </span>
      )}
      {navigation && query && <span className="mp-chip" data-testid="match-count">{matchCount} match{matchCount === 1 ? '' : 'es'}</span>}
      {navigation && selectedNodeId && (
        <span className={`mp-chip${focusHops !== null ? ' mp-on' : ''}`}>
          <button type="button" onClick={() => onFocusHops(focusHops === null ? 1 : null)} aria-pressed={focusHops !== null}>
            Focus {selectedNodeId}
          </button>
          {focusHops !== null && (
            <>
              <input type="range" min={0} max={6} value={focusHops} onChange={(e) => onFocusHops(Number(e.target.value))} aria-label="Focus hops" />
              <span>{focusHops} hop{focusHops === 1 ? '' : 's'}</span>
            </>
          )}
        </span>
      )}
      <span className={`mp-chip${legendOpen ? ' mp-on' : ''}`}>
        <button type="button" onClick={onToggleLegend} aria-pressed={legendOpen}>Legend</button>
      </span>
      {collapsedCount > 0 && (
        <span className="mp-chip">
          <button type="button" onClick={onExpandAll}>Expand {collapsedCount} collapsed</button>
        </span>
      )}
    </div>
  )
}
