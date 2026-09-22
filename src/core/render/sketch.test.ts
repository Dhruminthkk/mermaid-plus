import { describe, expect, it } from 'vitest'
import { roundedRectPath, sketchPath, sketchSeed } from '@/core/render/sketch'

describe('sketchSeed', () => {
  it('is stable and non-zero', () => {
    expect(sketchSeed('node-a')).toBe(sketchSeed('node-a'))
    expect(sketchSeed('node-a')).not.toBe(sketchSeed('node-b'))
    expect(sketchSeed('')).toBeGreaterThan(0)
  })
})

describe('roundedRectPath', () => {
  it('emits a closed path with four curves', () => {
    const d = roundedRectPath(100, 40, 8)
    expect(d).toMatch(/^M /)
    expect(d).toMatch(/Z$/)
    expect((d.match(/Q /g) ?? []).length).toBe(4)
  })

  it('degrades to a plain rectangle at radius 0', () => {
    expect(roundedRectPath(100, 40, 0)).toBe('M 0 0 L 100 0 L 100 50 L 0 50 Z'.replace(/50/g, '40'))
  })
})

describe('sketchPath', () => {
  const d = 'M 0 0 L 120 0 L 120 48 L 0 48 Z'

  it('returns a fill pass and an outline pass with colors passed through', () => {
    const paths = sketchPath(d, { seed: 42, fill: 'var(--f)', stroke: 'var(--s)', strokeWidth: 1.5 })
    expect(paths.length).toBeGreaterThanOrEqual(2)
    expect(paths.some((p) => p.stroke === 'var(--f)')).toBe(true) // hachure lines carry the fill color
    expect(paths.some((p) => p.stroke === 'var(--s)')).toBe(true)
    expect(paths.every((p) => p.d.length > 0 && !/NaN/.test(p.d))).toBe(true)
  })

  it('is deterministic for the same seed', () => {
    const a = sketchPath(d, { seed: 7, stroke: '#000', strokeWidth: 1 })
    const b = sketchPath(d, { seed: 7, stroke: '#000', strokeWidth: 1 })
    expect(b).toEqual(a)
  })

  it('draws only an outline when no fill is given', () => {
    const paths = sketchPath(d, { seed: 7, stroke: '#000', strokeWidth: 1 })
    expect(paths.every((p) => p.fill === 'none')).toBe(true)
  })
})
