/**
 * Chrome iconography: 16px, 1.5px strokes on a 16-unit grid, drawn to sit on
 * the same optical weight as the interface type. Deliberately geometric — this
 * is an instrument, not a toy.
 */
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export type IconProps = { className?: string }

export const IconSearch = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><circle cx="7" cy="7" r="4.25" /><path d="M10.2 10.2 14 14" /></svg>
)
export const IconPalette = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="M8 1.75a6.25 6.25 0 1 0 0 12.5c.9 0 1.4-.6 1.4-1.3 0-.9-.8-1.2-.8-2 0-.6.5-1.1 1.1-1.1h1.2a3.35 3.35 0 0 0 3.35-3.35C14.25 3.9 11.4 1.75 8 1.75Z" /><circle cx="5.2" cy="6.4" r=".9" fill="currentColor" stroke="none" /><circle cx="8" cy="4.7" r=".9" fill="currentColor" stroke="none" /></svg>
)
export const IconDownload = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="M8 1.75v8" /><path d="m4.75 6.75 3.25 3 3.25-3" /><path d="M2.25 11.5v1.25a1.5 1.5 0 0 0 1.5 1.5h8.5a1.5 1.5 0 0 0 1.5-1.5V11.5" /></svg>
)
export const IconSun = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><circle cx="8" cy="8" r="3.1" /><path d="M8 1.4v1.5M8 13.1v1.5M2.4 8H.9M15.1 8h-1.5M4.05 4.05 3 3M13 13l-1.05-1.05M4.05 11.95 3 13M13 3l-1.05 1.05" /></svg>
)
export const IconMoon = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="M13.6 9.7A5.9 5.9 0 0 1 6.3 2.4a5.9 5.9 0 1 0 7.3 7.3z" /></svg>
)
export const IconMotion = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="M1.25 8h2.5l1.75-4.25 2.5 9L9.75 8h5" /></svg>
)
export const IconLibrary = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><rect x="2.25" y="2.75" width="3" height="10.5" rx="1" /><rect x="6.75" y="2.75" width="3" height="10.5" rx="1" /><path d="m11.4 3.6 2.1.6a1 1 0 0 1 .7 1.2l-2.1 7.4a1 1 0 0 1-1.2.7l-.4-.1" /></svg>
)
export const IconGrid = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><rect x="2.25" y="2.25" width="4.75" height="4.75" rx="1" /><rect x="9" y="2.25" width="4.75" height="4.75" rx="1" /><rect x="2.25" y="9" width="4.75" height="4.75" rx="1" /><rect x="9" y="9" width="4.75" height="4.75" rx="1" /></svg>
)
export const IconCode = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="m5.5 5-3.25 3L5.5 11" /><path d="m10.5 5 3.25 3L10.5 11" /></svg>
)
export const IconSliders = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="M2.25 5h11.5M2.25 11h11.5" /><circle cx="6" cy="5" r="1.6" /><circle cx="10.5" cy="11" r="1.6" /></svg>
)
export const IconWarn = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="M8 2.75 14.25 13H1.75L8 2.75Z" /><path d="M8 6.75v2.75" /><circle cx="8" cy="11.4" r=".7" fill="currentColor" stroke="none" /></svg>
)
export const IconEnter = (p: IconProps) => (
  <svg {...base} {...p} aria-hidden="true"><path d="M13.25 3v4.25a2 2 0 0 1-2 2H3.5" /><path d="m6 6.75-2.5 2.5L6 11.75" /></svg>
)

/** The brand mark: three nodes and a link, drawn as a diagram would draw them. */
export const Mark = (p: IconProps) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" {...p}>
    <rect x="1" y="6" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="1.25" width="5.75" height="5.75" rx="1.6" fill="currentColor" />
    <rect x="11" y="11" width="5.75" height="5.75" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 8.6h2.2a1 1 0 0 0 1-1V5.4M7 9.4h2.2a1 1 0 0 1 1 1v2.2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
