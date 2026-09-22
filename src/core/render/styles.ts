import type { Archetype } from '@/core/ir'
import type { Theme } from '@/core/theme'
import { cssVarsToStyle, themeToCssVars } from '@/core/theme'
import { usesGradient } from './Markers'

const ARCHETYPES: Archetype[] = [
  'service', 'database', 'queue', 'storage', 'user', 'external', 'process', 'decision', 'note', 'default',
]

export function baseStyles(theme: Theme): string {
  const vars = cssVarsToStyle(themeToCssVars(theme))
  const fill = (a: string) => (usesGradient(theme) ? `url(#mp-fill-${a})` : `var(--mp-arch-${a}-fill)`)
  const perArchetype = ARCHETYPES.map(
    (a) =>
      `.mp-node[data-archetype="${a}"] .mp-node-body{fill:${fill(a)};stroke:var(--mp-arch-${a}-stroke)}` +
      `.mp-node[data-archetype="${a}"] .mp-node-label{fill:var(--mp-arch-${a}-text)}` +
      `.mp-node[data-archetype="${a}"] .mp-node-icon[data-monochrome="true"]{color:var(--mp-arch-${a}-text)}`,
  ).join('')

  return [
    `.mp-diagram{${vars}}`,
    `.mp-diagram{font-family:var(--mp-font-family);font-size:var(--mp-font-size-label);text-rendering:geometricPrecision}`,
    `.mp-node-body{stroke-width:var(--mp-stroke-width);filter:var(--mp-shadow-1)}`,
    // Shadows are the most expensive thing on the canvas; a diagram zoomed out
    // far enough to hide its labels does not need them either.
    `.mp-diagram[data-lod="low"] .mp-node-body{filter:none}`,
    `.mp-node[data-archetype="external"] .mp-node-body{stroke-dasharray:4 3}`,
    `.mp-node[data-archetype="storage"] .mp-node-band{fill:var(--mp-arch-storage-stroke)}`,
    `.mp-node-label{font-weight:var(--mp-font-weight-label);text-anchor:middle;dominant-baseline:central}`,
    `.mp-node[data-selected="true"] .mp-node-body-sketch path{stroke-width:calc(var(--mp-stroke-width) * 2)}`,
    `.mp-node{cursor:pointer}`,
    `.mp-node[data-dimmed="true"],.mp-edge[data-dimmed="true"],.mp-group[data-dimmed="true"]{opacity:0.16;transition:opacity 160ms}`,
    `.mp-node[data-receded="true"],.mp-edge[data-receded="true"]{opacity:0.3;transition:opacity 120ms}`,
    `.mp-diagram[data-emphasis] .mp-node:not([data-receded]),.mp-diagram[data-emphasis] .mp-edge:not([data-receded]){transition:opacity 120ms}`,
    `.mp-node-stack rect{fill:var(--mp-color-surface);stroke:var(--mp-color-stroke);stroke-width:var(--mp-stroke-width)}`,
    `.mp-node[data-collapsed="true"] .mp-node-body{stroke-width:calc(var(--mp-stroke-width) * 1.5)}`,
    `.mp-node-badge circle{fill:var(--mp-color-edge)}`,
    `.mp-node-badge text{fill:var(--mp-color-canvas);font-size:calc(var(--mp-font-size-label) * 0.75);font-weight:var(--mp-font-weight-title);text-anchor:middle;dominant-baseline:central}`,
    `.mp-group-title[data-group-toggle]{cursor:pointer}`,
    `.mp-group-title[data-group-toggle]:hover{fill:var(--mp-color-text)}`,
    `.mp-edge[data-weight]:not([data-weight="1"]) .mp-edge-path{stroke-width:calc(var(--mp-stroke-width) * 2.5)}`,
    `.mp-diagram[data-lod="low"] .mp-node-label,.mp-diagram[data-lod="low"] .mp-node-icon,.mp-diagram[data-lod="low"] .mp-edge-label-group,.mp-diagram[data-lod="low"] .mp-edge-endlabel,.mp-diagram[data-lod="low"] .mp-compartment-divider{display:none}`,
    `.mp-diagram[data-lod="low"] .mp-group-title{font-size:calc(var(--mp-font-size-label) * 2.2)}`,
    `.mp-group-chip-lod{display:none}`,
    `.mp-diagram[data-lod="low"] .mp-group-chip:not(.mp-group-chip-lod){display:none}`,
    `.mp-diagram[data-lod="low"] .mp-group-chip-lod{display:block}`,
    `.mp-node[data-shape="mindmapCircle"] .mp-node-body{fill-opacity:0.28}`,
    `.mp-compartment-divider{stroke:var(--mp-color-stroke);stroke-width:var(--mp-stroke-width)}`,
    `.mp-node[data-archetype="default"] .mp-compartment-divider,.mp-node[data-archetype="process"] .mp-compartment-divider{stroke:var(--mp-color-stroke)}`,
    `.mp-compartment-header{font-weight:var(--mp-font-weight-title)}`,
    `.mp-compartment-stereotype{font-weight:var(--mp-font-weight-label);font-style:italic;opacity:0.75}`,
    `.mp-compartment-line{text-anchor:start;font-size:calc(var(--mp-font-size-label) * 0.85);font-weight:400;font-family:var(--mp-font-family-mono)}`,
    `.mp-edge-endlabel{fill:var(--mp-color-text-muted);font-size:calc(var(--mp-font-size-label) * 0.85);text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:var(--mp-color-canvas);stroke-width:3px;stroke-linejoin:round}`,
    `.mp-edge[data-semantics="async"] .mp-edge-path{stroke-dasharray:7 5}`,
    `.mp-edge[data-semantics="dependency"] .mp-edge-path{stroke-dasharray:5 4}`,
    `.mp-sketch path{stroke-linecap:round;stroke-linejoin:round}`,
    `.mp-group-sketch-fill{opacity:0.35}`,
    `.mp-edge-path{fill:none;stroke:var(--mp-color-edge);stroke-width:var(--mp-stroke-width);stroke-linejoin:round;stroke-linecap:round}`,
    `.mp-edge-path[data-edge-style="dashed"]{stroke-dasharray:6 4}`,
    `.mp-edge-path[data-edge-style="dotted"]{stroke-dasharray:2 4}`,
    `.mp-edge-path[data-edge-style="thick"]{stroke-width:calc(var(--mp-stroke-width) * 2)}`,
    `.mp-arrowhead{fill:var(--mp-color-edge)}`,
    `.mp-edge-label-plate{fill:var(--mp-color-canvas);stroke:none}`,
    `.mp-diagram[data-edge-labels="beside"] .mp-edge-label-plate{fill:none}`,
    `.mp-edge-label{fill:var(--mp-color-text-muted);font-size:calc(var(--mp-font-size-label) * 0.9);text-anchor:middle;dominant-baseline:central}`,
    `.mp-group-body{stroke-width:var(--mp-stroke-width);stroke-dasharray:0}`,
    `.mp-group-title{font-size:calc(var(--mp-font-size-label) * 0.82);font-weight:var(--mp-font-weight-title);letter-spacing:0.06em;text-transform:uppercase;dominant-baseline:central}`,
    `.mp-group-chip{rx:4}`,
    perArchetype,

    // After perArchetype: these carry the same specificity as the per-archetype
    // fill, so the cascade decides on source order alone.
    `.mp-node .mp-node-body.mp-node-solid,.mp-node .mp-node-solid{fill:var(--mp-color-edge);stroke:none;filter:none}`,
    `.mp-node .mp-node-body.mp-node-ring{fill:var(--mp-color-canvas);stroke:var(--mp-color-edge);filter:none}`,
    `.mp-node[data-section][data-archetype] .mp-node-body{fill:var(--mp-section-fill);fill-opacity:0.16;stroke:var(--mp-section-fill)}`,
    `.mp-node[data-match="true"] .mp-node-body{stroke:var(--mp-accent-3);stroke-width:calc(var(--mp-stroke-width) * 2.5)}`,
    `.mp-node[data-selected="true"] .mp-node-body{stroke-width:calc(var(--mp-stroke-width) * 2.5);filter:var(--mp-shadow-2)}`,
    `.mp-node[data-hovered="true"] .mp-node-body{filter:var(--mp-shadow-2)}`,

    motionStyles(),
  ].join('')
}

