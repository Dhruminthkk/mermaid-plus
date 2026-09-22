import type { Theme } from '@/core/theme'

/**
 * Projects our token schema onto mermaid's `themeVariables` so tier-2 diagrams
 * (sequence, gantt, pie, ...) wear the same identity as the custom pipeline.
 * Keys follow mermaid's documented theme variables.
 */
/** Ordinal palette source: distinct, already mode-aware archetype tints. */
const SCALE_ARCHETYPES = [
  'service', 'database', 'queue', 'storage', 'user', 'decision',
  'external', 'note', 'process', 'default', 'service', 'database',
] as const

export function mermaidThemeVariables(theme: Theme): Record<string, string | boolean | object> {
  const c = theme.color
  const a = c.archetype
  const accent = (i: number) => c.accent[i % c.accent.length]!

  return {
    darkMode: theme.mode === 'dark',
    background: c.canvas,
    fontFamily: theme.type.family,
    fontSize: `${theme.type.scale[1]}px`,

    // Generic node/edge palette
    primaryColor: a.service.fill,
    primaryTextColor: a.service.text,
    primaryBorderColor: a.service.stroke,
    secondaryColor: a.default.fill,
    secondaryTextColor: a.default.text,
    secondaryBorderColor: a.default.stroke,
    tertiaryColor: c.surface,
    tertiaryTextColor: c.text,
    tertiaryBorderColor: c.stroke,
    lineColor: c.edge,
    textColor: c.text,
    mainBkg: a.default.fill,
    nodeBorder: a.default.stroke,
    nodeTextColor: a.default.text,
    titleColor: c.text,
    edgeLabelBackground: c.canvas,
    clusterBkg: c.surface,
    clusterBorder: c.stroke,

    // Sequence
    actorBkg: a.user.fill,
    actorBorder: a.user.stroke,
    actorTextColor: a.user.text,
    actorLineColor: c.edgeMuted,
    signalColor: c.edge,
    signalTextColor: c.text,
    labelBoxBkgColor: c.surface,
    labelBoxBorderColor: c.stroke,
    labelTextColor: c.text,
    loopTextColor: c.textMuted,
    noteBkgColor: a.note.fill,
    noteBorderColor: a.note.stroke,
    noteTextColor: a.note.text,
    activationBkgColor: a.service.fill,
    activationBorderColor: a.service.stroke,
    sequenceNumberColor: c.canvas,

    // Gantt
    sectionBkgColor: c.surface,
    altSectionBkgColor: c.canvas,
    sectionBkgColor2: c.surfaceRaised,
    taskBkgColor: a.service.fill,
    taskBorderColor: a.service.stroke,
    taskTextColor: a.service.text,
    taskTextLightColor: a.service.text,
    taskTextOutsideColor: c.text,
    activeTaskBkgColor: accent(0),
    activeTaskBorderColor: accent(0),
    doneTaskBkgColor: c.stroke,
    doneTaskBorderColor: c.edgeMuted,
    critBkgColor: accent(4),
    critBorderColor: accent(4),
    gridColor: c.stroke,
    todayLineColor: accent(4),

    // Pie / quadrant / xy
    pie1: accent(0), pie2: accent(1), pie3: accent(2), pie4: accent(3),
    pie5: accent(4), pie6: accent(5), pie7: accent(0), pie8: accent(1),
    pie9: accent(2), pie10: accent(3), pie11: accent(4), pie12: accent(5),
    pieTitleTextColor: c.text,
    pieSectionTextColor: c.canvas,
    pieLegendTextColor: c.text,
    pieStrokeColor: c.canvas,
    quadrant1Fill: a.service.fill,
    quadrant2Fill: a.database.fill,
    quadrant3Fill: a.queue.fill,
    quadrant4Fill: a.storage.fill,
    quadrantPointFill: accent(0),
    quadrantXAxisTextFill: c.textMuted,
    quadrantYAxisTextFill: c.textMuted,

    // Generic ordinal scale: kanban sections, journey sections, class fill types,
    // timeline sections. Archetype fills are already tinted per mode, so these
    // stay readable in dark themes without a second palette.
    ...Object.fromEntries(
      SCALE_ARCHETYPES.flatMap((name, i) => [
        [`cScale${i}`, a[name].fill],
        [`cScaleLabel${i}`, a[name].text],
        [`cScaleInv${i}`, a[name].stroke],
      ]),
    ),

    // XY chart: an object rather than flat keys, and it paints its own plot area.
    xyChart: {
      backgroundColor: c.canvas,
      titleColor: c.text,
      dataLabelColor: c.text,
      legendTextColor: c.text,
      xAxisTitleColor: c.text,
      xAxisLabelColor: c.textMuted,
      xAxisTickColor: c.stroke,
      xAxisLineColor: c.stroke,
      yAxisTitleColor: c.text,
      yAxisLabelColor: c.textMuted,
      yAxisTickColor: c.stroke,
      yAxisLineColor: c.stroke,
      plotColorPalette: c.accent.join(', '),
    },

    // Architecture: the only two colours it exposes.
    archEdgeColor: c.edge,
    archEdgeArrowColor: c.edge,
    archGroupBorderColor: c.stroke,

    // Git / state / class / journey extras
    git0: accent(0), git1: accent(1), git2: accent(2), git3: accent(3),
    git4: accent(4), git5: accent(5), git6: accent(0), git7: accent(1),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`gitBranchLabel${i}`, c.canvas])),
    commitLabelColor: c.text,
    commitLabelBackground: c.surface,
    tagLabelColor: c.text,
    tagLabelBackground: a.note.fill,
    tagLabelBorder: a.note.stroke,
    classText: a.default.text,
    fillType0: a.service.fill,
    fillType1: a.database.fill,
    fillType2: a.queue.fill,
    fillType3: a.storage.fill,
    fillType4: a.user.fill,
    fillType5: a.external.fill,
    fillType6: a.decision.fill,
    fillType7: a.note.fill,
  }
}
