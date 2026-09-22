import { describe, expect, it } from 'vitest'
import { appName } from '@/app/App'

describe('toolchain', () => {
  it('resolves the @ path alias and runs TypeScript', () => {
    expect(appName).toBe('Mermaid Plus')
  })
})
