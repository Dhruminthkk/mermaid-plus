import { useEffect } from 'react'
import type { Step } from './walkthrough'

interface Props {
  steps: Step[]
  /** Index into `steps`, or null when the walkthrough is not running. */
  current: number | null
  playing: boolean
  onGo: (index: number) => void
  onTogglePlay: () => void
  onExit: () => void
}

/** How long each step holds when playing. */
export const STEP_DURATION_MS = 5200

/**
 * A diagram that walks itself. Presenting an architecture is mostly saying
 * "first this, then this" — the controls stay small and the note does the work.
 */
export function WalkthroughBar({ steps, current, playing, onGo, onTogglePlay, onExit }: Props) {
  useEffect(() => {
    if (current === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') return
      if (event.key === 'ArrowRight' || event.key === ' ') onGo(Math.min(current + 1, steps.length - 1))
      else if (event.key === 'ArrowLeft') onGo(Math.max(current - 1, 0))
      else if (event.key === 'Escape') onExit()
      else return
      event.preventDefault()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [current, onExit, onGo, steps.length])

  if (current === null || steps.length === 0) return null
  const step = steps[current]
  if (!step) return null

  return (
    <div className="mp-walkthrough" role="region" aria-label="Walkthrough">
      {(step.title || step.note) && (
        <div className="mp-wt-note" key={current}>
          {step.title && <strong>{step.title}</strong>}
          {step.note && <p>{step.note}</p>}
        </div>
      )}

      <div className="mp-wt-bar">
        <button type="button" onClick={() => onGo(current - 1)} disabled={current === 0} aria-label="Previous step">‹</button>
        <button type="button" className="mp-wt-play" onClick={onTogglePlay} aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <button type="button" onClick={() => onGo(current + 1)} disabled={current === steps.length - 1} aria-label="Next step">›</button>

        <ol className="mp-wt-dots">
          {steps.map((s, i) => (
            <li key={s.number}>
              <button
                type="button"
                aria-current={i === current ? 'step' : undefined}
                aria-label={`Step ${s.number}${s.title ? `: ${s.title}` : ''}`}
                onClick={() => onGo(i)}
              />
            </li>
          ))}
        </ol>

        <span className="mp-wt-count">{current + 1}<i>/</i>{steps.length}</span>
        <button type="button" className="mp-wt-exit" onClick={onExit} aria-label="Exit walkthrough">×</button>
      </div>
    </div>
  )
}
