import type { Theme } from '../types'
import { cleanLight } from './clean'

/** Cool and calm: teal water, indigo depth, soft rounded forms. */
export const oceanLight: Theme = {
  ...cleanLight,
  id: 'ocean-light',
  name: 'Ocean',
  mode: 'light',
  color: {
    canvas: '#e4edf0',
    surface: '#f7fbfc',
    surfaceRaised: '#ffffff',
    text: '#0d2b33',
    textMuted: '#4c717c',
    stroke: '#a8c4cc',
    edge: '#2f6b7a',
    edgeMuted: '#a8c4cc',
    accent: ['#0e7490', '#4338ca', '#0f766e', '#b45309', '#be123c', '#7c3aed'],
    archetype: {
      default:  { fill: '#f7fbfc', stroke: '#a8c4cc', text: '#0d2b33' },
      process:  { fill: '#f7fbfc', stroke: '#a8c4cc', text: '#0d2b33' },
      service:  { fill: '#d8eef3', stroke: '#3c95ac', text: '#0a3a47' },
      database: { fill: '#d5efe9', stroke: '#2f9182', text: '#0a3a33' },
      queue:    { fill: '#f6e7d6', stroke: '#c08a3e', text: '#5c3708' },
      storage:  { fill: '#e0e2f5', stroke: '#6068c4', text: '#232a72' },
      user:     { fill: '#f4dde6', stroke: '#c06188', text: '#5c1233' },
      external: { fill: '#e4edf0', stroke: '#9db6bd', text: '#42636d' },
      decision: { fill: '#f6efd3', stroke: '#b39a3a', text: '#4e410a' },
      note:     { fill: '#f7f2da', stroke: '#bda94b', text: '#4f430c' },
    },
  },
  geometry: { ...cleanLight.geometry, radius: 14, strokeWidth: 1.5, nodePaddingX: 18, rankSpacing: 60, nodeSpacing: 34 },
  depth: {
    elevation: [
      'drop-shadow(0 1px 1px rgba(13,43,51,0.06))',
      'drop-shadow(0 1px 2px rgba(13,43,51,0.07)) drop-shadow(0 4px 10px rgba(13,43,51,0.09))',
      'drop-shadow(0 3px 6px rgba(13,43,51,0.10)) drop-shadow(0 10px 22px rgba(13,43,51,0.14))',
    ],
  },
  edge: { routing: 'curved', arrowhead: 'triangle', cornerRadius: 14 },
}

export const oceanDark: Theme = {
  ...oceanLight,
  id: 'ocean-dark',
  mode: 'dark',
  color: {
    canvas: '#07161c',
    surface: '#0d2029',
    surfaceRaised: '#132a35',
    text: '#d8eef5',
    textMuted: '#7ea6b3',
    stroke: '#22434f',
    edge: '#5f9db0',
    edgeMuted: '#2b4d5a',
    accent: ['#38bdf8', '#818cf8', '#2dd4bf', '#fbbf24', '#fb7185', '#c084fc'],
    archetype: {
      default:  { fill: '#0d2029', stroke: '#2b4d5a', text: '#d8eef5' },
      process:  { fill: '#0d2029', stroke: '#2b4d5a', text: '#d8eef5' },
      service:  { fill: '#07303d', stroke: '#3d94b0', text: '#b3e2f2' },
      database: { fill: '#062f2a', stroke: '#2f9182', text: '#a7e8dc' },
      queue:    { fill: '#33220c', stroke: '#b0812c', text: '#f3dcae' },
      storage:  { fill: '#1c1e45', stroke: '#5c63c4', text: '#ccd0f7' },
      user:     { fill: '#3a1226', stroke: '#b0517d', text: '#f6c9dd' },
      external: { fill: '#0a1a20', stroke: '#2b4d5a', text: '#7ea6b3' },
      decision: { fill: '#33290c', stroke: '#b39a3a', text: '#f2e5ac' },
      note:     { fill: '#2e2a0d', stroke: '#a6942f', text: '#eee0a6' },
    },
  },
  depth: {
    elevation: [
      'drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
      'drop-shadow(0 1px 2px rgba(0,0,0,0.45)) drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
      'drop-shadow(0 3px 6px rgba(0,0,0,0.5)) drop-shadow(0 10px 22px rgba(0,0,0,0.6))',
    ],
  },
}
