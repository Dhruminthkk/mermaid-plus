/** Escapes text for inclusion in an HTML document body. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface HtmlExportOptions {
  title: string
  /** Page background, so the file matches the theme it was exported from. */
  background: string
  foreground: string
  muted: string
  border: string
  fontFamily: string
  /** Original Mermaid source, embedded so the file can be edited back into the app. */
  source?: string
  width: number
  height: number
}

/**
 * A standalone, offline HTML page around an already self-contained SVG.
 *
 * The SVG is the same one every other export uses, so the HTML file and the
 * SVG/PNG/PDF files are the same picture — the HTML just adds pan, zoom and the
 * source it was built from.
 */
export function buildStandaloneHtml(svg: string, options: HtmlExportOptions): string {
  const { title, background, foreground, muted, border, fontFamily, source, width, height } = options
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    display: flex; flex-direction: column;
    background: ${background}; color: ${foreground};
    font: 13px/1.5 ${fontFamily};
  }
  header {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 16px; border-bottom: 1px solid ${border};
  }
  header h1 { margin: 0; font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
  header .spacer { flex: 1; }
  button {
    font: inherit; color: inherit; background: transparent;
    border: 1px solid ${border}; border-radius: 6px; padding: 4px 10px; cursor: pointer;
  }
  button:hover { background: color-mix(in srgb, ${foreground} 8%, transparent); }
  #zoom { min-width: 46px; text-align: center; color: ${muted}; font-variant-numeric: tabular-nums; }
  #stage { flex: 1; position: relative; overflow: hidden; cursor: grab; touch-action: none; }
  #stage:active { cursor: grabbing; }
  #stage.dragging { cursor: grabbing; }
  #canvas { position: absolute; top: 0; left: 0; transform-origin: 0 0; will-change: transform; }
  #canvas svg { display: block; }
  details { border-top: 1px solid ${border}; }
  summary { padding: 8px 16px; cursor: pointer; color: ${muted}; user-select: none; }
  summary:hover { color: ${foreground}; }
  pre {
    margin: 0; padding: 0 16px 16px; overflow: auto; max-height: 40vh;
    font: 12px/1.5 "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace; color: ${muted};
  }
  @media print {
    header, details { display: none; }
    #stage { overflow: visible; }
    #canvas { position: static; transform: none !important; }
  }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(title)}</h1>
  <span class="spacer"></span>
  <button type="button" data-zoom="out" aria-label="Zoom out">&minus;</button>
  <span id="zoom">100%</span>
  <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
  <button type="button" data-zoom="fit">Fit</button>
  <button type="button" data-zoom="reset">100%</button>
</header>
<div id="stage"><div id="canvas">${svg}</div></div>
${source ? `<details><summary>Mermaid source</summary><pre>${escapeHtml(source)}</pre></details>` : ''}
<script>
(function () {
  var CONTENT = { width: ${width}, height: ${height} };
  var stage = document.getElementById('stage');
  var canvas = document.getElementById('canvas');
  var zoomLabel = document.getElementById('zoom');
  var view = { scale: 1, x: 0, y: 0 };

  function apply() {
    canvas.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.scale + ')';
    zoomLabel.textContent = Math.round(view.scale * 100) + '%';
  }
  function clamp(s) { return Math.min(8, Math.max(0.02, s)); }
  function fit() {
    var r = stage.getBoundingClientRect();
    var scale = clamp(Math.min((r.width - 48) / CONTENT.width, (r.height - 48) / CONTENT.height, 1));
    view = { scale: scale, x: (r.width - CONTENT.width * scale) / 2, y: (r.height - CONTENT.height * scale) / 2 };
    apply();
  }
  function zoomBy(f) {
    var r = stage.getBoundingClientRect();
    var scale = clamp(view.scale * f), k = scale / view.scale;
    view.x = r.width / 2 - (r.width / 2 - view.x) * k;
    view.y = r.height / 2 - (r.height / 2 - view.y) * k;
    view.scale = scale;
    apply();
  }

  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = stage.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    var scale = clamp(view.scale * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))), k = scale / view.scale;
    view.x = px - (px - view.x) * k;
    view.y = py - (py - view.y) * k;
    view.scale = scale;
    apply();
  }, { passive: false });

  var drag = null;
  stage.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    view.x = drag.ox + (e.clientX - drag.x);
    view.y = drag.oy + (e.clientY - drag.y);
    apply();
  });
  function endDrag() { drag = null; stage.classList.remove('dragging'); }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  document.addEventListener('click', function (e) {
    var action = e.target && e.target.getAttribute && e.target.getAttribute('data-zoom');
    if (action === 'in') zoomBy(1.25);
    else if (action === 'out') zoomBy(1 / 1.25);
    else if (action === 'fit') fit();
    else if (action === 'reset') { view.scale = 1; apply(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '+' || e.key === '=') zoomBy(1.25);
    else if (e.key === '-') zoomBy(1 / 1.25);
    else if (e.key === '0') fit();
    else if (e.key === '1') { view.scale = 1; apply(); }
    else return;
    e.preventDefault();
  });

  window.addEventListener('resize', fit);
  fit();
})();
</script>
</body>
</html>
`
}
