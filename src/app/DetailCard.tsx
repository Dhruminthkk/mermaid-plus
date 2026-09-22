import type { Connection, Detail } from './explain'

interface Props {
  detail: Detail
  /** Position within the canvas, in CSS pixels. */
  at: { x: number; y: number; flipX: boolean; flipY: boolean }
}

const SEMANTICS: Record<string, string> = {
  flow: 'flows to',
  async: 'asynchronously to',
  dependency: 'depends on',
  association: 'associated with',
  inheritance: 'inherits from',
  composition: 'composed of',
  bidirectional: 'both ways with',
}

function Links({ title, links }: { title: string; links: Connection[] }) {
  if (links.length === 0) return null
  return (
    <div className="mp-detail-links">
      <h4>{title} <span>{links.length}</span></h4>
      <ul>
        {links.slice(0, 8).map((link) => (
          <li key={link.edgeId}>
            <span>{link.label}</span>
            {link.edgeLabel && <em>{link.edgeLabel}</em>}
          </li>
        ))}
        {links.length > 8 && <li className="mp-detail-more">and {links.length - 8} more</li>}
      </ul>
    </div>
  )
}

/**
 * What this thing is and what touches it — the two questions someone reading a
 * diagram they did not write always has. Authored notes come first, because a
 * sentence from the author beats anything inferred from the graph.
 */
export function DetailCard({ detail, at }: Props) {
  return (
    <div
      className="mp-detail"
      role="tooltip"
      aria-label={detail.kind === 'edge' ? `${detail.fromLabel} to ${detail.toLabel}` : detail.label}
      style={{
        left: at.x,
        top: at.y,
        transform: `translate(${at.flipX ? '-100%' : '0'}, ${at.flipY ? '-100%' : '0'})`,
      }}
    >
      {detail.kind === 'node' && (
        <>
          <header>
            <strong>{detail.label}</strong>
            <span className="mp-detail-kind">{detail.archetype}</span>
          </header>
          {detail.note && <p className="mp-detail-note">{detail.note}</p>}
          {detail.groupLabel && <p className="mp-detail-in">in <b>{detail.groupLabel}</b></p>}
          {detail.collapsedMembers !== undefined && (
            <p className="mp-detail-in">collapsed group of <b>{detail.collapsedMembers}</b></p>
          )}
          {detail.compartments && detail.compartments.length > 1 && (
            <div className="mp-detail-compartments">
              {detail.compartments.slice(1).filter((s) => s.length > 0).map((section, i) => (
                <pre key={i}>{section.join('\n')}</pre>
              ))}
            </div>
          )}
          <Links title="Depends on" links={detail.outgoing} />
          <Links title="Used by" links={detail.incoming} />
          {detail.meta.length > 0 && (
            <dl className="mp-detail-meta">
              {detail.meta.map(([key, value]) => (
                <div key={key}><dt>{key}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          )}
          {detail.sourceLine !== undefined && <p className="mp-detail-source">line {detail.sourceLine + 1}</p>}
        </>
      )}

      {detail.kind === 'edge' && (
        <>
          <header>
            <strong>{detail.fromLabel} → {detail.toLabel}</strong>
          </header>
          {detail.label && <p className="mp-detail-note">{detail.label}</p>}
          {detail.note && <p className="mp-detail-note">{detail.note}</p>}
          <p className="mp-detail-in">
            <b>{detail.fromLabel}</b> {SEMANTICS[detail.semantics] ?? detail.semantics} <b>{detail.toLabel}</b>
          </p>
          {detail.style !== 'solid' && <p className="mp-detail-source">{detail.style} line</p>}
          {detail.meta.length > 0 && (
            <dl className="mp-detail-meta">
              {detail.meta.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
            </dl>
          )}
        </>
      )}

      {detail.kind === 'group' && (
        <>
          <header>
            <strong>{detail.label}</strong>
            <span className="mp-detail-kind">group</span>
          </header>
          {detail.note && <p className="mp-detail-note">{detail.note}</p>}
          <p className="mp-detail-in">
            {detail.collapsed ? 'collapsed · ' : ''}<b>{detail.memberLabels.length}</b> member{detail.memberLabels.length === 1 ? '' : 's'}
          </p>
          {detail.memberLabels.length > 0 && (
            <ul className="mp-detail-members">
              {detail.memberLabels.slice(0, 10).map((label) => <li key={label}>{label}</li>)}
              {detail.memberLabels.length > 10 && <li className="mp-detail-more">and {detail.memberLabels.length - 10} more</li>}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
