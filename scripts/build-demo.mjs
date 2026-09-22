// Assembles the two looping demo pages from the pieces in scripts/demo/.
//
// The diagrams are the app's own rendered SVG, pulled by extract-scenes.mjs, so
// nothing in the demo is a mockup. Each page is self-contained: one file, no
// requests except the web font.
//
//   npm run preview        (serves dist/ on :4173)
//   npm run demo:scenes    (re-render the diagrams)
//   npm run demo:build     (assemble the pages)
//
// To change the script, edit scripts/demo/steps.json — the captions, the order
// and how long each beat holds — then rebuild. Beats are worth lengthening
// before they are worth adding to: a demo that moves faster than a viewer can
// read shows nothing.
import { readFileSync, writeFileSync } from 'node:fs'

const read = (f) => readFileSync(`scripts/demo/${f}`, 'utf8')
const scenes = JSON.parse(readFileSync('site/demo/scenes.json', 'utf8'))
const steps = JSON.parse(read('steps.json'))
const common = read('demo.css')
const engine = read('demo.js')

const FORMATS = {
  desktop: { out: 'site/demo/index.html', css: 'demo.desktop.css', title: 'Mermaid Plus — demo' },
  mobile: { out: 'site/demo/mobile.html', css: 'demo.mobile.css', title: 'Mermaid Plus — demo, vertical' },
}

for (const [kind, format] of Object.entries(FORMATS)) {
  const list = steps[kind]
  const used = Object.fromEntries(
    [...new Set(list.map((s) => s.pic).filter(Boolean))].map((name) => [name, scenes[name]]))
  const missing = Object.entries(used).filter(([, svg]) => !svg).map(([name]) => name)
  if (missing.length) throw new Error(`no rendered scene for: ${missing.join(', ')}. Run npm run demo:scenes`)

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${format.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>${common}${read(format.css)}</style>
</head>
<body>
<div class="fit" id="fit">
  <div class="deck" id="deck" data-act="wiki" data-layout="stage">

    <div class="mark"><b>Mermaid<i>Plus</i></b><span>the same files, drawn properly</span></div>

    <section class="panel" id="panel">
      <div class="glow"></div>
      <div id="camera"></div>
      <div class="vignette"></div>
      <div class="scrim" id="scrim"></div>
      <div id="card"><pre id="code"></pre></div>
      <div id="callout"><span class="dot"></span><span class="rule"></span><span class="text"></span></div>
      <div class="stamp">architecture.png &middot; last edited 18 March</div>
    </section>

    <section class="copy">
      <div class="type-layer" id="type-layer"></div>
    </section>

    <div class="end">
      <div class="word">Mermaid<i>Plus</i></div>
      <p>Write Mermaid. Get a diagram worth showing.</p>
      <div class="fine">Runs entirely in your browser. Nothing is uploaded.</div>
    </div>

  </div>
</div>

<script type="application/json" id="scene-svg">${JSON.stringify(used)}</script>
<script type="application/json" id="scene-steps">${JSON.stringify(list)}</script>
<script>
// The deck is composed at one size so a recording is framed exactly. Landscape
// fits inside the window; vertical covers it, because a phone taller than 9:16
// would otherwise show the film in a letterbox with black above and below.
const FILL = ${kind === 'mobile' ? 'true' : 'false'};
const fit = document.getElementById('fit');
function scale() {
  const w = fit.offsetWidth, h = fit.offsetHeight;
  const sx = innerWidth / w, sy = innerHeight / h;
  const k = FILL ? Math.max(sx, sy) : Math.min(sx, sy);
  fit.style.transform = \`scale(\${k})\`;
  fit.style.transformOrigin = 'top left';
  fit.style.left = \`\${(innerWidth - w * k) / 2}px\`;
  fit.style.top = \`\${(innerHeight - h * k) / 2}px\`;
}
addEventListener('resize', scale);
scale();
</script>
<script>${engine}</script>
</body>
</html>
`
  writeFileSync(format.out, html)
  const seconds = (list.reduce((n, s) => n + s.ms, 0) / 1000).toFixed(1)
  const kb = (html.length / 1024).toFixed(0)
  console.log(`${kind.padEnd(8)} ${String(list.length).padStart(2)} steps  ${seconds.padStart(5)}s  ${kb.padStart(4)} KB  ${format.out}`)
}
