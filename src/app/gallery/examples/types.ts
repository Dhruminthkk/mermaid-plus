export interface Example {
  title: string
  source: string
  /**
   * Overrides the kind's tier. Only the showcase needs it: it is grouped by
   * capability rather than by diagram type, so one entry can be tier 2.
   */
  tier?: 1 | 2
}

export interface ExampleKind {
  /** Human label, e.g. "Flowchart". */
  label: string
  /** 1 = custom ELK pipeline, 2 = themed mermaid passthrough. */
  tier: 1 | 2
  examples: Example[]
}
