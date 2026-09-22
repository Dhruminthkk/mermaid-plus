import type { Example } from './types'

export const xychart: Example[] = [
  { title: 'Checkout latency through the day', source: `xychart-beta
  title "Checkout p50 and p99 by hour (UTC)"
  x-axis [00, 02, 04, 06, 08, 10, 12, 14, 16, 18, 20, 22]
  y-axis "Milliseconds" 0 --> 900
  line [118, 112, 109, 121, 168, 245, 288, 264, 231, 296, 214, 152]
  line [341, 322, 318, 358, 512, 690, 812, 742, 655, 806, 588, 428]` },

  { title: 'Error budget burn', source: `xychart-beta
  title "Error budget consumed, 28 day window"
  x-axis [D1, D4, D7, D10, D13, D16, D19, D22, D25, D28]
  y-axis "Percent of budget" 0 --> 100
  line [2, 7, 11, 14, 18, 47, 52, 58, 64, 71]
  bar [2, 5, 4, 3, 4, 29, 5, 6, 6, 7]` },

  { title: 'Deploy frequency and lead time', source: `xychart-beta
  title "Deploys per week"
  x-axis [W1, W2, W3, W4, W5, W6, W7, W8, W9, W10, W11, W12]
  y-axis "Deploys" 0 --> 60
  bar [8, 9, 7, 12, 14, 13, 19, 22, 26, 31, 38, 46]
  line [8, 9, 7, 12, 14, 13, 19, 22, 26, 31, 38, 46]` },

  { title: 'Cloud spend by month', source: `xychart-beta
  title "Cloud spend, thousands"
  x-axis [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
  y-axis "Thousands" 0 --> 120
  bar [78, 81, 86, 94, 103, 112, 108, 99, 88, 82, 79, 76]
  line [78, 81, 86, 94, 103, 112, 108, 99, 88, 82, 79, 76]` },

  { title: 'Signup funnel by step', source: `xychart-beta
  title "Visitors remaining at each step"
  x-axis [Landing, Signup, Verify, Invite, Import, Activated]
  y-axis "Visitors" 0 --> 12000
  bar [11800, 4260, 3510, 1980, 1240, 1090]` },

  { title: 'Cache hit rate after tuning', source: `xychart-beta
  title "Cache hit rate, percent"
  x-axis [W1, W2, W3, W4, W5, W6, W7, W8]
  y-axis "Percent" 40 --> 100
  line [61, 63, 62, 64, 88, 91, 92, 93]` },

  { title: 'Build times by pipeline stage', source: `xychart-beta
  title "Median CI minutes"
  x-axis [Lint, Unit, Build, Scan, Integration, E2E]
  y-axis "Minutes" 0 --> 24
  bar [2, 4, 6, 3, 11, 18]` },

  { title: 'Support volume against headcount', source: `xychart-beta
  title "Tickets per week"
  x-axis [Q1W1, Q1W6, Q1W12, Q2W1, Q2W6, Q2W12, Q3W1, Q3W6, Q3W12]
  y-axis "Tickets" 0 --> 1400
  bar [640, 720, 810, 905, 1010, 1180, 1240, 1120, 980]
  line [640, 720, 810, 905, 1010, 1180, 1240, 1120, 980]` },

  { title: 'Database connections against pool size', source: `xychart-beta
  title "Active connections during the incident"
  x-axis [1400, 1402, 1404, 1406, 1408, 1410, 1412, 1414, 1416, 1418]
  y-axis "Connections" 0 --> 220
  line [42, 58, 96, 154, 198, 200, 200, 200, 168, 74]` },

  { title: 'Page weight over a year', source: `xychart-beta
  title "JavaScript shipped on first load, KB"
  x-axis [Jan, Mar, May, Jul, Sep, Nov]
  y-axis "Kilobytes" 0 --> 420
  bar [386, 372, 341, 268, 214, 168]
  line [386, 372, 341, 268, 214, 168]` },
]
