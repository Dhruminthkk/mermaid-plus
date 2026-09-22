import { useMemo, useState } from 'react'
import type { Archetype } from '@/core/ir'
import { listThemes, type Theme } from '@/core/theme'
import { downloadBlob } from './export'

interface Props {
  /** The theme the diagram is currently drawn with. */
  active: Theme
  activeId: string
  value: Theme | null
  onSelect: (id: string) => void
  onChange: (theme: Theme | null) => void
  onClose: () => void
}

const ARCHETYPES: Archetype[] = ['service', 'database', 'queue', 'storage', 'user', 'external', 'decision', 'note', 'process', 'default']

/** A theme at a glance: its ground, and the shapes that sit on it. */
function Preview({ theme }: { theme: Theme }) {
  // A miniature of what the theme actually draws — grouped nodes, rounded
  // orthogonal edges, arrowheads — rather than a grid of colour chips, so the
  // card reads as a diagram at a glance instead of a swatch table.
  const radius = Math.min(theme.geometry.radius * 0.55, 5)
  const stroke = Math.min(Math.max(theme.geometry.strokeWidth * 0.7, 0.7), 1.4)
  const accent = theme.color.accent[0]
  const node = (x: number, y: number, kind: 'service' | 'database' | 'queue', bar: number) => (
    <>
      <rect x={x} y={y} width={26} height={13} rx={radius}
            fill={theme.color.archetype[kind].fill} stroke={theme.color.archetype[kind].stroke} strokeWidth={stroke} />
      <rect x={x + (26 - bar) / 2} y={y + 5.5} width={bar} height={2} rx={1}
            fill={theme.color.text} fillOpacity="0.5" />
    </>
  )
  return (
    <svg className="mp-swatch" viewBox="0 0 96 58" preserveAspectRatio="none" aria-hidden="true">
      <rect width="96" height="58" fill={theme.color.canvas} />
      <rect x="52" y="4" width="40" height="50" rx={radius + 2}
            fill={accent} fillOpacity="0.08" stroke={accent} strokeOpacity="0.3" strokeWidth={stroke} />
      <g fill="none" stroke={theme.color.edge} strokeWidth={stroke} strokeLinecap="round">
        <path d="M32 28.5H41q4 0 4-4v-6q0-4 4-4h5" />
        <path d="M32 28.5H41q4 0 4 4v7q0 4 4 4h5" />
      </g>
      <g fill={theme.color.edge}>
        <path d="M58 14.5l-4.4-2.4v4.8z" />
        <path d="M58 43.5l-4.4-2.4v4.8z" />
      </g>
      {node(6, 22, 'service', 15)}
      {node(58, 8, 'database', 11)}
      {node(58, 37, 'queue', 13)}
    </svg>
  )
}

function Chip({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="mp-chip-field" title={`${label} · ${value}`}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <span>{label}</span>
    </label>
  )
}

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="mp-slider">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <code>{value}</code>
    </label>
  )
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div className="mp-segmented">
      <span>{label}</span>
      <div role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button key={option} type="button" role="radio" aria-checked={option === value}
                  className={option === value ? 'mp-on' : undefined} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Choosing a theme is a visual decision, so the panel leads with what the themes
 * look like. Editing comes second, and only once you have picked a starting
 * point worth changing.
 */
