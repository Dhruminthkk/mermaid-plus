import { describe, expect, it } from 'vitest'
import { isRoundShape, shapePath } from '@/core/render/shapes'

describe('shapePath — archetype shape language', () => {
  it.each(['database', 'queue', 'decision', 'note', 'user'] as const)('draws a path for %s', (archetype) => {
    const d = shapePath(archetype, undefined, 120, 48)
    expect(d).toMatch(/^M /)
    expect(d).toMatch(/Z$/)
    expect(d).not.toMatch(/NaN|undefined/)
  })

  it.each(['default', 'process', 'service', 'external', 'storage'] as const)('uses a rect for %s with no hint', (archetype) => {
    expect(shapePath(archetype, undefined, 120, 48)).toBeNull()
    expect(shapePath(archetype, 'square', 120, 48)).toBeNull()
  })

  it('lets the archetype override a conflicting mermaid shape', () => {
    expect(shapePath('database', 'stadium', 120, 48)).toBe(shapePath('database', undefined, 120, 48))
  })

  it('keeps a diamond inside its bounding box', () => {
    const numbers = shapePath('decision', undefined, 100, 60)!.match(/-?\d+(\.\d+)?/g)!.map(Number)
    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...numbers)).toBeLessThanOrEqual(100)
  })
})

describe('shapePath — mermaid shape hints for plain archetypes', () => {
  it.each(['stadium', 'circle', 'doublecircle', 'subroutine', 'lean_right', 'lean_left', 'trapezoid', 'inv_trapezoid', 'cylinder', 'hexagon', 'odd'])(
    'draws a path for hint %s', (hint) => {
      const d = shapePath('default', hint, 120, 48)
      expect(d).toMatch(/^M /)
      expect(d).toMatch(/Z$/)
      expect(d).not.toMatch(/NaN|undefined/)
    },
  )

  it('flags circular hints as needing a square box', () => {
    expect(isRoundShape('circle')).toBe(true)
    expect(isRoundShape('doublecircle')).toBe(true)
    expect(isRoundShape('stadium')).toBe(false)
    expect(isRoundShape(undefined)).toBe(false)
  })
})
