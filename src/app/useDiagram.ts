import { useCallback, useEffect, useReducer, useRef } from 'react'
import { LayoutClient, SupersededError } from '@/core/layout'
import type { Theme } from '@/core/theme'
import { renderTier2 } from '@/compat'
import { compile } from './pipeline'
import { diagramReducer, initialState, resolveTheme } from './diagram-state'

/**
 * How long to wait after a keystroke before re-drawing.
 *
 * A fixed 150ms made every edit feel late: on a small diagram the pipeline
 * itself takes about 40ms, so five-sixths of the delay was this timer. The wait
 * now follows the last compile — short while the diagram is cheap, backing off
 * only once it is expensive enough that re-laying out mid-word would be waste.
 *
 * Overshooting is cheap in the other direction too: the layout client
 * supersedes a request that a newer edit has already made obsolete, so a short
 * wait queues nothing.
 */
const MIN_DEBOUNCE_MS = 40
const MAX_DEBOUNCE_MS = 180

function debounceFor(lastCompileMs: number | null): number {
  if (lastCompileMs === null) return MIN_DEBOUNCE_MS
  return Math.min(MAX_DEBOUNCE_MS, Math.max(MIN_DEBOUNCE_MS, Math.round(lastCompileMs * 0.6)))
}

export function useDiagram(initialSource: string, initialThemeId: string) {
  const [state, dispatch] = useReducer(diagramReducer, initialState(initialSource, initialThemeId))
  const clientRef = useRef<LayoutClient | null>(null)

  // Declared before the compile effect so it runs first on mount. The worker is
  // created in an effect, not useMemo, so StrictMode's mount → unmount → mount
  // cycle disposes and re-creates it instead of leaving a dead worker behind.
  useEffect(() => {
    clientRef.current = LayoutClient.create()
    return () => {
      clientRef.current?.dispose()
      clientRef.current = null
    }
  }, [])

  // Read, not depended on: a change in timing must not re-run the compile.
  const lastCompileMs = useRef<number | null>(null)
  lastCompileMs.current = state.lastLayoutMs

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      const client = clientRef.current
      if (!client) return
      // An empty document is not a broken one: nothing to draw, nothing to say,
      // and nothing left over from whatever was there before.
      if (state.source.trim() === '') {
        dispatch({ type: 'compile-cleared' })
        return
      }
      dispatch({ type: 'compile-start' })
      try {
        const result = await compile(state.source, resolveTheme(state), (ir, theme) => client.layout(ir, theme), renderTier2, { collapsedOverrides: state.collapsedOverrides })
        if (result.ok) {
          dispatch({ type: 'compile-ok', rendered: result.rendered, warnings: result.warnings, elapsedMs: result.elapsedMs })
          window.__mp = { ...window.__mp, lastLayoutMs: result.elapsedMs, nodeCount: result.rendered.tier === 1 ? result.rendered.layout.nodes.length : 0 }
        } else {
          dispatch({ type: 'compile-error', error: result.error })
        }
      } catch (error) {
        // A superseded request is expected during typing; anything else is a bug.
        if (!(error instanceof SupersededError)) console.error(error)
      }
    }, debounceFor(lastCompileMs.current))
    return () => window.clearTimeout(handle)
  }, [state.source, state.themeId, state.customTheme, state.collapsedOverrides])

  const setSource = useCallback((source: string) => dispatch({ type: 'edit', source }), [])
  const load = useCallback((source: string, themeId?: string) => dispatch({ type: 'load', source, themeId }), [])
  const setThemeId = useCallback((themeId: string) => dispatch({ type: 'set-theme', themeId }), [])
  const setCustomTheme = useCallback((theme: Theme | null) => dispatch({ type: 'set-custom-theme', theme }), [])
  const toggleGroup = useCallback((groupId: string, currentlyCollapsed: boolean) => dispatch({ type: 'toggle-group', groupId, currentlyCollapsed }), [])
  const setCollapsed = useCallback((overrides: Record<string, boolean>) => dispatch({ type: 'set-collapsed', overrides }), [])

  return { state, setSource, load, setThemeId, setCustomTheme, toggleGroup, setCollapsed }
}
