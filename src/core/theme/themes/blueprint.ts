import type { Theme } from '../types'
import { cleanLight } from './clean'

const MONO = '"IBM Plex Mono", "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'

/** Technical drawing: monochrome blue, mono type, hairline strokes, no depth. */
export const blueprintLight: Theme = {
  ...cleanLight,
  id: 'blueprint-light',
  name: 'Blueprint',
  mode: 'light',
  color: {
    canvas: '#e9f0fa',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    text: '#0b2a5b',
    textMuted: '#3b5a8c',
    stroke: '#1d4ed8',
    edge: '#1d4ed8',
    edgeMuted: '#93b4f5',
    accent: ['#1d4ed8', '#1d4ed8', '#1d4ed8', '#1d4ed8', '#1d4ed8', '#1d4ed8'],
    archetype: {
      default:  { fill: '#ffffff', stroke: '#1d4ed8', text: '#0b2a5b' },
      process:  { fill: '#ffffff', stroke: '#1d4ed8', text: '#0b2a5b' },
      service:  { fill: '#e8f0fe', stroke: '#1d4ed8', text: '#0b2a5b' },
      database: { fill: '#ffffff', stroke: '#1d4ed8', text: '#0b2a5b' },
      queue:    { fill: '#ffffff', stroke: '#1d4ed8', text: '#0b2a5b' },
      storage:  { fill: '#ffffff', stroke: '#1d4ed8', text: '#0b2a5b' },
      user:     { fill: '#1d4ed8', stroke: '#1d4ed8', text: '#ffffff' },
      external: { fill: '#f4f8fd', stroke: '#1d4ed8', text: '#3b5a8c' },
      decision: { fill: '#ffffff', stroke: '#1d4ed8', text: '#0b2a5b' },
      note:     { fill: '#f4f8fd', stroke: '#1d4ed8', text: '#3b5a8c' },
    },
  },
  type: { ...cleanLight.type, family: MONO, familyMono: MONO, scale: [10, 12, 14, 17], weightLabel: 500, weightTitle: 700 },
  geometry: { ...cleanLight.geometry, radius: 0, strokeWidth: 1, nodePaddingX: 14, nodePaddingY: 9, rankSpacing: 64, nodeSpacing: 36 },
  depth: { elevation: ['none', 'none', 'none'] },
  edge: { routing: 'orthogonal', arrowhead: 'open', cornerRadius: 0 },
}

export const blueprintDark: Theme = {
  ...blueprintLight,
  id: 'blueprint-dark',
  mode: 'dark',
  color: {
    canvas: '#0a1e3f',
    surface: '#0f2a56',
    surfaceRaised: '#143566',
    text: '#e8f0fe',
    textMuted: '#9db8e8',
    stroke: '#ffffff',
    edge: '#ffffff',
    edgeMuted: '#7b9ed1',
    accent: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
    archetype: {
      default:  { fill: '#12315f', stroke: '#ffffff', text: '#e8f0fe' },
      process:  { fill: '#12315f', stroke: '#ffffff', text: '#e8f0fe' },
      service:  { fill: '#143566', stroke: '#ffffff', text: '#ffffff' },
      database: { fill: '#12315f', stroke: '#ffffff', text: '#e8f0fe' },
      queue:    { fill: '#12315f', stroke: '#ffffff', text: '#e8f0fe' },
      storage:  { fill: '#12315f', stroke: '#ffffff', text: '#e8f0fe' },
      user:     { fill: '#ffffff', stroke: '#ffffff', text: '#0a1e3f' },
      external: { fill: '#12315f', stroke: '#9db8e8', text: '#9db8e8' },
      decision: { fill: '#12315f', stroke: '#ffffff', text: '#e8f0fe' },
      note:     { fill: '#0f2a56', stroke: '#9db8e8', text: '#e8f0fe' },
    },
  },
}
