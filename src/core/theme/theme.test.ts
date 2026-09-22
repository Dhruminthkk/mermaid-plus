import { describe, expect, it } from 'vitest'
import { cleanLight, contrastRatio, getTheme, listThemes, themeIdFromDirectives, themeToCssVars, cssVarsToStyle } from '@/core/theme'
import type { Archetype } from '@/core/ir'

const ALL_ARCHETYPES: Archetype[] = [
  'service', 'database', 'queue', 'storage', 'user', 'external', 'process', 'decision', 'note', 'default',
]

describe('built-in themes', () => {
  it('define a fill/stroke/text triple for every archetype', () => {
    for (const theme of listThemes()) {
      for (const archetype of ALL_ARCHETYPES) {
        const entry = theme.color.archetype[archetype]
        expect(entry, `${theme.id} missing ${archetype}`).toBeDefined()
        expect(entry.fill).toMatch(/^#[0-9a-f]{6}$/i)
        expect(entry.stroke).toMatch(/^#[0-9a-f]{6}$/i)
        expect(entry.text).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('are retrievable by id and reject unknown ids', () => {
    expect(getTheme('clean-light')).toBe(cleanLight)
    expect(() => getTheme('nope')).toThrow('unknown theme "nope"')
  })

  it('ship ten families, each in light and dark', () => {
    const ids = listThemes().map((t) => t.id).sort()
    expect(ids).toEqual([
      'blueprint-dark', 'blueprint-light', 'clean-dark', 'clean-light', 'contrast-dark', 'contrast-light',
      'mono-dark', 'mono-light', 'notebook-dark', 'notebook-light', 'ocean-dark', 'ocean-light',
      'paper-dark', 'paper-light', 'slate-dark', 'slate-light', 'terminal-dark', 'terminal-light',
      'vivid-dark', 'vivid-light',
    ])
    for (const theme of listThemes()) expect(theme.id.endsWith(theme.mode)).toBe(true)
  })

  it('keep the canvas clearly behind the nodes that sit on it', () => {
    const flat: string[] = []
    for (const theme of listThemes()) {
      // A canvas the same tone as a node fill gives the diagram nothing to sit on.
      const ratio = contrastRatio(theme.color.canvas, theme.color.archetype.default.fill)
      if (theme.id.startsWith('contrast')) continue
      if (ratio < 1.06) flat.push(`${theme.id}: ${ratio.toFixed(3)}`)
    }
    expect(flat).toEqual([])
  })

  it('keep label text readable on every archetype fill (≥ 3:1 everywhere, ≥ 4.5:1 for Contrast)', () => {
    const failures: string[] = []
    for (const theme of listThemes()) {
      const floor = theme.id.startsWith('contrast') ? 4.5 : 3
      for (const archetype of ALL_ARCHETYPES) {
        const { fill, text } = theme.color.archetype[archetype]
        const ratio = contrastRatio(fill, text)
        if (ratio < floor) failures.push(`${theme.id}/${archetype}: ${text} on ${fill} = ${ratio.toFixed(2)}`)
      }
      const body = contrastRatio(theme.color.canvas, theme.color.text)
      if (body < floor) failures.push(`${theme.id}/body: ${body.toFixed(2)}`)
    }
    expect(failures).toEqual([])
  })

  it('mark Notebook as the sketch-textured family', () => {
    expect(getTheme('notebook-light').texture).toBe('sketch')
    expect(getTheme('clean-light').texture).toBe('crisp')
  })
})

describe('themeIdFromDirectives', () => {
  it('reads a bare theme id', () => {
    expect(themeIdFromDirectives([{ target: 'theme', attrs: { 'slate-dark': 'true' } }])).toBe('slate-dark')
  })

  it('accepts id=… form', () => {
    expect(themeIdFromDirectives([{ target: 'theme', attrs: { id: 'vivid-light' } }])).toBe('vivid-light')
  })

  it('ignores unknown ids and missing directives', () => {
    expect(themeIdFromDirectives([{ target: 'theme', attrs: { nope: 'true' } }])).toBeUndefined()
    expect(themeIdFromDirectives([])).toBeUndefined()
  })
})

describe('themeToCssVars', () => {
  const vars = themeToCssVars(cleanLight)

  it('emits top-level color tokens', () => {
    expect(vars['--mp-color-canvas']).toBe(cleanLight.color.canvas)
    expect(vars['--mp-color-edge']).toBe(cleanLight.color.edge)
  })

  it('emits one triple per archetype', () => {
    expect(vars['--mp-arch-database-fill']).toBe(cleanLight.color.archetype.database.fill)
    expect(vars['--mp-arch-database-stroke']).toBe(cleanLight.color.archetype.database.stroke)
    expect(vars['--mp-arch-database-text']).toBe(cleanLight.color.archetype.database.text)
  })

  it('emits typography and geometry as unitless or px strings', () => {
    expect(vars['--mp-font-family']).toBe(cleanLight.type.family)
    expect(vars['--mp-radius']).toBe(`${cleanLight.geometry.radius}px`)
    expect(vars['--mp-stroke-width']).toBe(`${cleanLight.geometry.strokeWidth}px`)
  })

  it('emits the accent ramp indexed', () => {
    expect(vars['--mp-accent-0']).toBe(cleanLight.color.accent[0])
  })
})

describe('cssVarsToStyle', () => {
  it('joins into a declaration list', () => {
    expect(cssVarsToStyle({ '--a': '1', '--b': 'x' })).toBe('--a:1;--b:x;')
  })
})
