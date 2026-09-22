import { describe, expect, it } from 'vitest'
import { measureCompartments, measureLabel, measureNode } from '@/core/layout/measure'
import { cleanLight } from '@/core/theme'
import type { IRNode } from '@/core/ir'

function node(label: string, archetype: IRNode['archetype'] = 'default'): IRNode {
  return { id: 'n', label, archetype, meta: {} }
}

describe('measureLabel', () => {
  it('grows with label length', () => {
    const short = measureLabel('ab', cleanLight)
    const long = measureLabel('abcdefghij', cleanLight)
    expect(long.width).toBeGreaterThan(short.width)
    expect(long.height).toBe(short.height)
  })

  it('uses the longest line for width and counts lines for height', () => {
    const single = measureLabel('Hello', cleanLight)
    const multi = measureLabel('Hello<br/>World wide', cleanLight)
    expect(multi.width).toBeGreaterThan(single.width)
    expect(multi.height).toBe(single.height * 2)
  })

  it('is deterministic', () => {
    expect(measureLabel('Auth Service', cleanLight)).toEqual(measureLabel('Auth Service', cleanLight))
  })
})

describe('measureNode', () => {
  it('adds theme padding around the label', () => {
    const label = measureLabel('Some long enough label', cleanLight)
    const box = measureNode(node('Some long enough label'), cleanLight)
    expect(box.width).toBe(label.width + cleanLight.geometry.nodePaddingX * 2)
    expect(box.height).toBe(label.height + cleanLight.geometry.nodePaddingY * 2)
  })

  it('enforces a minimum width so single-letter nodes are not slivers', () => {
    expect(measureNode(node('a'), cleanLight).width).toBeGreaterThanOrEqual(64)
  })

  it('inflates decision nodes to fit a diamond around the label', () => {
    const rect = measureNode(node('Valid?'), cleanLight)
    const diamond = measureNode(node('Valid?', 'decision'), cleanLight)
    expect(diamond.width).toBeGreaterThan(rect.width)
    expect(diamond.height).toBeGreaterThan(rect.height)
  })

  it('widens shapes whose own geometry eats horizontal room', () => {
    const plain = measureNode(node('Order events'), cleanLight)
    const hexagon = measureNode({ ...node('Order events'), archetype: 'queue' }, cleanLight)
    const stadium = measureNode({ ...node('Order events'), archetype: 'user' }, cleanLight)
    expect(hexagon.width).toBeGreaterThan(plain.width)
    expect(stadium.width).toBeGreaterThan(plain.width)
  })

  it('reserves room for an icon beside the label', () => {
    const plain = measureNode(node('Auth Service Gateway'), cleanLight)
    const withIcon = measureNode({ ...node('Auth Service Gateway'), icon: 'general:server' }, cleanLight)
    expect(withIcon.width).toBeGreaterThan(plain.width)
    expect(withIcon.height).toBe(plain.height)
  })

  it('makes circle-hinted nodes square', () => {
    const box = measureNode({ id: 'c', label: 'Start', archetype: 'default', shapeHint: 'circle', meta: {} }, cleanLight)
    expect(box.width).toBe(box.height)
  })

  it('returns integers so layout output is stable across platforms', () => {
    const box = measureNode(node('Some odd-length label'), cleanLight)
    expect(Number.isInteger(box.width)).toBe(true)
    expect(Number.isInteger(box.height)).toBe(true)
  })
})

describe('measureCompartments', () => {
  it('sums section heights and collapses empty sections', () => {
    const m = measureCompartments([['Animal'], ['+String name', '+int age'], []], cleanLight)
    expect(m.sectionHeights).toHaveLength(3)
    expect(m.sectionHeights[2]).toBe(0)
    expect(m.sectionHeights[1]).toBe(2 * m.bodyLine + m.padY * 2)
    expect(m.height).toBe(m.sectionHeights[0]! + m.sectionHeights[1]!)
  })

  it('is as wide as the widest line plus padding', () => {
    const narrow = measureCompartments([['A'], ['x']], cleanLight)
    const wide = measureCompartments([['A'], ['a much longer member line']], cleanLight)
    expect(wide.width).toBeGreaterThan(narrow.width)
  })

  it('drives measureNode for compartment nodes and fixed pseudo-states', () => {
    const cls = measureNode({ id: 'c', label: 'Animal', archetype: 'default', compartments: [['Animal'], ['+a', '+b']], meta: {} }, cleanLight)
    expect(cls.height).toBe(measureCompartments([['Animal'], ['+a', '+b']], cleanLight).height)
    expect(measureNode({ id: 's', label: '', archetype: 'default', shapeHint: 'stateStart', meta: {} }, cleanLight)).toEqual({ width: 18, height: 18 })
  })
})
