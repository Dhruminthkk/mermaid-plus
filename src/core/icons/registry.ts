import type { Archetype } from '@/core/ir'

export interface IconData {
  body: string
  width: number
  height: number
  /** Monochrome glyphs inherit the node text color; brand marks keep their own. */
  monochrome: boolean
}

interface PackJson {
  pack: string
  monochrome: boolean
  icons: Record<string, { body: string; width: number; height: number }>
}

export type PackName = 'general' | 'tech' | 'aws' | 'gcp' | 'azure' | 'k8s'

/** Packs load on first reference; a flowchart never downloads cloud logos. */
const LOADERS: Record<PackName, () => Promise<PackJson>> = {
  general: () => import('./packs/general.json').then((m) => m.default as PackJson),
  tech: () => import('./packs/tech.json').then((m) => m.default as PackJson),
  aws: () => import('./packs/aws.json').then((m) => m.default as PackJson),
  gcp: () => import('./packs/gcp.json').then((m) => m.default as PackJson),
  azure: () => import('./packs/azure.json').then((m) => m.default as PackJson),
  k8s: () => import('./packs/k8s.json').then((m) => m.default as PackJson),
}

const cache = new Map<PackName, Promise<PackJson>>()

function loadPack(name: PackName): Promise<PackJson> {
  let pending = cache.get(name)
  if (!pending) {
    pending = LOADERS[name]()
    cache.set(name, pending)
  }
  return pending
}

export function isPackName(value: string): value is PackName {
  return value in LOADERS
}

/** `aws:lambda` → { pack: 'aws', name: 'lambda' }; bare `server` → general. */
export function parseIconRef(ref: string): { pack: PackName; name: string } | null {
  const trimmed = ref.trim()
  if (!trimmed || trimmed === 'none') return null
  const colon = trimmed.indexOf(':')
  if (colon === -1) return { pack: 'general', name: trimmed }
  const pack = trimmed.slice(0, colon)
  const name = trimmed.slice(colon + 1)
  return isPackName(pack) && name ? { pack, name } : null
}

/** Default glyph per archetype; `icon=none` on a node suppresses it. */
export const ARCHETYPE_ICONS: Partial<Record<Archetype, string>> = {
  service: 'general:server',
  database: 'general:database',
  queue: 'general:list-ordered',
  storage: 'general:hard-drive',
  user: 'general:user',
  external: 'general:globe',
}

export type IconMap = Record<string, IconData>

/**
 * Resolves icon references to inline SVG bodies. Unknown references are
 * omitted (and reported) rather than failing the render.
 */
export async function resolveIcons(refs: Iterable<string>): Promise<{ icons: IconMap; missing: string[] }> {
  const icons: IconMap = {}
  const missing: string[] = []
  const wanted = Array.from(new Set(refs))

  const byPack = new Map<PackName, Array<{ ref: string; name: string }>>()
  for (const ref of wanted) {
    const parsed = parseIconRef(ref)
    if (!parsed) {
      if (ref !== 'none') missing.push(ref)
      continue
    }
    const list = byPack.get(parsed.pack) ?? []
    list.push({ ref, name: parsed.name })
    byPack.set(parsed.pack, list)
  }

  await Promise.all(
    Array.from(byPack.entries()).map(async ([pack, entries]) => {
      const json = await loadPack(pack)
      for (const { ref, name } of entries) {
        const icon = json.icons[name]
        if (icon) icons[ref] = { ...icon, monochrome: json.monochrome }
        else missing.push(ref)
      }
    }),
  )

  return { icons, missing: missing.sort() }
}
