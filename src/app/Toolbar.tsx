import { useEffect, useRef } from 'react'
import { listThemes } from '@/core/theme'
import { CUSTOM_THEME_ID } from './diagram-state'
import type { ExportKind } from './export'
import type { SavedDoc } from './library'
import { IconCode, IconDownload, IconGrid, IconLibrary, IconPalette, IconMoon, IconMotion, IconSearch, IconSun, Mark } from './icons'

interface Props {
  title: string
  themeId: string
  hasCustomTheme: boolean
  pinnedThemeId: string | null
  onExport: (kind: ExportKind) => void
  onNew: () => void
  onSave: () => void
  docs: SavedDoc[]
  onOpenDoc: (id: string) => void
  onDeleteDoc: (id: string) => void
  onThemeChange: (id: string) => void
  motion: boolean
  onToggleMotion: () => void
  transparentExport: boolean
  onToggleTransparent: () => void
  onToggleThemeEditor: () => void
  themeEditorOpen: boolean
  onToggleEditor: () => void
  editorOpen: boolean
  onOpenPalette: () => void
  onOpenExamples: () => void
  canExport: boolean
  canExportModel: boolean
}

/**
 * <details> has no dismiss behaviour of its own: without this an open menu
 * stays open until clicked again. Closes on an outside press, on Escape, and
 * whenever a sibling opens.
 */
function useDismissableMenus(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const openMenus = () => Array.from(root.current?.querySelectorAll<HTMLDetailsElement>('details.mp-menu[open]') ?? [])
    const onPointerDown = (event: PointerEvent) => {
      for (const menu of openMenus()) if (!menu.contains(event.target as Node)) menu.open = false
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') for (const menu of openMenus()) menu.open = false
    }
    const onToggle = (event: Event) => {
      const opened = event.target as HTMLDetailsElement
      if (!opened.open) return
      for (const menu of openMenus()) if (menu !== opened) menu.open = false
    }
    const node = root.current
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    node?.addEventListener('toggle', onToggle, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      node?.removeEventListener('toggle', onToggle, true)
    }
  }, [root])
}

/** Closes the menu once a choice inside it has been made. */
function closeMenu(e: React.MouseEvent<HTMLDivElement>) {
  if ((e.target as HTMLElement).closest('button')) e.currentTarget.parentElement?.removeAttribute('open')
}

