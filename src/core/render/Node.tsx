import type { IRNode } from '@/core/ir'
import type { LaidOutNode } from '@/core/layout'
import { iconMetrics, measureCompartments, measureLabel, shapeSideInset, shapeVerticalInsets, splitLabelLines } from '@/core/layout'
import type { Theme } from '@/core/theme'
import type { IconData } from '@/core/icons'
import { shapePath } from './shapes'
import { roundedRectPath, sketchSeed } from './sketch'
import { Sketch } from './SketchPath'

interface Props {
  node: IRNode
  box: LaidOutNode
  theme: Theme
  icon?: IconData
  selected?: boolean
  dimmed?: boolean
  /** Outside the hovered neighbourhood. */
  receded?: boolean
  hovered?: boolean
  matched?: boolean
  /** Present for collapsed-group nodes: click expands them. */
  onToggle?: (groupId: string) => void
  /** Entrance stagger step. */
  step?: number
}

function Body({ node, box, theme }: { node: IRNode; box: LaidOutNode; theme: Theme }) {
  const sketch = theme.texture === 'sketch'
  // Pseudo-states are tiny solid glyphs; never sketch them.
  if (node.shapeHint === 'stateStart') return <circle className="mp-node-body mp-node-solid" cx={box.width / 2} cy={box.height / 2} r={box.width / 2} />
  if (node.shapeHint === 'stateEnd') {
    return (
      <g>
        <circle className="mp-node-body mp-node-ring" cx={box.width / 2} cy={box.height / 2} r={box.width / 2 - 1} />
        <circle className="mp-node-solid" cx={box.width / 2} cy={box.height / 2} r={box.width / 2 - 5} />
      </g>
    )
  }
  if (node.shapeHint === 'fork' || node.shapeHint === 'join') {
    return <rect className="mp-node-body mp-node-solid" width={box.width} height={box.height} rx={2} />
  }
  // Stacked-section nodes are always boxes; the archetype only tints them.
  const path = node.compartments
    ? null
    : shapePath(node.archetype, node.shapeHint === 'choice' ? 'diamond' : node.shapeHint, box.width, box.height)
  if (sketch) {
    return (
      <Sketch
        className="mp-node-body-sketch"
        d={path ?? roundedRectPath(box.width, box.height, theme.geometry.radius)}
        seed={sketchSeed(node.id)}
        fill={`var(--mp-arch-${node.archetype}-fill)`}
        stroke={`var(--mp-arch-${node.archetype}-stroke)`}
        strokeWidth={theme.geometry.strokeWidth}
      />
    )
  }
  return path ? (
    <path className="mp-node-body" d={path} />
  ) : (
    <rect className="mp-node-body" width={box.width} height={box.height} rx={theme.geometry.radius} />
  )
}

function Compartments({ node, box, theme, iconSlot }: { node: IRNode; box: LaidOutNode; theme: Theme; iconSlot: number }) {
  const sections = node.compartments!
  const m = measureCompartments(sections, theme, iconSlot)
  let y = 0
  const out: JSX.Element[] = []
  sections.forEach((lines, i) => {
    const h = m.sectionHeights[i] ?? 0
    if (h === 0) return
    if (i > 0) out.push(<line key={`div-${i}`} className="mp-compartment-divider" x1={0} y1={y} x2={box.width} y2={y} />)
    const line = i === 0 ? m.headerLine : m.bodyLine
    lines.forEach((text, j) => {
      const ty = y + m.padY + line * j + line / 2
      out.push(
        i === 0 ? (
          <text key={`${i}-${j}`} className={`mp-node-label mp-compartment-header${j < lines.length - 1 ? ' mp-compartment-stereotype' : ''}`} x={iconSlot + (box.width - iconSlot) / 2} y={ty}>{text}</text>
        ) : (
          <text key={`${i}-${j}`} className="mp-node-label mp-compartment-line" x={m.padX} y={ty}>{text}</text>
        ),
      )
    })
    y += h
  })
  return <>{out}</>
}

