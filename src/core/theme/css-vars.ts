import type { Theme } from './types'

export function themeToCssVars(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {
    '--mp-color-canvas': theme.color.canvas,
    '--mp-color-surface': theme.color.surface,
    '--mp-color-surface-raised': theme.color.surfaceRaised,
    '--mp-color-text': theme.color.text,
    '--mp-color-text-muted': theme.color.textMuted,
    '--mp-color-stroke': theme.color.stroke,
    '--mp-color-edge': theme.color.edge,
    '--mp-color-edge-muted': theme.color.edgeMuted,
    '--mp-font-family': theme.type.family,
    '--mp-font-family-mono': theme.type.familyMono,
    '--mp-font-size-label': `${theme.type.scale[1]}px`,
    '--mp-font-size-title': `${theme.type.scale[2]}px`,
    '--mp-font-weight-label': String(theme.type.weightLabel),
    '--mp-font-weight-title': String(theme.type.weightTitle),
    '--mp-radius': `${theme.geometry.radius}px`,
    '--mp-stroke-width': `${theme.geometry.strokeWidth}px`,
    '--mp-color-flow': theme.color.flow ?? theme.color.accent[0] ?? theme.color.edge,
    '--mp-shadow-0': theme.depth.elevation[0],
    '--mp-shadow-1': theme.depth.elevation[1],
    '--mp-shadow-2': theme.depth.elevation[2],
  }

  theme.color.accent.forEach((value, i) => {
    vars[`--mp-accent-${i}`] = value
  })

  for (const [archetype, colors] of Object.entries(theme.color.archetype)) {
    vars[`--mp-arch-${archetype}-fill`] = colors.fill
    vars[`--mp-arch-${archetype}-stroke`] = colors.stroke
    vars[`--mp-arch-${archetype}-text`] = colors.text
  }

  return vars
}

export function cssVarsToStyle(vars: Record<string, string>): string {
  return Object.entries(vars).map(([key, value]) => `${key}:${value};`).join('')
}
