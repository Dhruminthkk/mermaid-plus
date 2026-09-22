import { describe, expect, it } from 'vitest'
import { inferArchetype } from '@/core/enrich/archetype'

describe('inferArchetype — shape tokens beat keywords', () => {
  it.each([
    ['cylinder', 'database'],
    ['hexagon', 'queue'],
    ['diamond', 'decision'],
    ['odd', 'note'],
  ] as const)('maps shape %s to %s', (shapeHint, expected) => {
    expect(inferArchetype({ shapeHint, label: 'anything' })).toBe(expected)
  })

  it('prefers the shape token over a conflicting keyword', () => {
    expect(inferArchetype({ shapeHint: 'cylinder', label: 'Queue Service' })).toBe('database')
  })

  it('lets geometry-only shapes defer to keywords', () => {
    expect(inferArchetype({ shapeHint: 'stadium', label: 'End User' })).toBe('user')
    expect(inferArchetype({ shapeHint: 'stadium', label: 'Start' })).toBe('default')
    expect(inferArchetype({ shapeHint: 'circle', label: 'Begin' })).toBe('default')
  })
})

describe('inferArchetype — label keywords', () => {
  it.each([
    ['Postgres', 'database'],
    ['User DB', 'database'],
    ['Redis cache', 'database'],
    ['Kafka topic', 'queue'],
    ['Order Queue', 'queue'],
    ['S3 bucket', 'storage'],
    ['Browser Client', 'user'],
    ['End user', 'user'],
    ['Stripe API (external)', 'external'],
    ['Auth Service', 'service'],
    ['lambda handler', 'service'],
  ] as const)('maps label %s to %s', (label, expected) => {
    expect(inferArchetype({ label })).toBe(expected)
  })

  it('matches keywords case-insensitively', () => {
    expect(inferArchetype({ label: 'POSTGRES' })).toBe('database')
  })

  it('matches only whole words, never substrings', () => {
    expect(inferArchetype({ label: 'Database' })).toBe('database')
    expect(inferArchetype({ label: 'Subservient' })).toBe('default')
  })

  it('falls back to default when nothing matches', () => {
    expect(inferArchetype({ label: 'Step 4' })).toBe('default')
  })
})