export function Toolbar(p: Props) {
  const root = useRef<HTMLElement>(null)
  useDismissableMenus(root)
  const pinned = p.pinnedThemeId !== null && p.pinnedThemeId !== p.themeId
  const themes = listThemes()
  const current = themes.find((t) => t.id === p.themeId)
  const themeName = p.themeId === CUSTOM_THEME_ID ? 'Custom' : current ? `${current.name} · ${current.mode}` : p.themeId
  // Every family ships both modes; the counterpart is the one sharing its name.
  const counterpart = current && themes.find((t) => t.name === current.name && t.mode !== current.mode)

  return (
    <header className="mp-toolbar" ref={root}>
      <span className="mp-brand">
        <Mark className="mp-brand-mark" />
        <span className="mp-brand-name">Mermaid<em>Plus</em></span>
      </span>

      <button
        type="button"
        className={`mp-icon-btn mp-code-toggle${p.editorOpen ? ' mp-on' : ''}`}
        onClick={p.onToggleEditor}
        aria-pressed={p.editorOpen}
        title={p.editorOpen ? 'Hide code' : 'Show code'}
      >
        <IconCode /><span className="mp-sr">{p.editorOpen ? 'Hide code' : 'Show code'}</span>
      </button>

      <span className="mp-doc-title" title={p.title}>{p.title}</span>

      <button type="button" className="mp-icon-btn mp-omni-lead" onClick={p.onOpenExamples} title="Examples">
        <IconGrid /><span className="mp-sr">Examples</span>
      </button>

      <button type="button" className="mp-omni" onClick={p.onOpenPalette}>
        <IconSearch />
        <span>Search examples, themes, actions</span>
        <kbd>⌘K</kbd>
      </button>

      <span className="mp-tb-spacer" />

      <button
        type="button"
        className={`mp-icon-btn${p.motion ? ' mp-on' : ''}`}
        onClick={p.onToggleMotion}
        aria-pressed={p.motion}
        title={p.motion ? 'Motion on — diagrams animate' : 'Motion off — diagrams are still'}
      >
        <IconMotion /><span className="mp-sr">Motion</span>
      </button>

      {counterpart && (
        <button
          type="button"
          className="mp-icon-btn"
          onClick={() => p.onThemeChange(counterpart.id)}
          disabled={pinned}
          aria-label={`Switch to ${counterpart.mode}`}
          title={pinned ? `Pinned by %%mp: theme ${p.pinnedThemeId}` : `Switch to ${counterpart.mode}`}
        >
          {counterpart.mode === 'dark' ? <IconMoon /> : <IconSun />}
          <span className="mp-sr">{`Switch to ${counterpart.mode}`}</span>
        </button>
      )}

      <button
        type="button"
        className={`mp-icon-btn${p.themeEditorOpen ? ' mp-on' : ''}${pinned ? ' mp-field-pinned' : ''}`}
        onClick={p.onToggleThemeEditor}
        aria-pressed={p.themeEditorOpen}
        aria-label="Themes"
        title={pinned ? `Pinned by %%mp: theme ${p.pinnedThemeId}` : `Themes — ${themeName}`}
      >
        <IconPalette /><span className="mp-sr">Themes</span>
      </button>

      <details className="mp-menu">
        <summary title="Library"><IconLibrary /><span className="mp-sr">Library</span></summary>
        <div className="mp-menu-body" onClick={closeMenu}>
          <button type="button" onClick={p.onNew}>New diagram</button>
          <button type="button" onClick={p.onSave}>Save current…</button>
          {p.docs.length > 0 && <div className="mp-menu-rule" />}
          {p.docs.length === 0 && <div className="mp-menu-empty">Nothing saved yet</div>}
          {p.docs.map((d) => (
            <div key={d.id} className="mp-menu-row">
              <button type="button" className="mp-menu-open" onClick={() => p.onOpenDoc(d.id)}>{d.title}</button>
              <button type="button" className="mp-menu-del" onClick={() => p.onDeleteDoc(d.id)} aria-label={`Delete ${d.title}`}>×</button>
            </div>
          ))}
        </div>
      </details>

      <details className="mp-menu">
        <summary title="Export"><IconDownload /><span className="mp-sr">Export</span></summary>
        <div className="mp-menu-body" onClick={closeMenu}>
          {/* Not a command: it changes what every command below produces, so it
              keeps the menu open and shows its state. */}
          <label className="mp-menu-check" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={p.transparentExport} onChange={p.onToggleTransparent} />
            <span>Clear background</span>
          </label>
          <div className="mp-menu-rule" />
          <div className="mp-menu-head">Image</div>
          <button type="button" onClick={() => p.onExport('svg')} disabled={!p.canExport}>SVG</button>
          <button type="button" onClick={() => p.onExport('png1')} disabled={!p.canExport}>PNG 1×</button>
          <button type="button" onClick={() => p.onExport('png2')} disabled={!p.canExport}>PNG 2×</button>
          <button type="button" onClick={() => p.onExport('png4')} disabled={!p.canExport}>PNG 4×</button>
          <button type="button" onClick={() => p.onExport('pdf')} disabled={!p.canExport}>PDF</button>
          <div className="mp-menu-rule" />
          <div className="mp-menu-head">Editable</div>
          <button type="button" onClick={() => p.onExport('html')} disabled={!p.canExport}>HTML page</button>
          <button type="button" onClick={() => p.onExport('drawio')} disabled={!p.canExportModel}>draw.io / Lucid</button>
          <div className="mp-menu-rule" />
          <button type="button" onClick={() => p.onExport('copy')} disabled={!p.canExport}>Copy as image</button>
        </div>
      </details>

    </header>
  )
}