export function Node({ node, box, theme, icon, selected = false, dimmed = false, receded = false, hovered = false, matched = false, onToggle, step = 0 }: Props) {
  const lines = splitLabelLines(node.label)
  const lineHeight = theme.type.scale[1] * 1.35
  const firstDy = -((lines.length - 1) * lineHeight) / 2
  const sketch = theme.texture === 'sketch'

  // Icon and label are one content group, centred together between the node's
  // padding edges. Centring the label alone leaves the pair looking off-axis.
  const metrics = icon ? iconMetrics(theme) : null
  const iconSlot = metrics ? metrics.size + metrics.gap : 0
  // The label sits in the band the outline leaves free, not the raw box.
  const vertical = node.compartments ? { top: 0, bottom: 0 } : shapeVerticalInsets(node)
  const contentMiddle = vertical.top + (box.height - vertical.top - vertical.bottom) / 2
  const padX = theme.geometry.nodePaddingX
  const edge = padX + (node.compartments ? 0 : shapeSideInset(node, box.height, theme))
  const labelWidth = measureLabel(node.label, theme).width
  const contentWidth = iconSlot + labelWidth
  const contentStart = Math.max(edge, (box.width - contentWidth) / 2)
  const iconX = contentStart
  const labelCenter = icon ? contentStart + iconSlot + labelWidth / 2 : box.width / 2
  const section = node.meta['section']
  const style = {
    '--mp-i': step,
    ...(section !== undefined ? { '--mp-section-fill': `var(--mp-accent-${Number(section) % theme.color.accent.length})` } : {}),
  } as React.CSSProperties

  return (
    <g
      className="mp-node"
      data-node-id={node.id}
      data-archetype={node.archetype}
      data-shape={node.shapeHint}
      data-section={section}
      data-selected={selected ? 'true' : undefined}
      data-dimmed={dimmed ? 'true' : undefined}
      data-receded={receded ? 'true' : undefined}
      data-hovered={hovered ? 'true' : undefined}
      data-match={matched ? 'true' : undefined}
      data-collapsed={node.shapeHint === 'collapsed' ? 'true' : undefined}
      style={style}
      transform={`translate(${box.x} ${box.y})`}
      onClick={onToggle ? () => onToggle(node.id) : undefined}
    >
      {node.shapeHint === 'collapsed' && (
        <g className="mp-node-stack">
          <rect x={6} y={-6} width={box.width} height={box.height} rx={theme.geometry.radius} />
          <rect x={3} y={-3} width={box.width} height={box.height} rx={theme.geometry.radius} />
        </g>
      )}
      <Body node={node} box={box} theme={theme} />
      {node.shapeHint === 'collapsed' && node.meta['members'] && (
        <g className="mp-node-badge" transform={`translate(${box.width - 4} 4)`}>
          <circle r={9} />
          <text y={0.5}>{node.meta['members']}</text>
        </g>
      )}
      {!sketch && node.archetype === 'storage' && !node.compartments && (
        <rect className="mp-node-band" x={0} y={box.height - 5} width={box.width} height={5} rx={theme.geometry.radius / 2} />
      )}
      {icon && metrics && (
        <g
          className="mp-node-icon"
          data-monochrome={icon.monochrome ? 'true' : 'false'}
          transform={`translate(${iconX} ${node.compartments ? (measureCompartments(node.compartments, theme, iconSlot).sectionHeights[0]! - metrics.size) / 2 : contentMiddle - metrics.size / 2})`}
        >
          <svg width={metrics.size} height={metrics.size} viewBox={`0 0 ${icon.width} ${icon.height}`} dangerouslySetInnerHTML={{ __html: icon.body }} />
        </g>
      )}
      {node.compartments ? (
        <Compartments node={node} box={box} theme={theme} iconSlot={iconSlot} />
      ) : node.label ? (
        <text className="mp-node-label" x={labelCenter} y={contentMiddle}>
          {lines.map((line, i) => (
            <tspan key={i} x={labelCenter} dy={i === 0 ? firstDy : lineHeight}>{line}</tspan>
          ))}
        </text>
      ) : null}
    </g>
  )
}
