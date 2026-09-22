import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listThemes, type Theme } from '@/core/theme'
import generalPack from '@/core/icons/packs/general.json'
import { Canvas } from './Canvas'
import { CommandPalette, type Command } from './CommandPalette'
import { ExampleBrowser } from './ExampleBrowser'
import { CORPUS } from './gallery/corpus'
import { EXAMPLE_KINDS, findExample } from './gallery/examples'
import { SplitPane } from './SplitPane'
import { STEP_DURATION_MS, WalkthroughBar } from './WalkthroughBar'
import { parseWalkthrough } from './walkthrough'
import { StatusBar } from './StatusBar'
import { ThemeEditor } from './ThemeEditor'
import { Toolbar } from './Toolbar'
import { buildSourceMap } from './source-map'
import { upsertLayoutDirective } from './source-edit'
import { exportDiagram, type ExportKind } from './export'
import { makeLibrary, suggestTitle, type SavedDoc } from './library'
import { loadMotionPreference, loadTransparentExport, saveMotionPreference, saveTransparentExport } from './preferences'
import { resolveTheme } from './diagram-state'
import { useDiagram } from './useDiagram'
import type { CompletionContext } from './editor/completions'
import './app.css'

const MonacoEditor = lazy(() => import('./editor/MonacoEditor').then((m) => ({ default: m.MonacoEditor })))

export const appName = 'Mermaid Plus'

const library = makeLibrary(
  typeof localStorage !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
)

function initialDocument(): { source: string; themeId: string; collapsed?: Record<string, boolean> } {
  const params = new URLSearchParams(window.location.search)
  const entry = params.get('d')
  const found = entry ? CORPUS[entry] : undefined
  if (found) return { source: found.source, themeId: params.get('theme') ?? 'clean-light' }
  const example = findExample(params.get('ex'))
  if (example) return { source: example.source, themeId: params.get('theme') ?? 'clean-light' }
  // An empty page, not a diagram someone else wrote. A first-time visitor sees
  // a blank editor and an invitation; a returning one gets their draft back.
  const draft = library.loadDraft()
  return { source: draft?.source ?? '', themeId: params.get('theme') ?? draft?.themeId ?? 'clean-light' }
}

const ICON_NAMES = Object.keys((generalPack as { icons: Record<string, unknown> }).icons).map((n) => `general:${n}`)

