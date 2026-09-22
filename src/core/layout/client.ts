import ELK from 'elkjs/lib/elk-api.js'
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url'
import type { DiagramIR } from '@/core/ir'
import type { Theme } from '@/core/theme'
import { runLayout } from './run'
import type { LaidOutDiagram } from './types'

export type LayoutRunner = (ir: DiagramIR, theme: Theme) => Promise<LaidOutDiagram>

export class SupersededError extends Error {
  constructor() {
    super('layout request superseded by a newer one')
    this.name = 'SupersededError'
  }
}

interface Pending {
  id: number
  reject: (error: Error) => void
}

/**
 * Serializes layout requests and guarantees only the newest one settles: an
 * older in-flight request is rejected with SupersededError the moment a newer
 * one arrives, and its late result is discarded.
 */
export class LayoutClient {
  private pending: Pending | null = null
  private latest = 0

  constructor(private readonly run: LayoutRunner, private readonly onDispose: () => void = () => {}) {}

  /**
   * Browser entry point. ELK executes inside its own Web Worker (elkjs' supported
   * browser mode, via `elk-worker.min.js`); only the cheap flatten step runs on
   * the main thread. elkjs' self-contained bundle cannot be used here: after
   * Vite pre-bundles it, its internal fallback worker resolves to undefined.
   */
  static create(): LayoutClient {
    const elk = new ELK({ workerUrl: elkWorkerUrl })
    return new LayoutClient((ir, theme) => runLayout(ir, theme, elk), () => elk.terminateWorker())
  }

  layout(ir: DiagramIR, theme: Theme): Promise<LaidOutDiagram> {
    if (this.pending) {
      this.pending.reject(new SupersededError())
      this.pending = null
    }
    const id = ++this.latest
    return new Promise<LaidOutDiagram>((resolve, reject) => {
      this.pending = { id, reject }
      this.run(ir, theme).then(
        (result) => {
          if (this.pending?.id !== id) return
          this.pending = null
          resolve(result)
        },
        (error: unknown) => {
          if (this.pending?.id !== id) return
          this.pending = null
          reject(error instanceof Error ? error : new Error(String(error)))
        },
      )
    })
  }

  dispose(): void {
    this.onDispose()
  }
}
