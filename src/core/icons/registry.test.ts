import { describe, expect, it } from 'vitest'
import { ARCHETYPE_ICONS, parseIconRef, resolveIcons } from '@/core/icons'

describe('parseIconRef', () => {
  it('defaults bare names to the general pack', () => {
    expect(parseIconRef('server')).toEqual({ pack: 'general', name: 'server' })
  })

  it('splits pack:name', () => {
    expect(parseIconRef('aws:lambda')).toEqual({ pack: 'aws', name: 'lambda' })
  })

  it('rejects unknown packs, empty names, and the none sentinel', () => {
    expect(parseIconRef('nope:thing')).toBeNull()
    expect(parseIconRef('aws:')).toBeNull()
    expect(parseIconRef('none')).toBeNull()
    expect(parseIconRef('')).toBeNull()
  })
})

describe('resolveIcons', () => {
  it('loads general glyphs as monochrome with a 24-unit box', async () => {
    const { icons, missing } = await resolveIcons(['general:server', 'database'])
    expect(missing).toEqual([])
    expect(icons['general:server']).toMatchObject({ width: 24, height: 24, monochrome: true })
    expect(icons['general:server']?.body).toContain('<')
    expect(icons['database']?.monochrome).toBe(true)
  })

  it('loads vendor marks in full color', async () => {
    const { icons } = await resolveIcons(['aws:lambda', 'k8s:kubernetes'])
    expect(icons['aws:lambda']?.monochrome).toBe(false)
    expect(icons['k8s:kubernetes']?.body).toBeTruthy()
  })

  it('reports unknown icons instead of throwing', async () => {
    const { icons, missing } = await resolveIcons(['aws:not-a-service', 'bogus:thing', 'none'])
    expect(icons).toEqual({})
    expect(missing).toEqual(['aws:not-a-service', 'bogus:thing'])
  })

  it('has a resolvable default for every archetype that declares one', async () => {
    const { missing } = await resolveIcons(Object.values(ARCHETYPE_ICONS))
    expect(missing).toEqual([])
  })
})
