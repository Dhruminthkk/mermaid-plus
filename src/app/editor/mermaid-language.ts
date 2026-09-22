import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'

export const LANGUAGE_ID = 'mermaidplus'

export const DIAGRAM_KEYWORDS = [
  'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram-v2', 'stateDiagram', 'erDiagram', 'mindmap',
  'requirementDiagram', 'C4Context', 'C4Container', 'C4Component', 'C4Dynamic', 'C4Deployment', 'gantt', 'pie', 'journey',
  'timeline', 'gitGraph', 'quadrantChart', 'xychart-beta', 'sankey-beta', 'block-beta', 'packet-beta', 'kanban', 'architecture-beta',
]

export const STRUCTURE_KEYWORDS = [
  'subgraph', 'end', 'direction', 'TB', 'TD', 'BT', 'LR', 'RL', 'participant', 'actor', 'activate', 'deactivate', 'note',
  'loop', 'alt', 'else', 'opt', 'par', 'and', 'critical', 'break', 'rect', 'over', 'right of', 'left of', 'class', 'namespace',
  'state', 'title', 'section', 'dateFormat', 'axisFormat', 'excludes', 'todayMarker', 'requirement', 'element', 'Person',
  'System', 'System_Ext', 'SystemDb', 'SystemQueue', 'Container', 'Component', 'Rel', 'Enterprise_Boundary', 'System_Boundary',
  'Container_Boundary', 'autonumber', 'style', 'classDef', 'linkStyle', 'click',
]

/** Monarch tokenizer: comments, our directives, diagram/structure keywords, arrows, labels. */
export const monarch: Monaco.languages.IMonarchLanguage = {
  ignoreCase: false,
  defaultToken: '',
  tokenizer: {
    root: [
      [/^\s*%%mp:.*$/, 'keyword.directive'],
      [/%%.*$/, 'comment'],
      [/"[^"]*"/, 'string'],
      [/\|[^|]*\|/, 'string.label'],
      [/\[\([^)]*\)\]|\[\[[^\]]*\]\]|\[\/[^/]*\/\]|\[\\[^\\]*\\\]|\[[^\]]*\]|\(\([^)]*\)\)|\([^)]*\)|\{\{[^}]*\}\}|\{[^}]*\}|>[^\]]*\]/, 'string.shape'],
      [/<\|?[-.=]+\|?>|[-.=]+\|?>|<[-.=]+|[o*x]?[-.=]{2,}[o*x>]?|-->>|->>|-\)|--\)|~~~|\|\|--|--\|\||o\{|\}o|\|\{|\}\||o\||\|o/, 'operator'],
      [/:\s*.*$/, 'string.text'],
      [new RegExp(`\\b(${DIAGRAM_KEYWORDS.map((k) => k.replace(/[-]/g, '\\-')).join('|')})\\b`), 'keyword.diagram'],
      [new RegExp(`\\b(${STRUCTURE_KEYWORDS.join('|')})\\b`), 'keyword'],
      [/[A-Za-z_][\w.-]*/, 'identifier'],
      [/\d+/, 'number'],
    ],
  },
}

export function defineTheme(monaco: typeof Monaco, dark: boolean): string {
  const name = dark ? 'mp-dark' : 'mp-light'
  monaco.editor.defineTheme(name, {
    base: dark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [
      { token: 'keyword.directive', foreground: dark ? 'c084fc' : '7c3aed', fontStyle: 'bold' },
      { token: 'keyword.diagram', foreground: dark ? '60a5fa' : '1d4ed8', fontStyle: 'bold' },
      { token: 'keyword', foreground: dark ? '93c5fd' : '2563eb' },
      { token: 'string.shape', foreground: dark ? 'fbbf24' : 'b45309' },
      { token: 'string.label', foreground: dark ? '34d399' : '047857' },
      { token: 'string.text', foreground: dark ? '34d399' : '047857' },
      { token: 'operator', foreground: dark ? 'f472b6' : 'be185d' },
      { token: 'comment', foreground: dark ? '6b7280' : '9ca3af', fontStyle: 'italic' },
    ],
    // Matches --ui-bg so the code pane reads as the same surface as the rest of
    // the shell; a white editor beside a toned canvas is the brightest thing on
    // screen and pulls the eye off the diagram.
    colors: {
      'editor.background': dark ? '#0c0c0f' : '#f7f6f3',
      'editorGutter.background': dark ? '#0c0c0f' : '#f7f6f3',
      'editor.lineHighlightBackground': dark ? '#15151c' : '#eceae4',
      'editorLineNumber.foreground': dark ? '#3b3b47' : '#b3b1a8',
      'editorLineNumber.activeForeground': dark ? '#8a8a99' : '#6f6d64',
      'editorIndentGuide.background1': dark ? '#1c1c24' : '#e3e2dd',
    },
  })
  return name
}
