import type { Archetype, DiagramIR } from '@/core/ir'
import type { Theme } from '@/core/theme'
import { shapePath } from '@/core/render'

const ARCHETYPE_MEANING: Record<Archetype, string> = {
  service: 'Service or application',
  database: 'Data store',
  queue: 'Queue, topic or stream',
  storage: 'Object or file storage',
  user: 'Person or client',
  external: 'Outside the system',
  decision: 'Branch or condition',
  note: 'Annotation',
  process: 'Step',
  default: 'Step',
}

const SEMANTICS_MEANING: Record<string, string> = {
  flow: 'Flows to',
  async: 'Asynchronous',
  dependency: 'Depends on',
  association: 'Associated with',
  inheritance: 'Inherits from',
  composition: 'Composed of',
  bidirectional: 'Both directions',
}

interface Props {
  ir: DiagramIR
  theme: Theme
  onClose: () => void
}

/**
 * What the shapes and lines in *this* diagram mean. Built from what is actually
 * on the canvas, so it never explains something the reader cannot see.
 */
export function Legend({ ir, theme, onClose }: Props) {
  // Two archetypes can mean the same thing (process and default are both just a
  // step); show that once.
  const seen = new Set<string>()
  const archetypes = Array.from(new Set(ir.nodes.map((n) => n.archetype)))
    .sort((a, b) => (a < b ? -1 : 1))
    .filter((archetype) => {
      const meaning = ARCHETYPE_MEANING[archetype]
      if (seen.has(meaning)) return false
      seen.add(meaning)
      return true
    })
  const swatch = (archetype: Archetype) => ({
    fill: theme.color.archetype[archetype].fill,
    stroke: theme.color.archetype[archetype].stroke,
    strokeWidth: 1.25,
    strokeDasharray: archetype === 'external' ? '3 2' : undefined,
  })
  const semantics = Array.from(new Set(ir.edges.map((e) => e.semantics))).sort()
  const styles = Array.from(new Set(ir.edges.map((e) => e.style))).filter((s) => s !== 'solid').sort()

  return (
    <aside className="mp-legend" aria-label="Legend">
      <header>
        <strong>Legend</strong>
        <button type="button" onClick={onClose} aria-label="Close legend">×</button>
      </header>

      <ul className="mp-legend-list">
        {archetypes.map((archetype) => {
          const path = shapePath(archetype, undefined, 26, 16)
          return (
            <li key={archetype}>
              <svg width="28" height="18" viewBox="-1 -1 28 18" aria-hidden="true">
                {path
                  ? <path d={path} style={swatch(archetype)} />
                  : <rect width="26" height="16" rx={theme.geometry.radius / 2} style={swatch(archetype)} />}
              </svg>
              <span>{ARCHETYPE_MEANING[archetype]}</span>
            </li>
          )
        })}
      </ul>

      {(semantics.length > 1 || styles.length > 0) && (
        <ul className="mp-legend-list">
          {semantics.map((semantic) => (
            <li key={semantic}>
              <svg width="28" height="18" viewBox="0 0 28 18" aria-hidden="true">
                <path d="M1 9 H23" style={{ stroke: theme.color.edge, strokeWidth: 1.5, fill: 'none' }}
                      strokeDasharray={semantic === 'async' ? '5 3' : semantic === 'dependency' ? '4 3' : undefined} />
                <path d="M22 5 L27 9 L22 13 Z" style={{ fill: theme.color.edge }} />
              </svg>
              <span>{SEMANTICS_MEANING[semantic] ?? semantic}</span>
            </li>
          ))}
          {styles.map((style) => (
            <li key={style}>
              <svg width="28" height="18" viewBox="0 0 28 18" aria-hidden="true">
                <path d="M1 9 H27" style={{ stroke: theme.color.edge, fill: 'none', strokeWidth: style === 'thick' ? 3 : 1.5 }}
                      strokeDasharray={style === 'dotted' ? '2 4' : style === 'dashed' ? '6 4' : undefined} />
              </svg>
              <span className="mp-legend-style">{style}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
