import type { Theme } from '../types'
import { cleanLight } from './clean'

/** Saturated fills, white text, bold type — built for slides and screenshots. */
export const vividLight: Theme = {
  ...cleanLight,
  id: 'vivid-light',
  name: 'Vivid',
  mode: 'light',
  color: {
    canvas: '#eeeef1',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    text: '#111827',
    textMuted: '#4b5563',
    stroke: '#e5e7eb',
    edge: '#374151',
    edgeMuted: '#9ca3af',
    accent: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'],
    archetype: {
      default:  { fill: '#ffffff', stroke: '#dcdce1', text: '#111827' },
      process:  { fill: '#ffffff', stroke: '#dcdce1', text: '#111827' },
      service:  { fill: '#4f46e5', stroke: '#4f46e5', text: '#ffffff' },
      database: { fill: '#047857', stroke: '#047857', text: '#ffffff' },
      queue:    { fill: '#b45309', stroke: '#b45309', text: '#ffffff' },
      storage:  { fill: '#6d28d9', stroke: '#6d28d9', text: '#ffffff' },
      user:     { fill: '#be185d', stroke: '#be185d', text: '#ffffff' },
      external: { fill: '#ffffff', stroke: '#9ca3af', text: '#374151' },
      decision: { fill: '#fbbf24', stroke: '#fbbf24', text: '#111827' },
      note:     { fill: '#fef08a', stroke: '#fef08a', text: '#713f12' },
    },
  },
  type: { ...cleanLight.type, scale: [12, 14, 16, 20], weightLabel: 600, weightTitle: 800 },
  geometry: { ...cleanLight.geometry, radius: 12, strokeWidth: 2, nodePaddingX: 20, nodePaddingY: 12, rankSpacing: 64, nodeSpacing: 36, groupPadding: 24 },
  depth: {
    elevation: [
      'drop-shadow(0 1px 2px rgba(0,0,0,0.06))',
      'drop-shadow(0 1px 2px rgba(0,0,0,0.08)) drop-shadow(0 4px 10px rgba(0,0,0,0.12))',
      'drop-shadow(0 2px 4px rgba(0,0,0,0.10)) drop-shadow(0 12px 26px rgba(0,0,0,0.16))',
    ],
  },
  edge: { routing: 'orthogonal', arrowhead: 'triangle', cornerRadius: 12 },
}

export const vividDark: Theme = {
  ...vividLight,
  id: 'vivid-dark',
  mode: 'dark',
  color: {
    ...vividLight.color,
    canvas: '#09090b',
    surface: '#18181b',
    surfaceRaised: '#27272a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    stroke: '#3f3f46',
    edge: '#d4d4d8',
    edgeMuted: '#71717a',
    accent: ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#22d3ee'],
    archetype: {
      ...vividLight.color.archetype,
      default:  { fill: '#27272a', stroke: '#27272a', text: '#fafafa' },
      process:  { fill: '#27272a', stroke: '#27272a', text: '#fafafa' },
      external: { fill: '#18181b', stroke: '#71717a', text: '#d4d4d8' },
    },
  },
  depth: {
    elevation: [
      'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
      'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
      'drop-shadow(0 10px 24px rgba(0,0,0,0.6))',
    ],
  },
}
