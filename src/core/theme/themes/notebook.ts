import type { Theme } from '../types'
import { cleanLight } from './clean'

const HAND = '"Virgil", "Segoe Print", "Bradley Hand", "Comic Sans MS", "Chalkboard SE", cursive'

/** Sketch texture — Excalidraw-style rough strokes for early-stage diagrams. */
export const notebookLight: Theme = {
  ...cleanLight,
  id: 'notebook-light',
  name: 'Notebook',
  mode: 'light',
  color: {
    canvas: '#f7f2e4',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    text: '#1f1f1f',
    textMuted: '#6b6b6b',
    stroke: '#1f1f1f',
    edge: '#1f1f1f',
    edgeMuted: '#8a8a8a',
    accent: ['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#9c36b5', '#0c8599'],
    archetype: {
      default:  { fill: '#ffffff', stroke: '#1f1f1f', text: '#1f1f1f' },
      process:  { fill: '#ffffff', stroke: '#1f1f1f', text: '#1f1f1f' },
      service:  { fill: '#a5d8ff', stroke: '#1971c2', text: '#1f1f1f' },
      database: { fill: '#b2f2bb', stroke: '#2f9e44', text: '#1f1f1f' },
      queue:    { fill: '#ffd8a8', stroke: '#f08c00', text: '#1f1f1f' },
      storage:  { fill: '#d0bfff', stroke: '#7048e8', text: '#1f1f1f' },
      user:     { fill: '#ffc9c9', stroke: '#e03131', text: '#1f1f1f' },
      external: { fill: '#f1f3f5', stroke: '#868e96', text: '#1f1f1f' },
      decision: { fill: '#fff3bf', stroke: '#f08c00', text: '#1f1f1f' },
      note:     { fill: '#ffec99', stroke: '#e67700', text: '#1f1f1f' },
    },
  },
  type: { ...cleanLight.type, family: HAND, scale: [12, 14, 16, 20], weightLabel: 400, weightTitle: 700 },
  geometry: { ...cleanLight.geometry, radius: 6, strokeWidth: 1.5, nodePaddingX: 18, nodePaddingY: 12, rankSpacing: 64, nodeSpacing: 36 },
  depth: { elevation: ['none', 'none', 'none'] },
  edge: { routing: 'orthogonal', arrowhead: 'open', cornerRadius: 10 },
  texture: 'sketch',
}

export const notebookDark: Theme = {
  ...notebookLight,
  id: 'notebook-dark',
  mode: 'dark',
  color: {
    canvas: '#121212',
    surface: '#1e1e1e',
    surfaceRaised: '#262626',
    text: '#f0f0f0',
    textMuted: '#a0a0a0',
    stroke: '#e6e6e6',
    edge: '#e6e6e6',
    edgeMuted: '#7a7a7a',
    accent: ['#ff8787', '#74c0fc', '#8ce99a', '#ffc078', '#da77f2', '#66d9e8'],
    archetype: {
      default:  { fill: '#1e1e1e', stroke: '#e6e6e6', text: '#f0f0f0' },
      process:  { fill: '#1e1e1e', stroke: '#e6e6e6', text: '#f0f0f0' },
      service:  { fill: '#1c3a5e', stroke: '#74c0fc', text: '#f0f0f0' },
      database: { fill: '#1f4d2a', stroke: '#8ce99a', text: '#f0f0f0' },
      queue:    { fill: '#5a3a12', stroke: '#ffc078', text: '#f0f0f0' },
      storage:  { fill: '#3b2a6e', stroke: '#b197fc', text: '#f0f0f0' },
      user:     { fill: '#5c1f1f', stroke: '#ff8787', text: '#f0f0f0' },
      external: { fill: '#262626', stroke: '#8a8a8a', text: '#d0d0d0' },
      decision: { fill: '#5a4a12', stroke: '#ffd43b', text: '#f0f0f0' },
      note:     { fill: '#5a4a12', stroke: '#ffd43b', text: '#f0f0f0' },
    },
  },
}
