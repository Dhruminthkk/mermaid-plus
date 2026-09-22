import { getTheme, hasTheme, listThemes } from '@/core/theme'
import { CORPUS } from './gallery/corpus'
import { EXAMPLE_KINDS } from './gallery/examples'
import { IconCode, IconPalette, Mark } from './icons'

function preview(source: string): string {
  const lines = source.split('\n')
  return lines.slice(0, 6).join('\n') + (lines.length > 6 ? '\n…' : '')
}

function kindOf(source: string): string {
  return source.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('%%'))?.split(/\s+/)[0] ?? ''
}

/**
 * The standalone, linkable index of every example. It wears the same chrome as
 * the editor — same mark, same bar, same tokens — so following a link here does
 * not feel like arriving at a different product.
 */
export function Gallery() {
  const params = new URLSearchParams(window.location.search)
  const requested = params.get('theme') ?? 'clean-light'
  const theme = hasTheme(requested) ? requested : 'clean-light'
  const mode = getTheme(theme).mode

  return (
    <div className="mp-gallery mp-app" data-theme-mode={mode}>
      <header className="mp-toolbar">
        <a className="mp-brand" href={`/?theme=${theme}`}>
          <Mark className="mp-brand-mark" />
          <span className="mp-brand-name">Mermaid<em>Plus</em></span>
        </a>
        <span className="mp-doc-title">Gallery</span>
        <span className="mp-tb-spacer" />
        <label className="mp-field" title="Theme">
          <IconPalette />
          <select
            value={theme}
            aria-label="Theme"
            onChange={(e) => { params.set('theme', e.target.value); window.location.search = params.toString() }}
          >
            {listThemes().map((t) => <option key={t.id} value={t.id}>{t.name} · {t.mode}</option>)}
          </select>
        </label>
        <a className="mp-icon-btn" href={`/?theme=${theme}`} title="Open editor">
          <IconCode /><span className="mp-sr">Open editor</span>
        </a>
      </header>

      <nav className="mp-gallery-nav">
        <a href="#showcase">Showcase</a>
        {Object.entries(EXAMPLE_KINDS).map(([kind, entry]) => <a key={kind} href={`#${kind}`}>{entry.label}</a>)}
      </nav>

      <div className="mp-gallery-body">
        <section id="showcase" className="mp-gallery-section">
          <h2>Showcase</h2>
          <div className="mp-gallery-grid">
            {Object.entries(CORPUS).map(([name, entry]) => (
              <a key={name} className="mp-gallery-card" href={`/?d=${name}&theme=${theme}`}>
                <span className="mp-gallery-kind">{kindOf(entry.source)}</span>
                <strong>{entry.title}</strong>
                <pre>{preview(entry.source)}</pre>
              </a>
            ))}
          </div>
        </section>

        {Object.entries(EXAMPLE_KINDS).map(([kind, entry]) => (
          <section key={kind} id={kind} className="mp-gallery-section" data-kind={kind}>
            <h2>{entry.label}<span className="mp-gallery-tier">{entry.tier === 1 ? 'custom layout' : 'themed mermaid'}</span></h2>
            <div className="mp-gallery-grid">
              {entry.examples.map((example, i) => (
                <a key={i} className="mp-gallery-card" href={`/?ex=${kind}:${i}&theme=${theme}`}>
                  <span className="mp-gallery-kind">{kindOf(example.source)}</span>
                  <strong>{example.title}</strong>
                  <pre>{preview(example.source)}</pre>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
