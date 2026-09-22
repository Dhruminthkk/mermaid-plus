import type { Theme } from '../types'
import { cleanLight } from './clean'

/** WCAG AA: every text-on-fill pair ≥ 4.5:1 (asserted in theme.test.ts). */
export const contrastLight: Theme = {
  ...cleanLight,
  id: 'contrast-light',
  name: 'Contrast',
  mode: 'light',
  color: {
    canvas: '#ffffff',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    text: '#000000',
    textMuted: '#3d3d3d',
    stroke: '#000000',
    edge: '#000000',
    edgeMuted: '#555555',
    accent: ['#0000cc', '#8b008b', '#006400', '#8b4500', '#b30000', '#005f73'],
    archetype: {
      default:  { fill: '#ffffff', stroke: '#000000', text: '#000000' },
      process:  { fill: '#ffffff', stroke: '#000000', text: '#000000' },
      service:  { fill: '#dbe4ff', stroke: '#0000cc', text: '#000066' },
      database: { fill: '#d3f9d8', stroke: '#006400', text: '#003300' },
      queue:    { fill: '#ffe8cc', stroke: '#8b4500', text: '#4d2600' },
      storage:  { fill: '#e5dbff', stroke: '#5f3dc4', text: '#2b1a66' },
      user:     { fill: '#000000', stroke: '#000000', text: '#ffffff' },
      external: { fill: '#f1f3f5', stroke: '#000000', text: '#000000' },
      decision: { fill: '#fff3bf', stroke: '#8b4500', text: '#4d2600' },
      note:     { fill: '#fff9db', stroke: '#8b4500', text: '#4d2600' },
    },
  },
  type: { ...cleanLight.type, scale: [12, 14, 16, 20], weightLabel: 600, weightTitle: 700 },
  geometry: { ...cleanLight.geometry, radius: 4, strokeWidth: 2 },
  depth: { elevation: ['none', 'none', 'none'] },
  edge: { routing: 'orthogonal', arrowhead: 'triangle', cornerRadius: 4 },
}

export const contrastDark: Theme = {
  ...contrastLight,
  id: 'contrast-dark',
  mode: 'dark',
  color: {
    canvas: '#000000',
    surface: '#000000',
    surfaceRaised: '#111111',
    text: '#ffffff',
    textMuted: '#d0d0d0',
    stroke: '#ffffff',
    edge: '#ffffff',
    edgeMuted: '#aaaaaa',
    accent: ['#8ab4ff', '#ff9ef0', '#7ee787', '#ffc46b', '#ff8080', '#67e8f9'],
    archetype: {
      default:  { fill: '#000000', stroke: '#ffffff', text: '#ffffff' },
      process:  { fill: '#000000', stroke: '#ffffff', text: '#ffffff' },
      service:  { fill: '#0b1f5c', stroke: '#8ab4ff', text: '#ffffff' },
      database: { fill: '#0a3d1a', stroke: '#7ee787', text: '#ffffff' },
      queue:    { fill: '#4d2600', stroke: '#ffc46b', text: '#ffffff' },
      storage:  { fill: '#2b1a66', stroke: '#c4b5fd', text: '#ffffff' },
      user:     { fill: '#ffffff', stroke: '#ffffff', text: '#000000' },
      external: { fill: '#111111', stroke: '#ffffff', text: '#ffffff' },
      decision: { fill: '#4d3800', stroke: '#ffd43b', text: '#ffffff' },
      note:     { fill: '#4d3800', stroke: '#ffd43b', text: '#ffffff' },
    },
  },
}
