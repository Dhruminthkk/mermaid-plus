import type { Theme } from '@/core/theme'
import type { DiagramState } from './diagram-state'
import { IconWarn } from './icons'

interface Props {
  state: DiagramState
  theme: Theme
  walkthroughSteps: number
  presenting: boolean
  onPresent: () => void
}

/** A readout, not a toolbar: what is on the canvas, and what it cost to draw. */
export function StatusBar({ state, theme, walkthroughSteps, presenting, onPresent }: Props) {
  const rendered = state.rendered
  const tier1 = rendered?.tier === 1 ? rendered : null
  const kind = rendered === null ? null : rendered.tier === 1 ? rendered.layout.ir.kind : rendered.kind

  return (
    <footer className="mp-statusbar">
      <span className="mp-status-kind">{kind ?? 'no diagram'}</span>
      {tier1 && (
        <span className="mp-status-count">
          <b>{tier1.layout.nodes.length}</b> nodes
          <span className="mp-status-sep">·</span>
          <b>{tier1.layout.edges.length}</b> edges
          {tier1.collapsed.length > 0 && (
            <>
              <span className="mp-status-sep">·</span>
              <b>{tier1.collapsed.length}</b> collapsed
            </>
          )}
        </span>
      )}
      {rendered && !tier1 && <span className="mp-status-count">rendered by mermaid</span>}

      {walkthroughSteps > 0 && !presenting && (
        <button type="button" className="mp-status-present" onClick={onPresent}>
          ▶ Present <b>{walkthroughSteps}</b> steps
        </button>
      )}

      <span className="mp-status-spacer" />

      {state.warnings.length > 0 && (
        <span className="mp-status-warn" title={state.warnings.join('\n')}>
          <IconWarn />
          {state.warnings.length} warning{state.warnings.length > 1 ? 's' : ''}
        </span>
      )}
      {state.error && <span className="mp-status-err" title={state.error.message}>{state.error.message}</span>}
      <span className="mp-status-theme">{theme.name} · {theme.mode}</span>
      {state.lastLayoutMs !== null && (
        <span className="mp-status-time">{Math.round(state.lastLayoutMs)}<i>ms</i></span>
      )}
      <span className="mp-status-dot" data-busy={state.pending ? 'true' : undefined} aria-hidden="true" />
    </footer>
  )
}
