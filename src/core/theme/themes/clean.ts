import type { Theme } from '../types'

const FONT = '"Inter", "SF Pro Text", -apple-system, "Segoe UI", Roboto, sans-serif'
const MONO = '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'

export const cleanLight: Theme = {
  id: 'clean-light',
  name: 'Clean',
  mode: 'light',
  color: {
    canvas: '#f1f0ec',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    stroke: '#d4d4d8',
    edge: '#71717a',
    edgeMuted: '#a1a1aa',
    accent: ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'],
    archetype: {
      default:  { fill: '#ffffff', stroke: '#d4d4d8', text: '#1a1a1a' },
      process:  { fill: '#ffffff', stroke: '#d4d4d8', text: '#1a1a1a' },
      service:  { fill: '#eff6ff', stroke: '#93c5fd', text: '#1e3a8a' },
      database: { fill: '#ecfdf5', stroke: '#6ee7b7', text: '#064e3b' },
      queue:    { fill: '#fff7ed', stroke: '#fdba74', text: '#7c2d12' },
      storage:  { fill: '#f5f3ff', stroke: '#c4b5fd', text: '#4c1d95' },
      user:     { fill: '#fdf2f8', stroke: '#f9a8d4', text: '#831843' },
      external: { fill: '#f4f4f5', stroke: '#a1a1aa', text: '#3f3f46' },
      decision: { fill: '#fefce8', stroke: '#fde047', text: '#713f12' },
      note:     { fill: '#fffbeb', stroke: '#fcd34d', text: '#78350f' },
    },
  },
  type: {
    family: FONT,
    familyMono: MONO,
    scale: [11, 13, 15, 18],
    weightLabel: 500,
    weightTitle: 600,
  },
  geometry: {
    radius: 8,
    strokeWidth: 1.5,
    nodePaddingX: 16,
    nodePaddingY: 10,
    rankSpacing: 56,
    nodeSpacing: 32,
    groupPadding: 20,
  },
  depth: {
    elevation: [
      'drop-shadow(0 1px 1px rgba(15,23,42,0.05))',
      'drop-shadow(0 1px 1px rgba(15,23,42,0.05)) drop-shadow(0 3px 6px rgba(15,23,42,0.07))',
      'drop-shadow(0 2px 3px rgba(15,23,42,0.08)) drop-shadow(0 8px 18px rgba(15,23,42,0.10))',
    ],
  },
  edge: { routing: 'orthogonal', arrowhead: 'triangle', cornerRadius: 8 },
  texture: 'crisp',
}

export const cleanDark: Theme = {
  ...cleanLight,
  id: 'clean-dark',
  mode: 'dark',
  color: {
    canvas: '#0f1115',
    surface: '#181b21',
    surfaceRaised: '#1f2329',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    stroke: '#2e333d',
    edge: '#8b93a3',
    edgeMuted: '#4b5563',
    accent: ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#22d3ee'],
    archetype: {
      default:  { fill: '#181b21', stroke: '#2e333d', text: '#e5e7eb' },
      process:  { fill: '#181b21', stroke: '#2e333d', text: '#e5e7eb' },
      service:  { fill: '#172036', stroke: '#3b5ba9', text: '#bfdbfe' },
      database: { fill: '#0f2a22', stroke: '#2f8f6b', text: '#a7f3d0' },
      queue:    { fill: '#33200f', stroke: '#b4622a', text: '#fed7aa' },
      storage:  { fill: '#241a3a', stroke: '#6d4fc4', text: '#ddd6fe' },
      user:     { fill: '#3a1428', stroke: '#b8407f', text: '#fbcfe8' },
      external: { fill: '#1c1e23', stroke: '#52525b', text: '#d4d4d8' },
      decision: { fill: '#33290f', stroke: '#b7972a', text: '#fef08a' },
      note:     { fill: '#33250c', stroke: '#b78a2a', text: '#fde68a' },
    },
  },
  depth: {
    elevation: [
      'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
      'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
      'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
    ],
  },
}
