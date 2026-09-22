import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

const MIN_FRACTION = 0.18
const MAX_FRACTION = 0.72
const STORAGE_KEY = 'mp:split'

interface Props {
  /** Hidden entirely when false; the canvas then takes the full width. */
  showFirst: boolean
  first: ReactNode
  second: ReactNode
  aside?: ReactNode
}

function readStored(): number {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(value) && value >= MIN_FRACTION && value <= MAX_FRACTION ? value : 0.38
  } catch {
    return 0.38
  }
}

/** Editor and canvas, with a hairline the user can drag and a remembered ratio. */
export function SplitPane({ showFirst, first, second, aside }: Props) {
  const [fraction, setFraction] = useState(readStored)
  const [dragging, setDragging] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(fraction))
    } catch {
      // A remembered ratio is a nicety, not a requirement.
    }
  }, [fraction])

  const setFromClientX = useCallback((clientX: number) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const next = (clientX - rect.left) / rect.width
    setFraction(Math.min(MAX_FRACTION, Math.max(MIN_FRACTION, next)))
  }, [])

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 0.08 : 0.02
    if (event.key === 'ArrowLeft') setFraction((f) => Math.max(MIN_FRACTION, f - step))
    else if (event.key === 'ArrowRight') setFraction((f) => Math.min(MAX_FRACTION, f + step))
    else return
    event.preventDefault()
  }

  // The divider reads as a hairline but is 7px wide, because a 1px drag target
  // is a target you miss.
  const columns = showFirst
    ? `${(fraction * 100).toFixed(3)}% 7px minmax(0, 1fr)`
    : 'minmax(0, 1fr)'

  return (
    <div
      ref={rootRef}
      className="mp-split"
      data-dragging={dragging ? 'true' : undefined}
      style={{ gridTemplateColumns: aside ? `${columns} var(--mp-aside-width)` : columns }}
    >
      {showFirst && first}
      {showFirst && (
        <div
          className="mp-split-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor"
          aria-valuenow={Math.round(fraction * 100)}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setDragging(true)
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) setFromClientX(e.clientX)
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId)
            setDragging(false)
          }}
          onDoubleClick={() => setFraction(0.38)}
        />
      )}
      {second}
      {aside}
    </div>
  )
}
