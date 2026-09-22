import type { ParseError } from '@/core/parse'
import { getTheme, hasTheme, type Theme } from '@/core/theme'
import type { Rendered } from './pipeline'

export const CUSTOM_THEME_ID = 'custom'

export interface DiagramState {
  source: string
  themeId: string
  /** A user-authored theme, selectable as CUSTOM_THEME_ID. */
  customTheme: Theme | null
  /** Bumps when a different document is loaded, so the viewport refits. */
  docVersion: number
  /** Group collapse toggles layered over the source's directives. */
  collapsedOverrides: Record<string, boolean>
  /** Last successful render. Survives compile errors by design. */
  rendered: Rendered | null
  error: ParseError | null
  warnings: string[]
  pending: boolean
  /** A compile has finished at least once — successfully, or not. */
  settled: boolean
  lastLayoutMs: number | null
}

export type DiagramAction =
  | { type: 'edit'; source: string }
  | { type: 'load'; source: string; themeId?: string }
  | { type: 'set-theme'; themeId: string }
  | { type: 'set-custom-theme'; theme: Theme | null }
  | { type: 'toggle-group'; groupId: string; currentlyCollapsed: boolean }
  | { type: 'set-collapsed'; overrides: Record<string, boolean> }
  | { type: 'compile-start' }
  | { type: 'compile-cleared' }
  | { type: 'compile-ok'; rendered: Rendered; warnings: string[]; elapsedMs: number }
  | { type: 'compile-error'; error: ParseError }

export function initialState(source: string, themeId: string): DiagramState {
  return { source, themeId, customTheme: null, docVersion: 0, collapsedOverrides: {}, rendered: null, error: null, warnings: [], pending: false, settled: false, lastLayoutMs: null }
}

/** The theme the UI selected (a directive in the source may still override it). */
export function resolveTheme(state: Pick<DiagramState, 'themeId' | 'customTheme'>): Theme {
  if (state.themeId === CUSTOM_THEME_ID && state.customTheme) return state.customTheme
  return getTheme(hasTheme(state.themeId) ? state.themeId : 'clean-light')
}

export function diagramReducer(state: DiagramState, action: DiagramAction): DiagramState {
  switch (action.type) {
    case 'edit':
      return { ...state, source: action.source }
    case 'load':
      return { ...state, source: action.source, themeId: action.themeId ?? state.themeId, docVersion: state.docVersion + 1, collapsedOverrides: {} }
    case 'toggle-group':
      return { ...state, collapsedOverrides: { ...state.collapsedOverrides, [action.groupId]: !action.currentlyCollapsed } }
    case 'set-collapsed':
      return { ...state, collapsedOverrides: action.overrides }
    case 'set-theme':
      return { ...state, themeId: action.themeId }
    case 'set-custom-theme':
      return { ...state, customTheme: action.theme, themeId: action.theme ? CUSTOM_THEME_ID : state.themeId === CUSTOM_THEME_ID ? 'clean-light' : state.themeId }
    case 'compile-start':
      return { ...state, pending: true }
    // An emptied document has no diagram, and leaving the last one on screen
    // makes "new diagram" look like it did nothing.
    case 'compile-cleared':
      return { ...state, rendered: null, error: null, warnings: [], pending: false, settled: true }
    case 'compile-ok':
      return { ...state, rendered: action.rendered, warnings: action.warnings, error: null, pending: false, settled: true, lastLayoutMs: action.elapsedMs }
    case 'compile-error':
      return { ...state, error: action.error, pending: false, settled: true }
  }
}
