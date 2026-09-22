import type { Box } from '@/core/layout'

interface Props {
  contentWidth: number
  contentHeight: number
  nodes: Box[]
  groups: Box[]
  /** Visible region in content coordinates. */
  visible: Box
  onNavigate: (centerX: number, centerY: number) => void
}

const WIDTH = 160

/** Overview of the whole diagram with the current viewport outlined; click to jump. */
export function Minimap({ contentWidth, contentHeight, nodes, groups, visible, onNavigate }: Props) {
  if (contentWidth === 0 || contentHeight === 0) return null
  const scale = WIDTH / Math.max(contentWidth, contentHeight * (WIDTH / 110))
  const w = Math.ceil(contentWidth * scale)
  const h = Math.ceil(contentHeight * scale)

  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    onNavigate((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale)
  }

  return (
    <svg className="mp-minimap" width={w} height={h} viewBox={`0 0 ${contentWidth} ${contentHeight}`} onClick={onClick} onPointerDown={(e) => e.stopPropagation()} aria-label="Minimap">
      <rect className="mp-minimap-bg" width={contentWidth} height={contentHeight} />
      {groups.map((g, i) => <rect key={`g${i}`} className="mp-minimap-group" x={g.x} y={g.y} width={g.width} height={g.height} rx={8} />)}
      {nodes.map((n, i) => <rect key={`n${i}`} className="mp-minimap-node" x={n.x} y={n.y} width={n.width} height={n.height} rx={4} />)}
      <rect
        className="mp-minimap-view"
        x={Math.max(0, visible.x)}
        y={Math.max(0, visible.y)}
        width={Math.min(contentWidth - Math.max(0, visible.x), visible.width)}
        height={Math.min(contentHeight - Math.max(0, visible.y), visible.height)}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
