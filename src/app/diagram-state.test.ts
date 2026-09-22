import { describe, expect, it } from 'vitest'
import { diagramReducer, initialState, resolveTheme } from '@/app/diagram-state'
import type { LaidOutDiagram } from '@/core/layout'
import type { DiagramIR } from '@/core/ir'
import type { Rendered } from '@/app/pipeline'
import { cleanLight } from '@/core/theme'

const ir: DiagramIR = { kind: 'flowchart', tier: 1, direction: 'TB', nodes: [], edges: [], groups: [], directives: [], raw: '' }
const layout: LaidOutDiagram = { ir, nodes: [], edges: [], groups: [], bounds: { x: 0, y: 0, width: 10, height: 10 }, width: 10, height: 10 }
const rendered: Rendered = { tier: 1, layout, icons: {}, theme: cleanLight, collapsed: [], width: 10, height: 10 }

describe('diagramReducer', () => {
  it('starts with no render, no error, not pending', () => {
    expect(initialState('flowchart TD', 'clean-light')).toEqual({
      source: 'flowchart TD', themeId: 'clean-light', customTheme: null, docVersion: 0, collapsedOverrides: {}, rendered: null, error: null, warnings: [], pending: false, settled: false, lastLayoutMs: null,
    })
  })

  it('marks pending on compile-start', () => {
    expect(diagramReducer(initialState('', 'clean-light'), { type: 'compile-start' }).pending).toBe(true)
  })

  it('stores render, warnings, and timing on compile-ok and clears the error', () => {
    let s = initialState('', 'clean-light')
    s = diagramReducer(s, { type: 'compile-error', error: { message: 'bad' } })
    s = diagramReducer(s, { type: 'compile-ok', rendered, warnings: ['w'], elapsedMs: 12 })
    expect(s).toMatchObject({ rendered, warnings: ['w'], error: null, pending: false, lastLayoutMs: 12 })
  })

  it('keeps the last good render when a compile fails', () => {
    let s = initialState('', 'clean-light')
    s = diagramReducer(s, { type: 'compile-ok', rendered, warnings: [], elapsedMs: 1 })
    s = diagramReducer(s, { type: 'compile-error', error: { message: 'Parse error', line: 3 } })
    expect(s.rendered).toBe(rendered)
    expect(s.error).toEqual({ message: 'Parse error', line: 3 })
    expect(s.pending).toBe(false)
  })

  it('updates source and theme without touching the render', () => {
    let s = initialState('a', 'clean-light')
    s = diagramReducer(s, { type: 'compile-ok', rendered, warnings: [], elapsedMs: 1 })
    s = diagramReducer(s, { type: 'edit', source: 'b' })
    s = diagramReducer(s, { type: 'set-theme', themeId: 'clean-dark' })
    expect(s).toMatchObject({ source: 'b', themeId: 'clean-dark', rendered })
  })
})

describe('documents and custom themes', () => {
  it('bumps docVersion on load but not on edit', () => {
    let s = initialState('a', 'clean-light')
    s = diagramReducer(s, { type: 'edit', source: 'b' })
    expect(s.docVersion).toBe(0)
    s = diagramReducer(s, { type: 'load', source: 'c', themeId: 'slate-dark' })
    expect(s).toMatchObject({ source: 'c', themeId: 'slate-dark', docVersion: 1 })
  })

  it('selects a custom theme when one is set and falls back when cleared', () => {
    let s = initialState('a', 'vivid-light')
    const custom = { ...cleanLight, id: 'custom', name: 'Mine' }
    s = diagramReducer(s, { type: 'set-custom-theme', theme: custom })
    expect(s.themeId).toBe('custom')
    expect(resolveTheme(s)).toBe(custom)
    s = diagramReducer(s, { type: 'set-custom-theme', theme: null })
    expect(s.themeId).toBe('clean-light')
    expect(resolveTheme({ themeId: 'nope', customTheme: null }).id).toBe('clean-light')
  })
})

describe('collapse overrides', () => {
  it('toggles relative to the current state and clears on load', () => {
    let s = initialState('a', 'clean-light')
    s = diagramReducer(s, { type: 'toggle-group', groupId: 'g', currentlyCollapsed: false })
    expect(s.collapsedOverrides).toEqual({ g: true })
    s = diagramReducer(s, { type: 'toggle-group', groupId: 'g', currentlyCollapsed: true })
    expect(s.collapsedOverrides).toEqual({ g: false })
    s = diagramReducer(s, { type: 'load', source: 'b' })
    expect(s.collapsedOverrides).toEqual({})
  })
})
