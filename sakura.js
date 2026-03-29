/**
 * Fixed full-viewport sakura petal layer. Lightweight CSS keyframe animation;
 * disabled when prefers-reduced-motion, fewer petals on small screens.
 */
(function () {
  const PETAL_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 1.2C7.2 6.8 3.2 13.6 3.2 20.4c0 5.6 3.4 9.8 8.8 10.4 5.4-.6 8.8-4.8 8.8-10.4 0-6.8-4-13.6-8.8-19.2z"/>' +
    "</svg>";

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomXChain() {
    const scale = rand(12, 42);
    const a = () => (Math.random() - 0.5) * 2 * scale;
    return { x0: a(), x1: a(), x2: a(), x3: a(), x4: a() };
  }

  function buildPetal(layer) {
    const el = document.createElement("div");
    el.className = "sakura-petal";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = PETAL_SVG;

    const size = rand(10, 18);
    const leftPct = rand(-5, 105);
    const dur = rand(16, 32);
    const delay = rand(-dur, 0);
    const op = rand(0.38, 0.62);
    const spin = rand(0.6, 1.35);
    const { x0, x1, x2, x3, x4 } = randomXChain();

    el.style.left = `${leftPct}%`;
    el.style.width = `${size}px`;
    el.style.setProperty("--dur", `${dur.toFixed(2)}s`);
    el.style.setProperty("--delay", `${delay.toFixed(2)}s`);
    el.style.setProperty("--op", op.toFixed(3));
    el.style.setProperty("--spin", `${spin.toFixed(3)}turn`);
    el.style.setProperty("--x0", `${x0.toFixed(2)}px`);
    el.style.setProperty("--x1", `${x1.toFixed(2)}px`);
    el.style.setProperty("--x2", `${x2.toFixed(2)}px`);
    el.style.setProperty("--x3", `${x3.toFixed(2)}px`);
    el.style.setProperty("--x4", `${x4.toFixed(2)}px`);

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
    const count = narrow ? randInt(14, 22) : randInt(28, 42);

    for (let i = 0; i < count; i++) {
      buildPetal(layer);
    }

    document.body.insertBefore(layer, document.body.firstChild);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