export function ThemeEditor({ active, activeId, value, onSelect, onChange, onClose }: Props) {
  const [tab, setTab] = useState<'themes' | 'customise'>('themes')
  const themes = useMemo(listThemes, [])
  const custom = useMemo<Theme>(() => ({ ...(value ?? active), id: 'custom', name: value?.name ?? `${active.name} (custom)` }), [active, value])

  const update = (patch: (t: Theme) => Theme) => onChange(patch(custom))
  const setColor = (key: keyof Theme['color'], v: string) => update((t) => ({ ...t, color: { ...t.color, [key]: v } }))
  const setArch = (a: Archetype, key: 'fill' | 'stroke' | 'text', v: string) =>
    update((t) => ({ ...t, color: { ...t.color, archetype: { ...t.color.archetype, [a]: { ...t.color.archetype[a], [key]: v } } } }))
  const setGeo = (key: keyof Theme['geometry'], v: number) => update((t) => ({ ...t, geometry: { ...t.geometry, [key]: v } }))

  const exportJson = () =>
    downloadBlob(new Blob([JSON.stringify(custom, null, 2)], { type: 'application/json' }),
      `${custom.name.replace(/\s+/g, '-').toLowerCase()}.theme.json`)

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Theme
      if (parsed?.color && parsed.geometry && parsed.type) {
        onChange({ ...parsed, id: 'custom' })
        setTab('customise')
      }
    } catch {
      // An unreadable file leaves the current theme alone.
    }
  }

  return (
    <aside className="mp-theme-panel" aria-label="Themes">
      <header>
        <div className="mp-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'themes'} className={tab === 'themes' ? 'mp-on' : undefined} onClick={() => setTab('themes')}>Themes</button>
          <button type="button" role="tab" aria-selected={tab === 'customise'} className={tab === 'customise' ? 'mp-on' : undefined} onClick={() => setTab('customise')}>Customise</button>
        </div>
        <button type="button" className="mp-panel-x" onClick={onClose} aria-label="Close themes">×</button>
      </header>

      {tab === 'themes' && (
        <div className="mp-theme-grid">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`mp-theme-card${theme.id === activeId ? ' mp-on' : ''}`}
              aria-pressed={theme.id === activeId}
              onClick={() => onSelect(theme.id)}
            >
              <Preview theme={theme} />
              <span className="mp-theme-caption">
                <span className="mp-theme-name">{theme.name}</span>
                <span className="mp-theme-mode">{theme.mode}</span>
              </span>
            </button>
          ))}
          {value && (
            <button type="button" className={`mp-theme-card${activeId === 'custom' ? ' mp-on' : ''}`} aria-pressed={activeId === 'custom'} onClick={() => onSelect('custom')}>
              <Preview theme={value} />
              <span className="mp-theme-name">Custom</span>
              <span className="mp-theme-mode">{value.mode}</span>
            </button>
          )}
        </div>
      )}

      {tab === 'customise' && (
        <div className="mp-theme-form">
          <div className="mp-form-actions">
            <button type="button" onClick={exportJson}>Export</button>
            <label className="mp-file">
              Import
              <input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
            </label>
            <button type="button" onClick={() => onChange(null)} disabled={!value}>Reset</button>
          </div>

          <h4>Surfaces</h4>
          <div className="mp-chip-row">
            <Chip label="Canvas" value={custom.color.canvas} onChange={(v) => setColor('canvas', v)} />
            <Chip label="Text" value={custom.color.text} onChange={(v) => setColor('text', v)} />
            <Chip label="Muted" value={custom.color.textMuted} onChange={(v) => setColor('textMuted', v)} />
            <Chip label="Edges" value={custom.color.edge} onChange={(v) => setColor('edge', v)} />
            <Chip label="Strokes" value={custom.color.stroke} onChange={(v) => setColor('stroke', v)} />
          </div>

          <h4>Accents</h4>
          <div className="mp-chip-row">
            {custom.color.accent.map((colour, i) => (
              <Chip key={i} label={String(i + 1)} value={colour}
                    onChange={(v) => update((t) => ({ ...t, color: { ...t.color, accent: t.color.accent.map((c, j) => (j === i ? v : c)) } }))} />
            ))}
          </div>

          <h4>Archetypes</h4>
          <div className="mp-arch-grid">
            <div className="mp-arch-row mp-arch-head" aria-hidden="true">
              <span /><span /><span>fill</span><span>line</span><span>text</span>
            </div>
            {ARCHETYPES.map((archetype) => (
              <div key={archetype} className="mp-arch-row">
                <svg className="mp-arch-swatch" viewBox="0 0 26 16" aria-hidden="true">
                  <rect width="26" height="16" rx={Math.min(custom.geometry.radius / 2, 5)}
                        fill={custom.color.archetype[archetype].fill}
                        stroke={custom.color.archetype[archetype].stroke} strokeWidth="1.25" />
                </svg>
                <span>{archetype}</span>
                <input type="color" title="fill" aria-label={`${archetype} fill`} value={custom.color.archetype[archetype].fill} onChange={(e) => setArch(archetype, 'fill', e.target.value)} />
                <input type="color" title="stroke" aria-label={`${archetype} stroke`} value={custom.color.archetype[archetype].stroke} onChange={(e) => setArch(archetype, 'stroke', e.target.value)} />
                <input type="color" title="text" aria-label={`${archetype} text`} value={custom.color.archetype[archetype].text} onChange={(e) => setArch(archetype, 'text', e.target.value)} />
              </div>
            ))}
          </div>

          <h4>Geometry</h4>
          <Slider label="Corner radius" value={custom.geometry.radius} min={0} max={24} onChange={(v) => setGeo('radius', v)} />
          <Slider label="Stroke width" value={custom.geometry.strokeWidth} min={0.5} max={4} step={0.25} onChange={(v) => setGeo('strokeWidth', v)} />
          <Slider label="Padding X" value={custom.geometry.nodePaddingX} min={4} max={40} onChange={(v) => setGeo('nodePaddingX', v)} />
          <Slider label="Padding Y" value={custom.geometry.nodePaddingY} min={4} max={30} onChange={(v) => setGeo('nodePaddingY', v)} />
          <Slider label="Rank spacing" value={custom.geometry.rankSpacing} min={16} max={160} onChange={(v) => setGeo('rankSpacing', v)} />
          <Slider label="Node spacing" value={custom.geometry.nodeSpacing} min={8} max={120} onChange={(v) => setGeo('nodeSpacing', v)} />
          <Slider label="Group padding" value={custom.geometry.groupPadding} min={8} max={48} onChange={(v) => setGeo('groupPadding', v)} />

          <h4>Type &amp; lines</h4>
          <label className="mp-text-field">
            <span>Font</span>
            <input type="text" value={custom.type.family} onChange={(e) => update((t) => ({ ...t, type: { ...t.type, family: e.target.value } }))} />
          </label>
          <Slider label="Label size" value={custom.type.scale[1]} min={9} max={24}
                  onChange={(v) => update((t) => ({ ...t, type: { ...t.type, scale: [Math.max(8, v - 2), v, v + 2, v + 5] } }))} />
          <Segmented label="Routing" value={custom.edge.routing} options={['orthogonal', 'curved', 'straight'] as const}
                     onChange={(v) => update((t) => ({ ...t, edge: { ...t.edge, routing: v } }))} />
          <Segmented label="Arrowhead" value={custom.edge.arrowhead} options={['triangle', 'open', 'diamond', 'circle'] as const}
                     onChange={(v) => update((t) => ({ ...t, edge: { ...t.edge, arrowhead: v } }))} />
          <Segmented label="Labels" value={custom.edge.labelPlacement ?? 'on-line'} options={['on-line', 'beside'] as const}
                     onChange={(v) => update((t) => ({ ...t, edge: { ...t.edge, labelPlacement: v } }))} />
          <Segmented label="Texture" value={custom.texture} options={['crisp', 'sketch'] as const}
                     onChange={(v) => update((t) => ({ ...t, texture: v }))} />
        </div>
      )}
    </aside>
  )
}
