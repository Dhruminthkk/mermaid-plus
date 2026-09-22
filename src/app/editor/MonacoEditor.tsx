import { useEffect, useMemo, useRef, useState } from 'react'
import Editor, { loader, type OnMount } from '@monaco-editor/react'
// editor.api: the core editor only, without every language contribution monaco ships.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { LANGUAGE_ID, defineTheme, monarch } from './mermaid-language'
import { provideCompletions, type CompletionContext } from './completions'

// Bundle monaco locally (no CDN): zero-network is a project constraint.
loader.config({ monaco })
self.MonacoEnvironment = { getWorker: () => new EditorWorker() }

let languageRegistered = false
function ensureLanguage(): void {
  if (languageRegistered) return
  languageRegistered = true
  monaco.languages.register({ id: LANGUAGE_ID })
  monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, monarch)
  monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
    comments: { lineComment: '%%' },
    brackets: [['[', ']'], ['(', ')'], ['{', '}']],
    autoClosingPairs: [{ open: '[', close: ']' }, { open: '(', close: ')' }, { open: '{', close: '}' }, { open: '"', close: '"' }],
  })
}

interface Props {
  value: string
  onChange: (value: string) => void
  dark: boolean
  /** 1-based line to mark as the parse error, if any. */
  errorLine: number | null
  errorMessage: string | null
  completion: CompletionContext
  /** 0-based line to reveal and highlight (from canvas selection). */
  revealLine: number | null
  onCursorLine: (line0: number) => void
}

export function MonacoEditor({ value, onChange, dark, errorLine, errorMessage, completion, revealLine, onCursorLine }: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const completionRef = useRef(completion)
  completionRef.current = completion
  const decorations = useRef<monaco.editor.IEditorDecorationsCollection | null>(null)
  const themeName = useMemo(() => defineTheme(monaco, dark), [dark])
  // Flips once the editor exists so marker/decoration effects re-run after the lazy mount.
  const [mounted, setMounted] = useState(false)

  const onMount: OnMount = (editor) => {
    editorRef.current = editor
    decorations.current = editor.createDecorationsCollection()
    // Only a cursor the reader moved themselves speaks for the canvas. Monaco
    // also fires this when its value changes or when it first mounts, and that
    // reported line 1 — clearing whatever the reader had just selected.
    editor.onDidChangeCursorPosition((e) => {
      if (e.reason !== monaco.editor.CursorChangeReason.Explicit || !editor.hasTextFocus()) return
      onCursorLine(e.position.lineNumber - 1)
    })
    setMounted(true)
  }

  useEffect(() => {
    ensureLanguage()
    const disposable = monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
      triggerCharacters: ['%', ':', '=', ' '],
      provideCompletionItems: (model, position) => provideCompletions(monaco, model, position, completionRef.current),
    })
    return () => disposable.dispose()
  }, [])

  useEffect(() => {
    const model = editorRef.current?.getModel()
    if (!model) return
    const clamp = (n: number) => Math.min(Math.max(n, 1), model.getLineCount())
    const markers: monaco.editor.IMarkerData[] = errorMessage
      ? [{
          severity: monaco.MarkerSeverity.Error,
          message: errorMessage,
          startLineNumber: clamp(errorLine ?? 1),
          startColumn: 1,
          endLineNumber: clamp(errorLine ?? model.getLineCount()),
          endColumn: model.getLineMaxColumn(clamp(errorLine ?? model.getLineCount())),
        }]
      : []
    monaco.editor.setModelMarkers(model, 'mermaid-plus', markers)
  }, [errorLine, errorMessage, value, mounted])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !decorations.current) return
    if (revealLine === null) {
      decorations.current.clear()
      return
    }
    const line = revealLine + 1
    decorations.current.set([{ range: new monaco.Range(line, 1, line, 1), options: { isWholeLine: true, className: 'mp-line-highlight' } }])
    editor.revealLineInCenterIfOutsideViewport(line)
  }, [revealLine, mounted])

  return (
    <Editor
      language={LANGUAGE_ID}
      theme={themeName}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={onMount}
      beforeMount={ensureLanguage}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
        lineNumbers: 'on',
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        renderLineHighlight: 'line',
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 12 },
        suggest: { showWords: false },
        quickSuggestions: { other: true, comments: true, strings: true },
      }}
    />
  )
}
