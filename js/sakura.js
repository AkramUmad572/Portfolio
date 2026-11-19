/**
 * Fixed full-viewport sakura petal layer. Lightweight CSS keyframe animation;
 * disabled when prefers-reduced-motion, fewer petals on small screens.
 *
 * Continuity across pages: petals come from a fixed seed (same petals on every
 * page) and each petal's animation phase is derived from the wall clock, so
 * navigating to another page picks the fall up exactly where it left off
 * instead of re-randomising.
 */
(function () {
  const PETAL_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 1.2C7.2 6.8 3.2 13.6 3.2 20.4c0 5.6 3.4 9.8 8.8 10.4 5.4-.6 8.8-4.8 8.8-10.4 0-6.8-4-13.6-8.8-19.2z"/>' +
    "</svg>";

  const SEED = 0x5a4b17;
  // Earlier baseline: desktop 70, narrow 36.
  const COUNT_DESKTOP = 75;
  const COUNT_NARROW = 39;

  // Small deterministic PRNG (mulberry32): same sequence on every page load.
  function makeRandom(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildPetal(layer, random, nowSec) {
    const rand = (min, max) => min + random() * (max - min);

    const el = document.createElement("div");
    el.className = "sakura-petal";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = PETAL_SVG;

    const size = rand(10, 18);
    const leftPct = rand(-5, 105);
    const dur = rand(16, 32);
    const offset = rand(0, dur);
    const op = rand(0.38, 0.62);
    const spin = rand(0.6, 1.35);
    const scale = rand(12, 42);
    const x = () => (random() - 0.5) * 2 * scale;
    const xs = [x(), x(), x(), x(), x()];

    // Phase from the shared clock: a negative delay starts the petal mid-fall
    // at the same point it would be on any other page right now.
    const phase = (nowSec + offset) % dur;
    const delay = -phase;

    el.style.left = `${leftPct}%`;
    el.style.width = `${size}px`;
    el.style.setProperty("--dur", `${dur.toFixed(3)}s`);
    el.style.setProperty("--delay", `${delay.toFixed(3)}s`);
    el.style.setProperty("--op", op.toFixed(3));
    el.style.setProperty("--spin", `${spin.toFixed(3)}turn`);
    xs.forEach((v, i) => el.style.setProperty(`--x${i}`, `${v.toFixed(2)}px`));

    layer.appendChild(el);
  }

  function init() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const layer = document.createElement("div");
    layer.id = "sakura-layer";
    layer.setAttribute("aria-hidden", "true");

    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const count = narrow ? COUNT_NARROW : COUNT_DESKTOP;
    const random = makeRandom(SEED);
    const nowSec = Date.now() / 1000;

    for (let i = 0; i < count; i++) {
      buildPetal(layer, random, nowSec);
    }

    document.body.insertBefore(layer, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