/**
 * Motion.
 *
 * Everything here is gated on `data-motion="on"`, which the app clears for
 * `%%mp: layout motion=off`, for a viewer who asked for reduced motion, and for
 * every export — a still frame of a travelling dash is not the diagram anyone
 * meant to save.
 *
 * Entrance animations use `animation-fill-mode: backwards` so they hold the
 * opening frame through their delay and then let go: `forwards` would pin the
 * final opacity in place and permanently defeat the dim and recede rules.
 *
 * Nothing animates the `transform` of a positioned `<g>`: a CSS transform
 * overrides the presentation attribute the layout wrote, which would move the
 * node to the origin. The body shape carries the scale instead.
 */
function motionStyles(): string {
  const on = '.mp-diagram[data-motion="on"]'
  return [
    `.mp-node-body{transition:filter 160ms ease,stroke-width 120ms ease}`,

    `@keyframes mp-fade-in{from{opacity:0}}`,
    `@keyframes mp-rise-in{from{opacity:0;transform:scale(0.93)}}`,

    // Positions glide; the routes under them cross-fade, because a path cannot
    // be honestly interpolated into a different path.
    `${on} .mp-node{transition:transform 320ms cubic-bezier(0.2,0.9,0.3,1)}`,
    `${on} .mp-edges{transition:opacity 320ms ease}`,
    `${on} .mp-group{animation:mp-fade-in 260ms ease backwards}`,
    `${on} .mp-node{animation:mp-fade-in 260ms ease backwards;animation-delay:calc(var(--mp-i,0) * 14ms)}`,
    `${on} .mp-node-body{transform-box:fill-box;transform-origin:center;` +
      `animation:mp-rise-in 300ms cubic-bezier(0.2,0.9,0.3,1) backwards;animation-delay:calc(var(--mp-i,0) * 14ms)}`,
    `${on} .mp-edge{animation:mp-fade-in 300ms ease backwards;animation-delay:calc(90ms + var(--mp-i,0) * 10ms)}`,

    // The travelling highlight rides a second copy of the path, so the edge
    // underneath keeps its own dash pattern and reads correctly when still.
    `.mp-edge-flow{fill:none;stroke:var(--mp-color-flow);stroke-linecap:round;stroke-dasharray:9 91;opacity:0;pointer-events:none;` +
      `stroke-width:calc(var(--mp-stroke-width) * 1.7)}`,
    // The highlight runs in its layer's slot of the cycle and is invisible for
    // the rest, so one pulse walks the graph rather than every line shimmering
    // at once. The keyframes carry the slot width, so they are built per
    // diagram; the delay is the edge's layer.
    `${on} .mp-edge[data-flow="true"] .mp-edge-flow,${on}[data-emphasis] .mp-edge:not([data-receded]) .mp-edge-flow{` +
      `animation:var(--mp-flow-name) var(--mp-flow-cycle) linear infinite;` +
      `animation-delay:calc(var(--mp-d,0) * var(--mp-flow-step))}`,
    `${on} .mp-edge[data-dimmed="true"] .mp-edge-flow,${on} .mp-edge[data-receded="true"] .mp-edge-flow{opacity:0;animation:none}`,

    `@media (prefers-reduced-motion:reduce){.mp-diagram *{animation:none !important;transition:none !important}` +
      `.mp-edge-flow{opacity:0 !important}}`,
  ].join('')
}

