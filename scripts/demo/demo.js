const SVG = JSON.parse(document.getElementById('scene-svg').textContent);
const STEPS = JSON.parse(document.getElementById('scene-steps').textContent);

const deck = document.getElementById('deck');
const camera = document.getElementById('camera');
const scrim = document.getElementById('scrim');
const typeLayer = document.getElementById('type-layer');
const card = document.getElementById('card');
const code = document.getElementById('code');
const callout = document.getElementById('callout');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The wiki picture is a raster; everything after the turn is vector. */
let showing = null;
function setPicture(step) {
  const name = step.pic ?? null;
  if (name === showing) return;
  showing = name;
  const sheet = document.createElement('div');
  sheet.className = 'sheet' + (step.draw && !still ? ' draw' : '');
  if (name) {
    sheet.innerHTML = SVG[name].startsWith('data:')
      ? `<img src="${SVG[name]}" alt="">`
      : SVG[name];
  }
  camera.append(sheet);
  requestAnimationFrame(() => sheet.classList.add('in'));
  for (const old of camera.querySelectorAll('.sheet')) {
    if (old === sheet) continue;
    old.classList.add('out');
    setTimeout(() => old.remove(), 900);
  }
}

function setCamera(step, ms) {
  const cam = step.cam ?? { s: 1, x: 0, y: 0 };
  camera.style.setProperty('--cam-ms', `${ms}ms`);
  camera.style.setProperty('--s', cam.s ?? 1);
  camera.style.setProperty('--x', `${cam.x ?? 0}%`);
  camera.style.setProperty('--y', `${cam.y ?? 0}%`);
}

function setType(step) {
  for (const line of [...typeLayer.children]) {
    line.classList.add('out');
    setTimeout(() => line.remove(), 440);
  }
  (step.title ?? []).forEach((text, i) => {
    const line = document.createElement('span');
    line.className = 'line';
    const inner = document.createElement('span');
    inner.innerHTML = text;
    inner.style.animationDelay = `${140 + i * 110}ms`;
    line.append(inner);
    typeLayer.append(line);
  });
  if (step.sub) {
    const p = document.createElement('p');
    p.className = 'sub';
    p.innerHTML = step.sub;
    typeLayer.append(p);
  }
}

/**
 * The source, and the two edits that put it right.
 *
 * This is the turn of the film, so the correction is shown rather than
 * described: one line is struck through and folds away, one word is replaced.
 * Small enough that "anyone can fix a line" is a claim you can watch.
 */
function setCode(step) {
  card.classList.toggle('on', !!step.code);
  if (!step.code) return;
  if (code.dataset.of !== String(step.code.length)) {
    code.textContent = '';
    for (const text of step.code) {
      const line = document.createElement('span');
      line.className = 'cl';
      line.textContent = text || ' ';
      code.append(line);
    }
    code.dataset.of = String(step.code.length);
  }
  if (!step.edits) return;
  const lines = [...code.children];
  for (const edit of step.edits) {
    const line = lines[edit.line];
    if (!line) continue;
    if (edit.cut) {
      setTimeout(() => line.classList.add('cut'), edit.at ?? 700);
      setTimeout(() => line.classList.add('gone'), (edit.at ?? 700) + 900);
    } else if (edit.to) {
      setTimeout(async () => {
        const before = line.textContent.split(edit.from)[0];
        for (let i = 0; i <= edit.to.length; i++) {
          line.innerHTML = before + '<span class="ed">' + edit.to.slice(0, i) + '</span>';
          await sleep(still ? 0 : 55);
        }
      }, edit.at ?? 1800);
    }
  }
}

function setCallout(step) {
  callout.classList.remove('on');
  if (!step.callout) return;
  const { x, y, text, width } = step.callout;
  callout.style.left = `${x}%`;
  callout.style.top = `${y}%`;
  callout.querySelector('.rule').style.width = `${width ?? 60}px`;
  callout.querySelector('.text').textContent = text;
  setTimeout(() => callout.classList.add('on'), Math.max(300, step.ms * 0.5));
}

async function play() {
  for (;;) {
    showing = null;
    code.dataset.of = '';
    for (const step of STEPS) {
      deck.dataset.act = step.act ?? 'alive';
      deck.dataset.layout = step.close ? 'end' : step.dim ? 'card' : step.code ? 'text' : step.cam ? 'focus' : 'stage';
      scrim.classList.toggle('on', !!step.dim);
      if (step.dim) scrim.style.setProperty('--dim', step.dim);
      setPicture(step);
      setCamera(step, step.ms);
      setType(step);
      setCode(step);
      setCallout(step);
      await sleep(step.ms);
    }
    await sleep(600);
  }
}
play();
