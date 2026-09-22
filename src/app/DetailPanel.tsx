import type { Connection, Detail } from './explain'

interface Props {
  detail: Detail
  onPick: (nodeId: string) => void
  onClose: () => void
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

function Links({ title, links, onPick }: { title: string; links: Connection[]; onPick: (id: string) => void }) {
  if (links.length === 0) return null
  return (
    <div className="mp-panel-links">
      <h4>{title} <span>{links.length}</span></h4>
      <ul>
        {links.map((link) => (
          <li key={link.edgeId}>
            <button type="button" onClick={() => onPick(link.nodeId)}>{link.label}</button>
            {link.edgeLabel && <em>{link.edgeLabel}</em>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The selected thing, explained along the bottom of the canvas.
 *
 * A card pinned beside the node covered the diagram it was describing, which is
 * the wrong trade when the point is to look at both. Down here it sits out of
 * the picture, in the same place the walkthrough speaks from.
 */
export function DetailPanel({ detail, onPick, onClose }: Props) {
  return (
    <div className="mp-panel" role="region" aria-live="polite" aria-label="Selection details">
      <button type="button" className="mp-panel-close" onClick={onClose} aria-label="Clear selection">×</button>

      {detail.kind === 'node' && (
        <>
          <div className="mp-panel-lead">
            <header>
              <strong>{detail.label}</strong>
              <span className="mp-panel-kind">{detail.archetype}</span>
              {detail.groupLabel && <span className="mp-panel-in">in {detail.groupLabel}</span>}
            </header>
            {detail.note && <p className="mp-panel-note">{detail.note}</p>}
            {detail.collapsedMembers !== undefined && (
              <p className="mp-panel-meta-line">collapsed group of {detail.collapsedMembers}</p>
            )}
            {detail.meta.length > 0 && (
              <p className="mp-panel-meta-line">
                {detail.meta.map(([key, value]) => <span key={key}><i>{key}</i> {value}</span>)}
              </p>
            )}
          </div>

          <Links title="Depends on" links={detail.outgoing} onPick={onPick} />
          <Links title="Used by" links={detail.incoming} onPick={onPick} />

          {detail.compartments && detail.compartments.length > 1 && (
            <div className="mp-panel-links mp-panel-body">
              <h4>Members</h4>
              <pre>{detail.compartments.slice(1).flat().join('\n')}</pre>
            </div>
          )}
        </>
      )}

      {detail.kind === 'edge' && (
        <div className="mp-panel-lead">
          <header>
            <strong>{detail.fromLabel} → {detail.toLabel}</strong>
            <span className="mp-panel-kind">{detail.style === 'solid' ? 'edge' : `${detail.style} edge`}</span>
          </header>
          {detail.label && <p className="mp-panel-note">{detail.label}</p>}
          {detail.note && <p className="mp-panel-note">{detail.note}</p>}
          <p className="mp-panel-meta-line">
            <span>{detail.fromLabel} {SEMANTICS[detail.semantics] ?? detail.semantics} {detail.toLabel}</span>
          </p>
        </div>
      )}

      {detail.kind === 'group' && (
        <>
          <div className="mp-panel-lead">
            <header>
              <strong>{detail.label}</strong>
              <span className="mp-panel-kind">group</span>
            </header>
            {detail.note && <p className="mp-panel-note">{detail.note}</p>}
            <p className="mp-panel-meta-line">
              <span>{detail.collapsed ? 'collapsed · ' : ''}{detail.memberLabels.length} members</span>
            </p>
          </div>
          <div className="mp-panel-links">
            <h4>Contains <span>{detail.memberLabels.length}</span></h4>
            <ul>{detail.memberLabels.map((label) => <li key={label}><span className="mp-panel-plain">{label}</span></li>)}</ul>
          </div>
        </>
      )}
    </div>
  )
}
