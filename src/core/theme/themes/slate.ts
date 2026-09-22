import type { Theme } from '../types'
import { cleanLight } from './clean'

/** Dense, cool-neutral, high contrast. The "architecture doc" look. */
export const slateLight: Theme = {
  ...cleanLight,
  id: 'slate-light',
  name: 'Slate',
  mode: 'light',
  color: {
    canvas: '#e8edf3',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    text: '#0f172a',
    textMuted: '#475569',
    stroke: '#94a3b8',
    edge: '#334155',
    edgeMuted: '#94a3b8',
    accent: ['#0f172a', '#1e40af', '#0f766e', '#9a3412', '#7f1d1d', '#155e75'],
    flow: '#1e40af',
    archetype: {
      default:  { fill: '#ffffff', stroke: '#64748b', text: '#0f172a' },
      process:  { fill: '#ffffff', stroke: '#64748b', text: '#0f172a' },
      service:  { fill: '#e2e8f0', stroke: '#334155', text: '#0f172a' },
      database: { fill: '#ccfbf1', stroke: '#0f766e', text: '#134e4a' },
      queue:    { fill: '#ffedd5', stroke: '#9a3412', text: '#7c2d12' },
      storage:  { fill: '#e0e7ff', stroke: '#3730a3', text: '#312e81' },
      user:     { fill: '#0f172a', stroke: '#0f172a', text: '#f8fafc' },
      external: { fill: '#f8fafc', stroke: '#94a3b8', text: '#475569' },
      decision: { fill: '#fef3c7', stroke: '#b45309', text: '#78350f' },
      note:     { fill: '#fefce8', stroke: '#a16207', text: '#713f12' },
    },
  },
  geometry: { ...cleanLight.geometry, radius: 4, strokeWidth: 1.25, rankSpacing: 48, nodeSpacing: 24, groupPadding: 18 },
  depth: {
    elevation: [
      'drop-shadow(0 1px 1px rgba(15,23,42,0.04))',
      'drop-shadow(0 1px 2px rgba(15,23,42,0.06)) drop-shadow(0 3px 7px rgba(15,23,42,0.07))',
      'drop-shadow(0 2px 4px rgba(15,23,42,0.09)) drop-shadow(0 9px 20px rgba(15,23,42,0.13))',
    ],
  },
  edge: { routing: 'orthogonal', arrowhead: 'triangle', cornerRadius: 4 },
}

export const slateDark: Theme = {
  ...slateLight,
  id: 'slate-dark',
  mode: 'dark',
  color: {
    canvas: '#0b1220',
    surface: '#111a2e',
    surfaceRaised: '#172239',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    stroke: '#334155',
    edge: '#94a3b8',
    edgeMuted: '#475569',
    accent: ['#93c5fd', '#a5b4fc', '#5eead4', '#fdba74', '#fca5a5', '#67e8f9'],
    archetype: {
      default:  { fill: '#111a2e', stroke: '#475569', text: '#e2e8f0' },
      process:  { fill: '#111a2e', stroke: '#475569', text: '#e2e8f0' },
      service:  { fill: '#1e293b', stroke: '#94a3b8', text: '#f1f5f9' },
      database: { fill: '#042f2e', stroke: '#2dd4bf', text: '#ccfbf1' },
      queue:    { fill: '#431407', stroke: '#fb923c', text: '#ffedd5' },
      storage:  { fill: '#1e1b4b', stroke: '#818cf8', text: '#e0e7ff' },
      user:     { fill: '#e2e8f0', stroke: '#e2e8f0', text: '#0f172a' },
      external: { fill: '#0b1220', stroke: '#475569', text: '#94a3b8' },
      decision: { fill: '#451a03', stroke: '#f59e0b', text: '#fef3c7' },
      note:     { fill: '#422006', stroke: '#eab308', text: '#fef9c3' },
    },
  },
  depth: {
    elevation: [
      'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
      'drop-shadow(0 1px 2px rgba(0,0,0,0.4)) drop-shadow(0 3px 7px rgba(0,0,0,0.3))',
      'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 9px 20px rgba(0,0,0,0.45))',
    ],
  },
}
