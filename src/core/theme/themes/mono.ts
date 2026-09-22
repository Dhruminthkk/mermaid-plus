import type { Theme } from '../types'
import { cleanLight } from './clean'

/**
 * Greyscale only. Shape and weight carry the meaning colour usually does, which
 * is what a diagram needs when it is going into a book, a paper, or a photocopier.
 */
export const monoLight: Theme = {
  ...cleanLight,
  id: 'mono-light',
  name: 'Mono',
  mode: 'light',
  color: {
    canvas: '#eeeeee',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    text: '#141414',
    textMuted: '#5c5c5c',
    stroke: '#9a9a9a',
    edge: '#3d3d3d',
    edgeMuted: '#9a9a9a',
    accent: ['#141414', '#3d3d3d', '#5c5c5c', '#7a7a7a', '#2a2a2a', '#6b6b6b'],
    archetype: {
      default:  { fill: '#ffffff', stroke: '#8a8a8a', text: '#141414' },
      process:  { fill: '#ffffff', stroke: '#8a8a8a', text: '#141414' },
      service:  { fill: '#e4e4e4', stroke: '#4a4a4a', text: '#141414' },
      database: { fill: '#f4f4f4', stroke: '#2d2d2d', text: '#141414' },
      queue:    { fill: '#dcdcdc', stroke: '#3d3d3d', text: '#141414' },
      storage:  { fill: '#ececec', stroke: '#5c5c5c', text: '#141414' },
      user:     { fill: '#2a2a2a', stroke: '#141414', text: '#f6f6f6' },
      external: { fill: '#eeeeee', stroke: '#7a7a7a', text: '#3d3d3d' },
      decision: { fill: '#ffffff', stroke: '#2d2d2d', text: '#141414' },
      note:     { fill: '#f0f0f0', stroke: '#6b6b6b', text: '#2a2a2a' },
    },
  },
  geometry: { ...cleanLight.geometry, radius: 2, strokeWidth: 1.5 },
  depth: { elevation: ['none', 'none', 'none'] },
  edge: { routing: 'orthogonal', arrowhead: 'triangle', cornerRadius: 2 },
}

export const monoDark: Theme = {
  ...monoLight,
  id: 'mono-dark',
  mode: 'dark',
  color: {
    canvas: '#121212',
    surface: '#1c1c1c',
    surfaceRaised: '#242424',
    text: '#ededed',
    textMuted: '#a3a3a3',
    stroke: '#5a5a5a',
    edge: '#c4c4c4',
    edgeMuted: '#5a5a5a',
    accent: ['#ededed', '#c4c4c4', '#a3a3a3', '#8a8a8a', '#d6d6d6', '#949494'],
    archetype: {
      default:  { fill: '#1c1c1c', stroke: '#6e6e6e', text: '#ededed' },
      process:  { fill: '#1c1c1c', stroke: '#6e6e6e', text: '#ededed' },
      service:  { fill: '#2e2e2e', stroke: '#b0b0b0', text: '#f4f4f4' },
      database: { fill: '#212121', stroke: '#d6d6d6', text: '#f4f4f4' },
      queue:    { fill: '#333333', stroke: '#c4c4c4', text: '#f4f4f4' },
      storage:  { fill: '#282828', stroke: '#9c9c9c', text: '#ededed' },
      user:     { fill: '#e4e4e4', stroke: '#ffffff', text: '#141414' },
      external: { fill: '#161616', stroke: '#5a5a5a', text: '#a3a3a3' },
      decision: { fill: '#1c1c1c', stroke: '#d6d6d6', text: '#ededed' },
      note:     { fill: '#242424', stroke: '#8a8a8a', text: '#dcdcdc' },
    },
  },
}