/**
 * The travelling highlight's keyframes for a diagram with `slice`% per layer.
 *
 * Keyframe offsets cannot be custom properties, so the slot width has to be
 * baked in and the block built per diagram. The name carries the width, so two
 * diagrams on one page either share an identical definition or get their own.
 */
export function flowKeyframes(slice: number): { name: string; css: string } {
  const name = `mp-flow-${String(slice).replace('.', '_')}`
  const end = Math.min(slice, 99.9)
  return {
    name,
    css:
      `@keyframes ${name}{` +
      `0%{stroke-dashoffset:100;opacity:0.9}` +
      `${end}%{stroke-dashoffset:0;opacity:0.9}` +
      `${Math.min(end + 0.1, 100)}%{opacity:0}` +
      `100%{opacity:0}}`,
  }
}

/**
 * The motion rules a standalone HTML page needs, on their own.
 *
 * Export strips the diagram's stylesheet and inlines every computed value, so a
 * saved page has the overlay baked at `opacity:0`. These rules are re-attached
 * for HTML only — the one export format that can actually move — and have to
 * carry `!important` to outrank the inline styles that inlining wrote.
 */
export function exportMotionStyles(timing: { slicePercent: number; cycleSeconds: number; count: number }): string {
  const { name, css } = flowKeyframes(timing.slicePercent)
  const step = timing.cycleSeconds / timing.count
  // Every value is literal. Custom properties do not survive style inlining,
  // and a var() left in a saved file resolves against nothing.
  const delays = Array.from({ length: timing.count }, (_, layer) =>
    `[data-motion="on"] .mp-edge[data-layer="${layer}"] .mp-edge-flow{animation-delay:${(layer * step).toFixed(3)}s}`)
  return [
    css,
    `[data-motion="on"] .mp-edge[data-flow="true"] .mp-edge-flow{opacity:0.9 !important;` +
      `animation:${name} ${timing.cycleSeconds}s linear infinite}`,
    ...delays,
    // Matching the rule above selector for selector: equal specificity, later in
    // the sheet, both important — otherwise the highlight only stops moving and
    // stays parked on the line.
    `@media (prefers-reduced-motion:reduce){[data-motion="on"] .mp-edge[data-flow="true"] .mp-edge-flow{opacity:0 !important;animation:none !important}}`,
  ].join('')
}
