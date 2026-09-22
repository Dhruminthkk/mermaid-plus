import type { Theme } from '../types'
import { cleanLight } from './clean'

const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif'

/** Warm editorial: ink on paper, muted earth accents, quiet rules. */
export const paperLight: Theme = {
  ...cleanLight,
  id: 'paper-light',
  name: 'Paper',
  mode: 'light',
  color: {
    canvas: '#efe9dd',
    surface: '#fbf7ef',
    surfaceRaised: '#fffdf8',
    text: '#2a2521',
    textMuted: '#6b6157',
    stroke: '#c9bfae',
    edge: '#7a6f62',
    edgeMuted: '#b3a897',
    accent: ['#8c5a2b', '#4f6b52', '#7a4a5c', '#3f5c78', '#8a6d1f', '#5c5346'],
    archetype: {
      default:  { fill: '#fbf7ef', stroke: '#c9bfae', text: '#2a2521' },
      process:  { fill: '#fbf7ef', stroke: '#c9bfae', text: '#2a2521' },
      service:  { fill: '#e5ecf2', stroke: '#7d99b3', text: '#274058' },
      database: { fill: '#e2ece3', stroke: '#7d9a80', text: '#28402b' },
      queue:    { fill: '#f6e7d4', stroke: '#c39a63', text: '#5e3d17' },
      storage:  { fill: '#ece5f0', stroke: '#a48cb5', text: '#432f52' },
      user:     { fill: '#f4e2e5', stroke: '#bd8f97', text: '#5a2c36' },
      external: { fill: '#efe9dd', stroke: '#b3a897', text: '#5b5248' },
      decision: { fill: '#f7efd2', stroke: '#c4ab5c', text: '#584711' },
      note:     { fill: '#fbf2d9', stroke: '#cfb877', text: '#5c4a14' },
    },
  },
  type: { ...cleanLight.type, family: SERIF, scale: [11, 14, 16, 20], weightLabel: 500, weightTitle: 600 },
  geometry: { ...cleanLight.geometry, radius: 3, strokeWidth: 1.25, rankSpacing: 60, nodeSpacing: 34 },
  depth: { elevation: ['none', 'drop-shadow(0 1px 1px rgba(60,45,25,0.10))', 'drop-shadow(0 3px 8px rgba(60,45,25,0.16))'] },
  edge: { routing: 'orthogonal', arrowhead: 'triangle', cornerRadius: 3 },
}

export const paperDark: Theme = {
  ...paperLight,
  id: 'paper-dark',
  mode: 'dark',
  color: {
    canvas: '#191612',
    surface: '#221e19',
    surfaceRaised: '#2b2620',
    text: '#ece4d6',
    textMuted: '#a1958280',
    stroke: '#3e372e',
    edge: '#9c8f7c',
    edgeMuted: '#5d5449',
    accent: ['#d8a05e', '#8fbb93', '#c98fa4', '#86a8c8', '#d3b45c', '#a99a86'],
    archetype: {
      default:  { fill: '#221e19', stroke: '#3e372e', text: '#ece4d6' },
      process:  { fill: '#221e19', stroke: '#3e372e', text: '#ece4d6' },
      service:  { fill: '#1b2733', stroke: '#4a6a88', text: '#cfe0ee' },
      database: { fill: '#1a2a1d', stroke: '#4f7a55', text: '#cde5d1' },
      queue:    { fill: '#33240f', stroke: '#a2762f', text: '#f2ddbd' },
      storage:  { fill: '#282035', stroke: '#6d5a86', text: '#ded3ea' },
      user:     { fill: '#331d23', stroke: '#8d5a67', text: '#f0d3d9' },
      external: { fill: '#1d1a16', stroke: '#4b433a', text: '#a99c89' },
      decision: { fill: '#332a10', stroke: '#9b8330', text: '#f0e0ab' },
      note:     { fill: '#302713', stroke: '#8f7a2f', text: '#eddfae' },
    },
  },
  depth: { elevation: ['none', 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))', 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))'] },
}
