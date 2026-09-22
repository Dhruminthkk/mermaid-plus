import type { DiagramIR } from '@/core/ir'
import { collapseGroups, directiveCollapsedGroups, validateIR } from '@/core/ir'
import { parseDiagram, type ParseError } from '@/core/parse'
import { enrich } from '@/core/enrich'
import type { LaidOutDiagram } from '@/core/layout'
import { getTheme, themeIdFromDirectives, type Theme } from '@/core/theme'
import { resolveIcons, type IconMap } from '@/core/icons'
import type { Tier2Svg } from '@/compat'

export type LayoutFn = (ir: DiagramIR, theme: Theme) => Promise<LaidOutDiagram>
export type Tier2Fn = (source: string, theme: Theme) => Promise<Tier2Svg>

export interface CompileOptions {
  /** User toggles layered over `%%mp: group X collapsed` directives. */
  collapsedOverrides?: Record<string, boolean>
}

export type Rendered =
  | { tier: 1; layout: LaidOutDiagram; icons: IconMap; theme: Theme; collapsed: string[]; width: number; height: number }
  | { tier: 2; kind: string; svg: string; theme: Theme; width: number; height: number }

export type CompileResult =
  | { ok: true; rendered: Rendered; warnings: string[]; elapsedMs: number }
  | { ok: false; error: ParseError }

function asError(error: unknown): ParseError {
  return { message: error instanceof Error ? error.message : String(error) }
}

export async function compile(source: string, theme: Theme, layout: LayoutFn, tier2: Tier2Fn, options: CompileOptions = {}): Promise<CompileResult> {
  const parsed = await parseDiagram(source)
  if (!parsed.ok) return parsed

  const ir = enrich(parsed.ir)
  // A `%%mp: theme <id>` directive in the source wins over the UI selection.
  const directiveTheme = themeIdFromDirectives(ir.directives)
  const effective = directiveTheme ? getTheme(directiveTheme) : theme
  const started = performance.now()

  if (ir.tier === 2) {
    try {
      const out = await tier2(source, effective)
      return {
        ok: true,
        rendered: { tier: 2, kind: ir.kind, theme: effective, ...out },
        warnings: parsed.warnings,
        elapsedMs: performance.now() - started,
      }
    } catch (error) {
      return { ok: false, error: asError(error) }
    }
  }

  const problems = validateIR(ir)
  if (problems.length > 0) {
    return { ok: false, error: { message: problems.join('; ') } }
  }

  const collapsed = directiveCollapsedGroups(ir)
  for (const [id, on] of Object.entries(options.collapsedOverrides ?? {})) {
    if (on) collapsed.add(id)
    else collapsed.delete(id)
  }
  const visibleIr = collapseGroups(ir, collapsed)

  try {
    const [laid, resolved] = await Promise.all([
      layout(visibleIr, effective),
      resolveIcons(visibleIr.nodes.flatMap((n) => (n.icon ? [n.icon] : []))),
    ])
    return {
      ok: true,
      rendered: { tier: 1, layout: laid, icons: resolved.icons, theme: effective, collapsed: Array.from(collapsed).sort(), width: laid.width, height: laid.height },
      warnings: [...parsed.warnings, ...resolved.missing.map((ref) => `unknown icon "${ref}"`)],
      elapsedMs: performance.now() - started,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'SupersededError') throw error
    return { ok: false, error: asError(error) }
  }
}
