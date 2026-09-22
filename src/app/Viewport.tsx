import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Box } from '@/core/layout'
import { Minimap } from './Minimap'

export interface ViewState {
  scale: number
  x: number
  y: number
  /** Container size in CSS px. */
  width: number
  height: number
}

interface Props {
  contentWidth: number
  contentHeight: number
  /** Changing this refits the view even after the user has panned or zoomed. */
  fitKey?: unknown
  /** Move to this box when `key` changes. `fit` zooms to frame it as well. */
  focusTarget?: { box: Box; key: number; fit?: boolean } | null
  /** Minimap content; omit to hide the minimap. */
  overview?: { nodes: Box[]; groups: Box[] } | null
  onViewChange?: (view: ViewState) => void
  children: ReactNode
}

const MIN_SCALE = 0.01
const MAX_SCALE = 8
const FIT_PADDING = 32
/** Below this zoom, labels are under ~5px tall and hide (semantic zoom). */
export const LOD_THRESHOLD = 0.34

function clampScale(s: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
}

/** Visible region in content coordinates. */
export function visibleBox(view: ViewState): Box {
  return { x: -view.x / view.scale, y: -view.y / view.scale, width: view.width / view.scale, height: view.height / view.scale }
}

/**
 * Pan/zoom surface for the diagram. Fits the content on first render and
 * whenever its size changes until the user pans or zooms; after that the view
 * stays put while they edit, and "Fit" brings it back.
 */
export function Viewport({ contentWidth, contentHeight, fitKey, focusTarget, overview, onViewChange, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0, width: 0, height: 0 })
  const userTouched = useRef(false)
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number; pointerId: number; active: boolean } | null>(null)
  const dragged = useRef(false)
  const DRAG_THRESHOLD = 4

  const containerSize = () => {
    const el = containerRef.current
    if (!el) return { width: 0, height: 0 }
    const r = el.getBoundingClientRect()
    return { width: r.width, height: r.height }
  }

  const fit = useCallback(() => {
    const { width: cw, height: ch } = containerSize()
    if (cw === 0 || contentWidth === 0 || contentHeight === 0) return
    const scale = clampScale(Math.min((cw - FIT_PADDING * 2) / contentWidth, (ch - FIT_PADDING * 2) / contentHeight, 1))
    setView({ scale, x: (cw - contentWidth * scale) / 2, y: (ch - contentHeight * scale) / 2, width: cw, height: ch })
  }, [contentWidth, contentHeight])

  useEffect(() => {
    userTouched.current = false
  }, [fitKey])

  useEffect(() => {
    if (!userTouched.current) fit()
  }, [fit, fitKey])

  // Keep the container size current so the visible box is right after resizes.
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const { width, height } = containerSize()
      setView((v) => (v.width === width && v.height === height ? v : { ...v, width, height }))
      if (!userTouched.current) fit()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit])

  useEffect(() => {
    onViewChange?.(view)
  }, [view, onViewChange])

  useEffect(() => {
    if (!focusTarget) return
    const { width: cw, height: ch } = containerSize()
    if (cw === 0) return
    const { box, fit: shouldFit } = focusTarget
    userTouched.current = true
    setView((v) => {
      const scale = shouldFit && box.width > 0 && box.height > 0
        ? clampScale(Math.min((cw - FIT_PADDING * 3) / box.width, (ch - FIT_PADDING * 5) / box.height, 1.6))
        : v.scale
      return {
        ...v,
        width: cw,
        height: ch,
        scale,
        x: cw / 2 - (box.x + box.width / 2) * scale,
        y: ch / 2 - (box.y + box.height / 2) * scale,
      }
    })
  }, [focusTarget])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      userTouched.current = true
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      setView((v) => {
        const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))
        const scale = clampScale(v.scale * factor)
        const k = scale / v.scale
        return { ...v, scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const zoomBy = (factor: number) => {
    const { width: cw, height: ch } = containerSize()
    userTouched.current = true
    setView((v) => {
      const scale = clampScale(v.scale * factor)
      const k = scale / v.scale
      return { ...v, scale, x: cw / 2 - (cw / 2 - v.x) * k, y: ch / 2 - (ch / 2 - v.y) * k }
    })
  }

  const navigate = (cx: number, cy: number) => {
    const { width: cw, height: ch } = containerSize()
    userTouched.current = true
    setView((v) => ({ ...v, x: cw / 2 - cx * v.scale, y: ch / 2 - cy * v.scale }))
  }

  // Pointer capture starts only once a drag actually moves; capturing on
  // pointerdown would redirect the click to this div and break node selection.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    drag.current = { startX: e.clientX, startY: e.clientY, originX: view.x, originY: view.y, pointerId: e.pointerId, active: false }
    dragged.current = false
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.active) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      d.active = true
      dragged.current = true
      userTouched.current = true
      e.currentTarget.setPointerCapture(d.pointerId)
    }
    setView((v) => ({ ...v, x: d.originX + dx, y: d.originY + dy }))
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (d?.active && e.currentTarget.hasPointerCapture(d.pointerId)) e.currentTarget.releasePointerCapture(d.pointerId)
  }
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragged.current) {
      e.stopPropagation()
      dragged.current = false
    }
  }

  const lod = view.scale < LOD_THRESHOLD ? 'low' : 'full'

  // Keyboard: arrows pan, +/- zoom, 0 fits, 1 resets to 100%.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    const step = e.shiftKey ? 120 : 40
    const pan = (dx: number, dy: number) => { userTouched.current = true; setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy })) }
    switch (e.key) {
      case 'ArrowLeft': pan(step, 0); break
      case 'ArrowRight': pan(-step, 0); break
      case 'ArrowUp': pan(0, step); break
      case 'ArrowDown': pan(0, -step); break
      case '+': case '=': zoomBy(1.25); break
      case '-': case '_': zoomBy(1 / 1.25); break
      case '0': userTouched.current = true; fit(); break
      case '1': userTouched.current = true; setView((v) => ({ ...v, scale: 1 })); break
      default: return
    }
    e.preventDefault()
  }

  return (
    <div
      ref={containerRef}
      className="mp-viewport"
      tabIndex={0}
      role="application"
      aria-label="Diagram canvas. Arrow keys pan, plus and minus zoom, 0 fits, 1 resets."
      onKeyDown={onKeyDown}
      data-mp-scale={view.scale.toFixed(3)}
      data-lod={lod}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      <div className="mp-viewport-content" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
        {children}
      </div>
      {overview && view.width > 0 && (
        <div className="mp-minimap-host">
          <Minimap contentWidth={contentWidth} contentHeight={contentHeight} nodes={overview.nodes} groups={overview.groups} visible={visibleBox(view)} onNavigate={navigate} />
        </div>
      )}
      <div className="mp-viewport-controls" onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
        <span className="mp-viewport-zoom">{Math.round(view.scale * 100)}%</span>
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => { userTouched.current = true; fit() }}>Fit</button>
        <button type="button" onClick={() => { userTouched.current = true; setView((v) => ({ ...v, scale: 1 })) }}>100%</button>
      </div>
    </div>
  )
}
