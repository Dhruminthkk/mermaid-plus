import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { neighborhood } from '@/core/ir'
import type { Box } from '@/core/layout'
import { DiagramSvg } from '@/core/render'
import type { DiagramState } from './diagram-state'
import { resolveTheme } from './diagram-state'
import { LOD_THRESHOLD, Viewport, visibleBox, type ViewState } from './Viewport'
import { CanvasTools } from './CanvasTools'
import { DetailCard } from './DetailCard'
import { DetailPanel } from './DetailPanel'
import { Legend } from './Legend'
import { describeEdge, describeGroup, describeNode, neighbourhoodOf, type Detail } from './explain'
import { firstNode, neighbourInDirection, type Direction } from './navigate'
import { elkDirection } from '@/core/layout'
import { stepHighlight as highlightForStep, type Step } from './walkthrough'

/** Where the pointer has to rest before an explanation appears. */
const HOVER_DELAY_MS = 260

interface Hovered {
  id: string
  kind: 'node' | 'edge' | 'group'
  at: { x: number; y: number; flipX: boolean; flipY: boolean }
}

interface Props {
  state: DiagramState
  selectedNodeId?: string | null
  sourceLineOf?: (id: string) => number | undefined
  /** The step being presented, if a walkthrough is running. */
  step?: Step | null
  onNodeClick?: (id: string | null) => void
  onGroupToggle?: (groupId: string, currentlyCollapsed: boolean) => void
  onExpandAll?: () => void
  /** Whether the diagram may animate. */
  motion?: boolean
  /** Rewrites the source's flow direction. Absent when the source is read-only. */
  onDirection?: (direction: 'DOWN' | 'RIGHT' | 'UP' | 'LEFT') => void
  /** Opens the example sheet from the blank state. */
  onBrowseExamples?: () => void
}

