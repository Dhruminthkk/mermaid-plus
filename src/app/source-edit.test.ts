import { describe, expect, it } from 'vitest'
import { upsertLayoutDirective } from '@/app/source-edit'

describe('upsertLayoutDirective', () => {
  it('adds the directive under the header when there is none', () => {
    expect(upsertLayoutDirective('flowchart TD\n  a --> b', 'direction', 'RIGHT'))
      .toBe('flowchart TD\n%%mp: layout direction=RIGHT\n  a --> b')
  })

  it('replaces the value when the key is already set', () => {
    expect(upsertLayoutDirective('flowchart TD\n%%mp: layout direction=RIGHT\n  a --> b', 'direction', 'DOWN'))
      .toBe('flowchart TD\n%%mp: layout direction=DOWN\n  a --> b')
  })

  it('joins an existing layout line rather than opening a second one', () => {
    expect(upsertLayoutDirective('flowchart TD\n%%mp: layout edgeLabels=beside\n  a --> b', 'direction', 'UP'))
      .toBe('flowchart TD\n%%mp: layout edgeLabels=beside direction=UP\n  a --> b')
  })

  it('leaves the rest of a busy layout line alone', () => {
    const before = 'flowchart TD\n%%mp: layout direction=DOWN flow=none edgeLabels=beside\n  a --> b'
    expect(upsertLayoutDirective(before, 'direction', 'LEFT'))
      .toBe('flowchart TD\n%%mp: layout direction=LEFT flow=none edgeLabels=beside\n  a --> b')
  })

  it('survives leading blank lines and an empty document', () => {
    expect(upsertLayoutDirective('\n\nflowchart TD\n  a --> b', 'direction', 'RIGHT'))
      .toBe('\n\nflowchart TD\n%%mp: layout direction=RIGHT\n  a --> b')
    expect(upsertLayoutDirective('', 'direction', 'RIGHT')).toBe('%%mp: layout direction=RIGHT\n')
  })
})