export function App() {
  const initial = useMemo(initialDocument, [])
  const { state, setSource, load, setThemeId, setCustomTheme, toggleGroup, setCollapsed } =
    useDiagram(initial.source, initial.themeId)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [revealLine, setRevealLine] = useState<number | null>(null)
  const [themeEditorOpen, setThemeEditorOpen] = useState(false)
  const [motion, setMotion] = useState(loadMotionPreference)
  const [transparent, setTransparent] = useState(loadTransparentExport)
  const [presenting, setPresenting] = useState(false)
  const [editorOpen, setEditorOpen] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [docs, setDocs] = useState<SavedDoc[]>(() => library.list())
  const [toast, setToast] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const uiTheme = resolveTheme(state)
  const effectiveTheme: Theme = state.rendered?.theme ?? uiTheme
  const title = useMemo(() => suggestTitle(state.source), [state.source])
  const nodeIds = useMemo(
    () => (state.rendered?.tier === 1 ? state.rendered.layout.ir.nodes.map((n) => n.id) : []),
    [state.rendered],
  )
  const sourceMap = useMemo(() => buildSourceMap(state.source, nodeIds), [state.source, nodeIds])
  const completion = useMemo<CompletionContext>(
    () => ({ themeIds: listThemes().map((t) => t.id), nodeIds, iconNames: ICON_NAMES }),
    [nodeIds],
  )

  const steps = useMemo(
    () => (state.rendered?.tier === 1 ? parseWalkthrough(state.rendered.layout.ir) : []),
    [state.rendered],
  )
  const currentStep = stepIndex !== null ? steps[stepIndex] ?? null : null

  const goToStep = useCallback((index: number) => {
    setStepIndex((current) => {
      if (index < 0 || index >= steps.length) return current
      return index
    })
  }, [steps.length])

  const exitWalkthrough = useCallback(() => {
    setStepIndex(null)
    setPlaying(false)
    setPresenting(false)
  }, [])

  // A walkthrough belongs to the diagram that defines it.
  useEffect(() => {
    if (steps.length === 0) exitWalkthrough()
  }, [exitWalkthrough, steps.length])

  useEffect(() => {
    if (!playing || stepIndex === null) return
    if (stepIndex >= steps.length - 1) {
      setPlaying(false)
      return
    }
    const handle = window.setTimeout(() => setStepIndex((i) => (i === null ? null : i + 1)), STEP_DURATION_MS)
    return () => window.clearTimeout(handle)
  }, [playing, stepIndex, steps.length])

  // ?step=2 opens straight onto a step, so a link can start the story anywhere.
  useEffect(() => {
    const requested = Number(new URLSearchParams(window.location.search).get('step'))
    if (Number.isFinite(requested) && requested >= 1 && requested <= steps.length) setStepIndex(requested - 1)
  }, [steps.length])

  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }, [])

  useEffect(() => {
    if (initial.collapsed) setCollapsed(initial.collapsed)
  }, [initial, setCollapsed])

  // Autosave the working copy; a reload lands on what you were editing.
  useEffect(() => {
    const handle = window.setTimeout(() => library.saveDraft({ source: state.source, themeId: state.themeId }), 400)
    return () => window.clearTimeout(handle)
  }, [state.source, state.themeId])

  // Test hook: lets e2e read and replace the source without driving Monaco,
  // whose virtualised lines are not a reliable thing to assert on.
  useEffect(() => {
    window.__mp = {
      ...(window.__mp ?? { lastLayoutMs: null, nodeCount: 0 }),
      setSource: (s: string) => load(s),
      source: state.source,
    }
  }, [load, state.source])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      // Typing an 'f' into the editor must not black out the chrome.
      const target = event.target as HTMLElement | null
      const typing = target?.isContentEditable || /^(input|textarea)$/i.test(target?.tagName ?? '')
        || target?.closest('.monaco-editor') !== null && target?.closest('.monaco-editor') !== undefined
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setPresenting((on) => !on)
      } else if (event.key === 'Escape') {
        setPresenting(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const onNodeClick = useCallback((id: string | null) => {
    setSelectedNodeId(id)
    setRevealLine(id ? sourceMap.lineOf.get(id) ?? null : null)
  }, [sourceMap])

  const onCursorLine = useCallback((line: number) => {
    setSelectedNodeId(sourceMap.nodesAt.get(line)?.[0] ?? null)
  }, [sourceMap])

  const onExport = useCallback(async (kind: ExportKind) => {
    const svg = canvasRef.current?.querySelector<SVGSVGElement>('svg.mp-diagram')
    if (!svg) return notify('Nothing to export yet')
    if (kind === 'drawio' && state.rendered?.tier !== 1) {
      return notify('draw.io export is available for graph diagrams')
    }
    try {
      await exportDiagram(svg, kind, {
        background: effectiveTheme.color.canvas,
        transparent,
        filename: title.replace(/[^\w-]+/g, '-').toLowerCase() || 'diagram',
        html: {
          title,
          background: effectiveTheme.color.canvas,
          foreground: effectiveTheme.color.text,
          muted: effectiveTheme.color.textMuted,
          border: effectiveTheme.color.stroke,
          fontFamily: effectiveTheme.type.family,
          source: state.source,
        },
        drawio: state.rendered?.tier === 1
          ? { layout: state.rendered.layout, theme: effectiveTheme, title }
          : undefined,
      })
      notify(kind === 'copy' ? 'Copied to clipboard' : 'Exported')
    } catch (error) {
      notify(`Export failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [effectiveTheme, notify, state.rendered, state.source, title, transparent])

  /**
   * Back to a blank page. Opening an example is easy; getting out of one was
   * not. The draft is overwritten either way, so a document with anything in it
   * asks first.
   */
  const onNew = useCallback(() => {
    if (state.source.trim() !== '' && !window.confirm('Clear the diagram and start a new one?')) return
    load('')
    setCollapsed({})
    setSelectedNodeId(null)
    exitWalkthrough()
  }, [exitWalkthrough, load, setCollapsed, state.source])

  const onSave = useCallback(() => {
    const name = window.prompt('Save as', title)
    if (!name) return
    library.save({ title: name, source: state.source, themeId: state.themeId })
    setDocs(library.list())
    notify('Saved')
  }, [notify, state.source, state.themeId, title])

  // Counted rather than written down, so it cannot drift from the library.
  const exampleCount = useMemo(
    () => Object.values(EXAMPLE_KINDS).reduce((total, kind) => total + kind.examples.length, 0), [])

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = []
    const action = (id: string, label: string, hint: string, run: () => void) => list.push({ id, group: 'Action', label, hint, run })
    action('a:examples', 'Browse examples…', String(exampleCount), () => setExamplesOpen(true))
    if (steps.length > 0) {
      action('a:walkthrough', stepIndex === null ? `Present walkthrough (${steps.length} steps)` : 'Exit walkthrough', 'present',
        () => (stepIndex === null ? (setStepIndex(0), setPresenting(true)) : exitWalkthrough()))
    }
    action('a:new', 'New diagram', 'clear', onNew)
    action('a:save', 'Save to library', 'library', onSave)
    action('a:code', editorOpen ? 'Hide code' : 'Show code', 'view', () => setEditorOpen((v) => !v))
    action('a:themeeditor', themeEditorOpen ? 'Close theme picker' : 'Browse themes…', '20', () => setThemeEditorOpen((v) => !v))
    action('a:motion', motion ? 'Turn off diagram motion' : 'Turn on diagram motion', 'view',
      () => setMotion((v) => { saveMotionPreference(!v); return !v }))
    action('a:present', presenting ? 'Leave full-bleed view' : 'Full-bleed view', 'f', () => setPresenting((on) => !on))
    action('a:gallery', 'Open gallery page', 'view', () => { window.location.href = `/?gallery&theme=${state.themeId}` })

    const exportAction = (id: string, label: string, kind: ExportKind) =>
      list.push({ id, group: 'Export', label, hint: kind, run: () => void onExport(kind) })
    exportAction('a:svg', 'Export SVG', 'svg')
    exportAction('a:png', 'Export PNG (2×)', 'png2')
    exportAction('a:pdf', 'Export PDF', 'pdf')
    exportAction('a:html', 'Export standalone HTML page', 'html')
    exportAction('a:drawio', 'Export to draw.io / Lucid', 'drawio')
    exportAction('a:copy', 'Copy diagram as image', 'copy')

    // Twenty themes belong in the picker, where you can see them. They stay
    // reachable here by name rather than filling the idle list.
    for (const theme of listThemes()) {
      list.push({ id: `theme:${theme.id}`, group: 'Theme', label: `${theme.name} · ${theme.mode}`, hint: theme.id, secondary: true, run: () => setThemeId(theme.id) })
    }

    // Examples are a library to browse, not a menu to scroll: reachable here by
    // name, but they do not crowd out the actions.
    for (const [name, entry] of Object.entries(CORPUS)) {
      list.push({ id: `corpus:${name}`, group: 'Showcase', label: entry.title, hint: 'example', secondary: true, run: () => load(entry.source) })
    }
    for (const [kind, entry] of Object.entries(EXAMPLE_KINDS)) {
      entry.examples.forEach((example, i) => {
        list.push({
          id: `ex:${kind}:${i}`,
          group: entry.label,
          label: example.title,
          hint: entry.tier === 1 ? 'example' : 'mermaid',
          keywords: kind,
          secondary: true,
          run: () => load(example.source),
        })
      })
    }
    return list
  }, [editorOpen, exampleCount, exitWalkthrough, load, motion, onNew, presenting, onExport, onSave, setThemeId, state.themeId, stepIndex, steps.length, themeEditorOpen])

  const editorPane = (
    <div className="mp-editor-pane">
      <Suspense fallback={<textarea className="mp-editor" value={state.source} onChange={(e) => setSource(e.target.value)} aria-label="Mermaid source" />}>
        <MonacoEditor
          value={state.source}
          onChange={setSource}
          dark={uiTheme.mode === 'dark'}
          errorLine={state.error?.line ?? null}
          errorMessage={state.error?.message ?? null}
          completion={completion}
          revealLine={revealLine}
          onCursorLine={onCursorLine}
        />
      </Suspense>
    </div>
  )

  return (
    <div className="mp-app" data-theme-mode={effectiveTheme.mode} data-presenting={presenting ? 'true' : undefined}>
      <Toolbar
        title={title}
        themeId={state.themeId}
        hasCustomTheme={state.customTheme !== null}
        pinnedThemeId={state.rendered?.theme.id ?? null}
        onExport={onExport}
        onNew={onNew}
        onSave={onSave}
        docs={docs}
        onOpenDoc={(id) => { const doc = docs.find((d) => d.id === id); if (doc) load(doc.source, doc.themeId) }}
        onDeleteDoc={(id) => { library.remove(id); setDocs(library.list()) }}
        onThemeChange={setThemeId}
        motion={motion}
        onToggleMotion={() => setMotion((v) => { saveMotionPreference(!v); return !v })}
        transparentExport={transparent}
        onToggleTransparent={() => setTransparent((v) => { saveTransparentExport(!v); return !v })}
        onToggleThemeEditor={() => setThemeEditorOpen((v) => !v)}
        themeEditorOpen={themeEditorOpen}
        onToggleEditor={() => setEditorOpen((v) => !v)}
        editorOpen={editorOpen}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenExamples={() => setExamplesOpen(true)}
        canExport={state.rendered !== null}
        canExportModel={state.rendered?.tier === 1}
      />

      <SplitPane
        showFirst={editorOpen}
        first={editorPane}
        second={
          <div className="mp-canvas-pane" ref={canvasRef}>
            <Canvas
              state={state}
              selectedNodeId={selectedNodeId}
              sourceLineOf={(id) => sourceMap.lineOf.get(id)}
              step={currentStep}
              onNodeClick={onNodeClick}
              onGroupToggle={toggleGroup}
              onExpandAll={() => setCollapsed(Object.fromEntries((state.rendered?.tier === 1 ? state.rendered.collapsed : []).map((id) => [id, false])))}
              motion={motion}
              onDirection={(direction) => setSource(upsertLayoutDirective(state.source, 'direction', direction))}
              onBrowseExamples={() => setExamplesOpen(true)}
            />
          </div>
        }
        aside={themeEditorOpen
          ? <ThemeEditor active={uiTheme} activeId={state.themeId} value={state.customTheme} onSelect={setThemeId} onChange={setCustomTheme} onClose={() => setThemeEditorOpen(false)} />
          : undefined}
      />

      {presenting && (
        <button type="button" className="mp-leave-present" onClick={() => setPresenting(false)}>
          Press <kbd>Esc</kbd> to leave full-bleed
        </button>
      )}

      <StatusBar
        state={state}
        theme={effectiveTheme}
        walkthroughSteps={steps.length}
        presenting={stepIndex !== null}
        onPresent={() => setStepIndex(0)}
      />
      {stepIndex !== null && (
        <div className="mp-wt-host">
          <WalkthroughBar
            steps={steps}
            current={stepIndex}
            playing={playing}
            onGo={goToStep}
            onTogglePlay={() => setPlaying((v) => !v)}
            onExit={exitWalkthrough}
          />
        </div>
      )}
      <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} />
      <ExampleBrowser open={examplesOpen} onPick={(source) => load(source)} onClose={() => setExamplesOpen(false)} />
      {toast && <div className="mp-toast" role="status">{toast}</div>}
    </div>
  )
}
