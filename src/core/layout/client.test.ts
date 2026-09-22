import { describe, expect, it } from 'vitest'
import { LayoutClient, SupersededError } from '@/core/layout/client'
import { cleanLight } from '@/core/theme'
import type { DiagramIR } from '@/core/ir'
import type { LaidOutDiagram } from '@/core/layout/types'

const ir: DiagramIR = { kind: 'flowchart', tier: 1, direction: 'TB', nodes: [], edges: [], groups: [], directives: [], raw: '' }

function fakeLayout(width = 1): LaidOutDiagram {
  return { ir, nodes: [], edges: [], groups: [], bounds: { x: 0, y: 0, width, height: 1 }, width, height: 1 }
}

interface Deferred {
  resolve: (r: LaidOutDiagram) => void
  reject: (e: unknown) => void
}

/** A runner whose calls are settled by hand, so ordering can be controlled. */
function deferredRunner() {
  const calls: Deferred[] = []
  const run = () => new Promise<LaidOutDiagram>((resolve, reject) => calls.push({ resolve, reject }))
  return { calls, run }
}

describe('LayoutClient', () => {
  it('resolves with the runner result', async () => {
    const { calls, run } = deferredRunner()
    const client = new LayoutClient(run)
    const promise = client.layout(ir, cleanLight)
    expect(calls).toHaveLength(1)
    calls[0]!.resolve(fakeLayout(7))
    await expect(promise).resolves.toMatchObject({ width: 7 })
  })

  it('rejects with the runner error', async () => {
    const { calls, run } = deferredRunner()
    const client = new LayoutClient(run)
    const promise = client.layout(ir, cleanLight)
    calls[0]!.reject(new Error('boom'))
    await expect(promise).rejects.toThrow('boom')
  })

  it('wraps non-Error rejections', async () => {
    const { calls, run } = deferredRunner()
    const client = new LayoutClient(run)
    const promise = client.layout(ir, cleanLight)
    calls[0]!.reject('string failure')
    await expect(promise).rejects.toThrow('string failure')
  })

  it('supersedes a pending request when a newer one arrives, discarding the late result', async () => {
    const { calls, run } = deferredRunner()
    const client = new LayoutClient(run)
    const first = client.layout(ir, cleanLight)
    const second = client.layout(ir, cleanLight)
    await expect(first).rejects.toBeInstanceOf(SupersededError)
    calls[0]!.resolve(fakeLayout(111)) // late result for the superseded request
    calls[1]!.resolve(fakeLayout(222))
    await expect(second).resolves.toMatchObject({ width: 222 })
  })

  it('accepts a new request after the previous one settled', async () => {
    const { calls, run } = deferredRunner()
    const client = new LayoutClient(run)
    const first = client.layout(ir, cleanLight)
    calls[0]!.resolve(fakeLayout(1))
    await first
    const second = client.layout(ir, cleanLight)
    calls[1]!.resolve(fakeLayout(2))
    await expect(second).resolves.toMatchObject({ width: 2 })
  })

  it('runs the dispose hook', () => {
    let disposed = false
    new LayoutClient(deferredRunner().run, () => { disposed = true }).dispose()
    expect(disposed).toBe(true)
  })
})
