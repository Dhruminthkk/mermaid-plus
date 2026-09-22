import type { IRGroup } from '@/core/ir'
import type { LaidOutGroup } from '@/core/layout'
import { measureGroupTitle, GROUP_TITLE_LOD_SCALE } from '@/core/layout'
import type { Theme } from '@/core/theme'
import { roundedRectPath, sketchSeed } from './sketch'
import { Sketch } from './SketchPath'

interface Props {
  group: IRGroup
  box: LaidOutGroup
  theme: Theme
  /** Position in the sorted group list; selects the accent color. */
  index: number
  dimmed?: boolean
  onToggle?: (groupId: string) => void
}

export function Group({ group, box, theme, index, dimmed = false, onToggle }: Props) {
  const accent = `var(--mp-accent-${index % theme.color.accent.length})`
  const pad = theme.geometry.groupPadding
  const sketch = theme.texture === 'sketch'
  return (
    <g className="mp-group" data-group-id={group.id} data-dimmed={dimmed ? 'true' : undefined}>
      {sketch ? (
        <g transform={`translate(${box.x} ${box.y})`}>
          <Sketch
            className="mp-group-sketch-fill"
            d={roundedRectPath(box.width, box.height, theme.geometry.radius * 1.5)}
            seed={sketchSeed(`group:${group.id}`)}
            fill={accent}
            stroke="none"
            strokeWidth={theme.geometry.strokeWidth}
            roughness={1.2}
          />
          <Sketch
            className="mp-group-body-sketch"
            d={roundedRectPath(box.width, box.height, theme.geometry.radius * 1.5)}
            seed={sketchSeed(`group-outline:${group.id}`)}
            stroke={accent}
            strokeWidth={theme.geometry.strokeWidth}
            roughness={1.2}
            singleStroke
          />
        </g>
      ) : (
        <rect
          className="mp-group-body"
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          rx={theme.geometry.radius * 1.5}
          style={{ fill: accent, fillOpacity: 0.06, stroke: accent, strokeOpacity: 0.35 }}
        />
      )}
      {group.label && (() => {
        // A tinted chip behind the title separates it from whatever the layout
        // placed nearby, and gives the group its accent without a heavy border.
        const text = `${onToggle ? '\u25be ' : ''}${group.label}`
        const width = Math.ceil(measureGroupTitle(text, theme)) + 16
        const height = Math.ceil(theme.type.scale[1] * 1.5)
        // Low detail paints the title much larger so it survives being zoomed
        // out; the chip has to grow with it or the name spills off the tint.
        const lodWidth = Math.ceil(measureGroupTitle(text, theme, GROUP_TITLE_LOD_SCALE)) + 16
        const lodHeight = Math.ceil(height * GROUP_TITLE_LOD_SCALE)
        const x = box.x + pad * 0.6
        const y = box.y + pad * 0.35
        return (
          <g
            className="mp-group-label"
            data-group-toggle={onToggle ? group.id : undefined}
            onClick={onToggle ? (ev) => { ev.stopPropagation(); onToggle(group.id) } : undefined}
          >
            <rect className="mp-group-chip" x={x} y={y} width={width} height={height} rx={4}
                  style={{ fill: accent, fillOpacity: 0.16 }} />
            <rect className="mp-group-chip mp-group-chip-lod" x={x} y={y + height / 2 - lodHeight / 2} width={lodWidth} height={lodHeight} rx={6}
                  style={{ fill: accent, fillOpacity: 0.16 }} />
            <text className="mp-group-title" data-group-toggle={onToggle ? group.id : undefined} x={x + 8} y={y + height / 2} style={{ fill: accent }}>{text}</text>
          </g>
        )
      })()}
    </g>
  )
}
