import { describe, expect, it } from 'vitest'
import { roundedPath, smoothPath, straightPath } from '@/core/layout/path'

describe('roundedPath', () => {
  it('draws a straight line for two points', () => {
    expect(roundedPath([{ x: 0, y: 0 }, { x: 100, y: 0 }], 8)).toBe('M 0 0 L 100 0')
  })

  it('rounds an L-shaped corner with a quadratic curve', () => {
    expect(roundedPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }], 8)).toBe('M 0 0 L 92 0 Q 100 0 100 8 L 100 100')
  })

  it('clamps the radius to half the shortest adjacent segment', () => {
    expect(roundedPath([{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 100 }], 8)).toBe('M 0 0 L 3 0 Q 6 0 6 3 L 6 100')
  })

  it('returns an empty string for fewer than two points', () => {
    expect(roundedPath([{ x: 1, y: 1 }], 8)).toBe('')
    expect(roundedPath([], 8)).toBe('')
  })

  it('emits at most three decimals so output is stable', () => {
    expect(roundedPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 3.33333)).not.toMatch(/\d\.\d{4,}/)
  })
})

describe('straightPath', () => {
  it('joins points with lines', () => {
    expect(straightPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }])).toBe('M 0 0 L 10 0 L 10 10')
  })
})

describe('smoothPath', () => {
  it('draws one S-curve between the endpoints with horizontal tangents when mostly horizontal', () => {
    expect(smoothPath([{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 20 }, { x: 100, y: 20 }])).toBe('M 0 0 C 50 0 50 20 100 20')
  })

  it('uses vertical tangents when mostly vertical', () => {
    expect(smoothPath([{ x: 0, y: 0 }, { x: 20, y: 100 }])).toBe('M 0 0 C 0 50 20 50 20 100')
  })

  it('follows an explicit layout axis even when the delta says otherwise', () => {
    expect(smoothPath([{ x: 0, y: 0 }, { x: 20, y: 100 }], 'x')).toBe('M 0 0 C 10 0 10 100 20 100')
  })

  it('returns nothing for fewer than two points', () => {
    expect(smoothPath([{ x: 1, y: 1 }])).toBe('')
  })
})
