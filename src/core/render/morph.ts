import { useLayoutEffect, useRef } from 'react'
import type { LaidOutDiagram } from '@/core/layout'

export const MORPH_MS = 320

/**
 * Glides nodes from where they were to where the new layout puts them.
 *
 * An edit re-lays the whole graph, and without this the picture is simply
 * replaced — you lose your place and cannot see what your change did to the
 * shape of the system.
 *
 * The `transform` attribute stays the source of truth throughout: a CSS
 * transform *replaces* the attribute rather than composing with it, so the
 * animation sets the whole absolute position and then removes the property
 * again, handing placement back to the attribute. Exports, which read the
 * attribute, are untouched — and are frozen anyway.
 *
 * Edges are not morphed. Their geometry is a path, not a position, and
 * interpolating one route into another is not a thing that can be done
 * honestly; they cross-fade over the same beat instead.
 */
export function useLayoutMorph(
  ref: React.RefObject<SVGSVGElement | null>,
  layout: LaidOutDiagram,
  enabled: boolean,
): void {
  const previous = useRef<Map<string, { x: number; y: number }> | null>(null)

  useLayoutEffect(() => {
    const positions = new Map(layout.nodes.map((n) => [n.id, { x: n.x, y: n.y }]))
    const before = previous.current
    previous.current = positions

    const svg = ref.current
    if (!enabled || !svg || !before) return

    const moved: SVGGElement[] = []
    for (const [id, to] of positions) {
      const from = before.get(id)
      if (!from || (from.x === to.x && from.y === to.y)) continue
      const element = svg.querySelector<SVGGElement>(`.mp-node[data-node-id="${CSS.escape(id)}"]`)
      if (!element) continue
      element.style.transition = 'none'
      element.style.transform = `translate(${from.x}px, ${from.y}px)`
      moved.push(element)
    }
    if (moved.length === 0) return

    const edges = svg.querySelector<SVGGElement>('.mp-edges')
    if (edges) {
      edges.style.transition = 'none'
      edges.style.opacity = '0'
    }

    const frame = requestAnimationFrame(() => {
      for (const element of moved) {
        element.style.transition = ''
        element.style.transform = ''
      }
      if (edges) {
        edges.style.transition = ''
        edges.style.opacity = ''
      }
    })

    return () => {
      cancelAnimationFrame(frame)
      for (const element of moved) {
        element.style.transition = ''
        element.style.transform = ''
      }
      if (edges) {
        edges.style.transition = ''
        edges.style.opacity = ''
      }
    }
  }, [enabled, layout, ref])
}