export function Canvas({ state, selectedNodeId = null, sourceLineOf, step = null, onNodeClick, onGroupToggle, onExpandAll, motion = true, onDirection, onBrowseExamples }: Props) {
  // The source can pin a theme via directive; the render carries the effective one.
  const theme = state.rendered?.theme ?? resolveTheme(state)
  // "The first compile has finished", not "a diagram exists". A document that
  // fails to parse has also settled: waiting for a render that will never come
  // left the app reporting itself unready forever.
  const blank = state.source.trim() === ''
  const ready = state.settled && !state.pending
  const tier1 = state.rendered?.tier === 1 ? state.rendered : null

  const [query, setQuery] = useState('')
  const [focusHops, setFocusHops] = useState<number | null>(null)
  const [focusTarget, setFocusTarget] = useState<{ box: Box; key: number; fit?: boolean } | null>(null)
  const [visible, setVisible] = useState<Box | null>(null)
  const [lod, setLod] = useState<'full' | 'low'>('full')
  const [hovered, setHovered] = useState<Hovered | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const frame = useRef<number | null>(null)
  const hoverTimer = useRef<number | null>(null)
  // The node just clicked: its tooltip stays down until the pointer moves off it.
  const suppressed = useRef<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const onViewChange = useCallback((view: ViewState) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      setVisible(view.width > 0 ? visibleBox(view) : null)
      setLod(view.scale < LOD_THRESHOLD ? 'low' : 'full')
    })
  }, [])

  const matchSet = useMemo(() => {
    if (!tier1 || !query.trim()) return null
    const q = query.trim().toLowerCase()
    return new Set(tier1.layout.ir.nodes.filter((n) => n.id.toLowerCase().includes(q) || n.label.toLowerCase().includes(q)).map((n) => n.id))
  }, [tier1, query])

  const focusSet = useMemo(() => {
    if (!tier1 || !selectedNodeId || focusHops === null) return null
    if (!tier1.layout.ir.nodes.some((n) => n.id === selectedNodeId)) return null
    return neighborhood(tier1.layout.ir, selectedNodeId, focusHops)
  }, [tier1, selectedNodeId, focusHops])

  const overview = useMemo(() => (tier1 && tier1.layout.nodes.length >= 12 ? { nodes: tier1.layout.nodes, groups: tier1.layout.groups } : null), [tier1])

  const jumpToMatch = () => {
    if (!tier1 || !matchSet || matchSet.size === 0) return
    const first = tier1.layout.nodes.find((n) => matchSet.has(n.id))
    if (first) {
      setFocusTarget({ box: first, key: Date.now() })
      onNodeClick?.(first.id)
    }
  }

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clicks inside the overlays are theirs, not the canvas's.
    if ((e.target as Element).closest('.mp-detail, .mp-panel, .mp-legend, .mp-canvas-tools, .mp-walkthrough')) return
    const id = (e.target as Element).closest<SVGGElement>('[data-node-id]')?.dataset['nodeId'] ?? null
    onNodeClick?.(id)
    // The explanation moves to the panel at the bottom; a card floating over the
    // node would cover the thing it is describing.
    cancelHoverTimer()
    setHovered(null)
    suppressed.current = id
  }

  /** Anchors the card to the element, flipping it back inside the canvas. */
  const placeCard = (element: Element, kind: Hovered['kind']): Hovered | null => {
    const root = rootRef.current
    if (!root) return null
    const bounds = root.getBoundingClientRect()
    const box = element.getBoundingClientRect()
    const x = box.right - bounds.left + 10
    const y = box.top - bounds.top
    const id = kind === 'node'
      ? (element as HTMLElement).dataset['nodeId']
      : kind === 'edge' ? (element as HTMLElement).dataset['edgeId'] : (element as HTMLElement).dataset['groupId']
    if (!id) return null
    return {
      id,
      kind,
      at: {
        x: x + 300 > bounds.width ? box.left - bounds.left - 10 : x,
        y,
        flipX: x + 300 > bounds.width,
        flipY: y + 260 > bounds.height && y > 260,
      },
    }
  }

  const cancelHoverTimer = () => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current)
    hoverTimer.current = null
  }

  const onPointerOver = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tier1) return
    const element = (e.target as Element).closest<SVGGElement>('[data-node-id],[data-edge-id],[data-group-id]')
    cancelHoverTimer()
    // Pointing at anything else — the background, a control — puts the card away.
    if (!element) {
      suppressed.current = null
      setHovered(null)
      return
    }
    const kind: Hovered['kind'] = element.dataset['nodeId'] ? 'node' : element.dataset['edgeId'] ? 'edge' : 'group'
    const id = element.dataset['nodeId'] ?? element.dataset['edgeId'] ?? element.dataset['groupId'] ?? null
    if (id !== null && id === suppressed.current) return
    suppressed.current = null
    hoverTimer.current = window.setTimeout(() => setHovered(placeCard(element, kind)), HOVER_DELAY_MS)
  }

  const onPointerLeaveCanvas = () => {
    cancelHoverTimer()
    suppressed.current = null
    setHovered(null)
  }

  const collapsedSet = useMemo(() => new Set(tier1?.collapsed ?? []), [tier1])

  const stepHighlight = useMemo(
    () => (tier1 && step ? highlightForStep(tier1.layout.ir, step) : null),
    [step, tier1],
  )

  // Frame exactly what the step is about, so the audience looks where you point.
  useEffect(() => {
    if (!tier1 || !step) return
    const ids = stepHighlight?.nodes
    const boxes = ids
      ? [...tier1.layout.nodes, ...tier1.layout.groups].filter((b) => ids.has(b.id))
      : [...tier1.layout.nodes, ...tier1.layout.groups]
    if (boxes.length === 0) return
    const minX = Math.min(...boxes.map((b) => b.x))
    const minY = Math.min(...boxes.map((b) => b.y))
    const maxX = Math.max(...boxes.map((b) => b.x + b.width))
    const maxY = Math.max(...boxes.map((b) => b.y + b.height))
    setFocusTarget({ box: { x: minX, y: minY, width: maxX - minX, height: maxY - minY }, key: step.number, fit: true })
  }, [step, stepHighlight, tier1])

  // Explanations are for reading a diagram, not for skimming a thumbnail.
  const showCard = hovered !== null && tier1 !== null && lod === 'full'
  const detail = useMemo<Detail | null>(() => {
    if (!showCard || !tier1) return null
    const ir = tier1.layout.ir
    if (hovered.kind === 'node') return describeNode(ir, hovered.id, { sourceLine: sourceLineOf?.(hovered.id) })
    if (hovered.kind === 'edge') return describeEdge(ir, hovered.id)
    return describeGroup(ir, hovered.id, collapsedSet.has(hovered.id))
  }, [collapsedSet, hovered, showCard, sourceLineOf, tier1])

  // Selecting a node highlights what it touches. Hovering only explains — a
  // highlight that follows the pointer is noise while you are reading.
  const emphasis = useMemo(() => {
    if (stepHighlight) return stepHighlight
    if (!tier1 || !selectedNodeId || focusSet) return null
    if (!tier1.layout.ir.nodes.some((n) => n.id === selectedNodeId)) return null
    return neighbourhoodOf(tier1.layout.ir, selectedNodeId)
  }, [focusSet, selectedNodeId, stepHighlight, tier1])

  // The bottom panel explains whatever is selected, unless a walkthrough is
  // speaking — two things talking at once from the same place is one too many.
  const selectionDetail = useMemo<Detail | null>(() => {
    if (!tier1 || !selectedNodeId || step) return null
    return describeNode(tier1.layout.ir, selectedNodeId, { sourceLine: sourceLineOf?.(selectedNodeId) })
  }, [selectedNodeId, sourceLineOf, step, tier1])

  useEffect(() => {
    if (!selectionDetail) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onNodeClick?.(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onNodeClick, selectionDetail])

  /** Moves the selection to `id` and brings it into view. */
  const goTo = useCallback((id: string) => {
    const box = tier1?.layout.nodes.find((n) => n.id === id)
    if (!box) return
    setFocusTarget({ box, key: Date.now() })
    onNodeClick?.(id)
    cancelHoverTimer()
    setHovered(null)
    suppressed.current = null
  }, [onNodeClick, tier1])

  const ARROWS: Record<string, Direction> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  }

  /**
   * The diagram from the keyboard. Arrows walk the graph rather than the
   * screen: from a fan-out, Right takes the branch that points right, and there
   * is no move to a node that merely sits nearby. Everything the mouse can do
   * to explain a diagram is reachable this way, with the panel at the bottom
   * narrating each step.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!tier1 || event.metaKey || event.ctrlKey || event.altKey) return
    // A running walkthrough owns the arrow keys: they advance the story.
    if (step) return
    const direction = ARROWS[event.key]
    if (direction) {
      const next = selectedNodeId === null
        ? firstNode(tier1.layout)
        : neighbourInDirection(tier1.layout, selectedNodeId, direction)
      if (next === null) return
      event.preventDefault()
      goTo(next)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && selectedNodeId) {
      const node = tier1.layout.ir.nodes.find((n) => n.id === selectedNodeId)
      if (node?.shapeHint === 'collapsed' && onGroupToggle) {
        event.preventDefault()
        onGroupToggle(selectedNodeId, collapsedSet.has(selectedNodeId))
      }
    }
  }

  useEffect(() => cancelHoverTimer, [])

  return (
    <div
      ref={rootRef}
      className="mp-canvas-root"
      data-mp-ready={ready ? 'true' : 'false'}
      data-stale={state.error ? 'true' : 'false'}
      style={{ background: theme.color.canvas }}
      tabIndex={0}
      role="application"
      aria-label="Diagram. Arrow keys follow connections; Escape clears the selection."
      onKeyDown={onKeyDown}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeaveCanvas}
    >
      {state.error && (
        <div className="mp-error-strip" role="alert" title={state.error.detail}>
          {state.error.line !== undefined ? `Line ${state.error.line}: ` : ''}
          {state.error.message}
        </div>
      )}
      {tier1 && (
        <CanvasTools
          query={query}
          onQuery={setQuery}
          matchCount={matchSet?.size ?? 0}
          onJump={jumpToMatch}
          selectedNodeId={selectedNodeId}
          focusHops={focusHops}
          onFocusHops={setFocusHops}
          collapsedCount={collapsedSet.size}
          onExpandAll={() => onExpandAll?.()}
          legendOpen={legendOpen}
          onToggleLegend={() => setLegendOpen((v) => !v)}
          direction={tier1 ? elkDirection(tier1.layout.ir) : undefined}
          onDirection={tier1 ? onDirection : undefined}
          navigation={tier1.layout.nodes.length >= 8 || focusHops !== null || collapsedSet.size > 0}
        />
      )}
      {state.rendered ? (
        <Viewport contentWidth={state.rendered.width} contentHeight={state.rendered.height} fitKey={state.docVersion} focusTarget={focusTarget} overview={overview} onViewChange={onViewChange}>
          {tier1 ? (
            <DiagramSvg
              layout={tier1.layout}
              theme={theme}
              motion={motion}
              icons={tier1.icons}
              selectedNodeId={selectedNodeId}
              focusSet={step ? null : focusSet}
              matchSet={matchSet}
              visible={visible}
              lod={lod}
              emphasis={emphasis}
              hoveredId={showCard && hovered.kind === 'node' ? hovered.id : null}
              onGroupToggle={onGroupToggle ? (id) => onGroupToggle(id, collapsedSet.has(id)) : undefined}
            />
          ) : (
            <div className="mp-tier2-host" dangerouslySetInnerHTML={{ __html: state.rendered.tier === 2 ? state.rendered.svg : '' }} />
          )}
        </Viewport>
      ) : (
        <div className="mp-canvas-empty">
          {blank ? (
            // An invitation, not a diagram. Showing someone else's system on
            // arrival makes the first move "delete this" rather than "type".
            <div className="mp-blank" role="status">
              <h2>Start typing</h2>
              <p>Write Mermaid on the left and it draws as you go.</p>
              <pre>{'flowchart LR\n  a[Client] --> b[API]\n  b --> c[(Database)]'}</pre>
              <div className="mp-blank-actions">
                {onBrowseExamples && (
                  <button type="button" onClick={onBrowseExamples}>Browse examples</button>
                )}
                <span>or press <kbd>{'\u2318'}K</kbd> to search everything</span>
              </div>
            </div>
          ) : 'Waiting for a diagram…'}
        </div>
      )}

      {legendOpen && tier1 && <Legend ir={tier1.layout.ir} theme={theme} onClose={() => setLegendOpen(false)} />}

      {detail && hovered && <DetailCard detail={detail} at={hovered.at} />}

      {selectionDetail && (
        <DetailPanel detail={selectionDetail} onPick={(id) => onNodeClick?.(id)} onClose={() => onNodeClick?.(null)} />
      )}
    </div>
  )
}
