import type { Theme } from './types'
import { cleanDark, cleanLight } from './themes/clean'
import { slateDark, slateLight } from './themes/slate'
import { blueprintDark, blueprintLight } from './themes/blueprint'
import { notebookDark, notebookLight } from './themes/notebook'
import { vividDark, vividLight } from './themes/vivid'
import { contrastDark, contrastLight } from './themes/contrast'
import { paperDark, paperLight } from './themes/paper'
import { monoDark, monoLight } from './themes/mono'
import { terminalDark, terminalLight } from './themes/terminal'
import { oceanDark, oceanLight } from './themes/ocean'

export type { Theme, ArchetypeColors } from './types'
export { cleanLight, cleanDark } from './themes/clean'
export { themeToCssVars, cssVarsToStyle } from './css-vars'
export { contrastRatio, luminance } from './contrast'

const BUILT_INS: Theme[] = [
  cleanLight, cleanDark,
  slateLight, slateDark,
  blueprintLight, blueprintDark,
  notebookLight, notebookDark,
  vividLight, vividDark,
  oceanLight, oceanDark,
  paperLight, paperDark,
  monoLight, monoDark,
  terminalLight, terminalDark,
  contrastLight, contrastDark,
]

const REGISTRY: ReadonlyMap<string, Theme> = new Map(BUILT_INS.map((t) => [t.id, t]))

export const DEFAULT_THEME_ID = cleanLight.id

export function getTheme(id: string): Theme {
  const theme = REGISTRY.get(id)
  if (!theme) throw new Error(`unknown theme "${id}"`)
  return theme
}

export function hasTheme(id: string): boolean {
  return REGISTRY.has(id)
}

export function listThemes(): Theme[] {
  return Array.from(REGISTRY.values())
}

/**
 * The theme id named by a `%%mp: theme <id>` directive, if any. The directive
 * parser stores the bare id as a flag attribute, so it is the first attr key.
 */
export function themeIdFromDirectives(directives: ReadonlyArray<{ target: string; attrs: Record<string, string> }>): string | undefined {
  const directive = directives.find((d) => d.target === 'theme')
  if (!directive) return undefined
  const id = directive.attrs['id'] ?? Object.keys(directive.attrs)[0]
  return id !== undefined && hasTheme(id) ? id : undefined
}
