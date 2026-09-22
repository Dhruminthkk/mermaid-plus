import type { Theme } from '../types'
import { cleanLight } from './clean'

const MONO = '"IBM Plex Mono", "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'

/** Dark-first: phosphor on a black tube, everything monospaced. */
export const terminalDark: Theme = {
  ...cleanLight,
  id: 'terminal-dark',
  name: 'Terminal',
  mode: 'dark',
  color: {
    canvas: '#040705',
    surface: '#101a13',
    surfaceRaised: '#17231b',
    text: '#c8f5d4',
    textMuted: '#6f9c7d',
    stroke: '#2b4634',
    edge: '#4f8f66',
    edgeMuted: '#2b4634',
    accent: ['#4ade80', '#22d3ee', '#facc15', '#fb923c', '#f87171', '#a78bfa'],
    archetype: {
      default:  { fill: '#101a13', stroke: '#2f5b3d', text: '#c8f5d4' },
      process:  { fill: '#101a13', stroke: '#2f5b3d', text: '#c8f5d4' },
      service:  { fill: '#0d1a16', stroke: '#3fae74', text: '#8ff2b6' },
      database: { fill: '#08191c', stroke: '#2f9aae', text: '#9ae8f5' },
      queue:    { fill: '#1c1706', stroke: '#b08c14', text: '#f4e08a' },
      storage:  { fill: '#160f22', stroke: '#7c5cc4', text: '#d5c6f5' },
      user:     { fill: '#1f0f0f', stroke: '#b45252', text: '#f5bcbc' },
      external: { fill: '#0a110c', stroke: '#3f5c48', text: '#7fae8d' },
      decision: { fill: '#1c1706', stroke: '#c9a327', text: '#f7e79f' },
      note:     { fill: '#131208', stroke: '#8d7f22', text: '#e6dc9c' },
    },
  },
  type: { family: MONO, familyMono: MONO, scale: [10, 12, 14, 17], weightLabel: 400, weightTitle: 600 },
  geometry: { ...cleanLight.geometry, radius: 1, strokeWidth: 1, nodePaddingX: 14, nodePaddingY: 9, rankSpacing: 52, nodeSpacing: 26 },
  depth: { elevation: ['none', 'none', 'none'] },
  edge: { routing: 'orthogonal', arrowhead: 'open', cornerRadius: 0 },
}

export const terminalLight: Theme = {
  ...terminalDark,
  id: 'terminal-light',
  mode: 'light',
  color: {
    canvas: '#e6e9e3',
    surface: '#f4f6f1',
    surfaceRaised: '#ffffff',
    text: '#12261a',
    textMuted: '#4c6b57',
    stroke: '#9db3a5',
    edge: '#33604a',
    edgeMuted: '#9db3a5',
    accent: ['#166534', '#0e7490', '#a16207', '#c2410c', '#b91c1c', '#6d28d9'],
    archetype: {
      default:  { fill: '#f4f6f1', stroke: '#8ba593', text: '#12261a' },
      process:  { fill: '#f4f6f1', stroke: '#8ba593', text: '#12261a' },
      service:  { fill: '#dcefe2', stroke: '#3d8659', text: '#0f3d24' },
      database: { fill: '#d9edf1', stroke: '#2b7b8c', text: '#0c3640' },
      queue:    { fill: '#f4ecd3', stroke: '#9a7c1c', text: '#4a3806' },
      storage:  { fill: '#e6dff4', stroke: '#6d54ab', text: '#33246b' },
      user:     { fill: '#f4dede', stroke: '#a54a4a', text: '#5c1a1a' },
      external: { fill: '#e6e9e3', stroke: '#9db3a5', text: '#4c6b57' },
      decision: { fill: '#f4ecd3', stroke: '#9a7c1c', text: '#4a3806' },
      note:     { fill: '#f2efd8', stroke: '#8d7f22', text: '#4a4208' },
    },
  },
}
