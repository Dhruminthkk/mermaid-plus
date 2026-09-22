export {}

declare global {
  interface Window {
    __mp?: { lastLayoutMs: number | null; nodeCount: number; setSource?: (source: string) => void; source?: string }
    MonacoEnvironment?: { getWorker: (workerId: string, label: string) => Worker }
  }
}
