// norman-rain — generative character rain
// Canvas 2D, 60fps, depth-based rendering

(() => {
  'use strict';

  // ── Character pools ──────────────────────────────────────────────
  const CJK = 'の雨に溶ける空の文字が降る森の静けさ風が運ぶ花びら星の光川の流れ山の声雲の影月の明かり朝の露夜の闇桜の咲く道雪の降る夜秋の紅葉冬の雪春の訪れ夏の蝉';
  const GREEK = 'αβγδεζηθικλμνξοπρστυφχψω';
  const CYRILLIC = 'абвгдежзийклмнопрстуфхцчшщъыьэюя';
  const SWEDISH = 'åäö';
  const LATIN = 'abcdefghijklmnopqrstuvwxyz';
  const SYMBOLS = '・。、ー，。！？；：？「」『』【】〔〕〈〉《》〈〉';

  const ALL = CJK + GREEK + CYRILLIC + SWEDISH + LATIN + SYMBOLS;

  // ── Canvas setup ─────────────────────────────────────────────────
  const canvas = document.getElementById('rain');
  const ctx = canvas.getContext('2d');

  let W, H, cols, drops, heads, depths;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.floor(W / 16);
    drops = new Array(cols);
    heads = new Array(cols);
    depths = new Array(cols);

    for (let i = 0; i < cols; i++) {
      drops[i] = Math.random() * -100;
      heads[i] = Math.random() * 30;
      depths[i] = Math.random();
    }
  }

  resize();
  window.addEventListener('resize', resize);

  // ── Depth-based config ───────────────────────────────────────────
  function depthConfig(d) {
    return {
      speed: 0.3 + d * 1.7,
      size: 8 + d * 12,
      brightness: 0.15 + d * 0.85,
      glow: d * 0.6,
      trail: Math.floor(d * 15),
    };
  }

  // ── Character selection ──────────────────────────────────────────
  function pickChar(d) {
    const r = Math.random();
    if (d > 0.7) {
      if (r < 0.7) return CJK[Math.floor(Math.random() * CJK.length)];
      if (r < 0.85) return GREEK[Math.floor(Math.random() * GREEK.length)];
      return CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)];
    } else if (d > 0.4) {
      if (r < 0.4) return CJK[Math.floor(Math.random() * CJK.length)];
      if (r < 0.55) return GREEK[Math.floor(Math.random() * GREEK.length)];
      if (r < 0.7) return CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)];
      if (r < 0.85) return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      return LATIN[Math.floor(Math.random() * LATIN.length)];
    } else {
      if (r < 0.3) return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      if (r < 0.5) return LATIN[Math.floor(Math.random() * LATIN.length)];
      if (r < 0.6) return GREEK[Math.floor(Math.random() * GREEK.length)];
      return CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)];
    }
  }

  // ── Color palette ────────────────────────────────────────────────
  function dropColor(d, alpha) {
    if (d > 0.7) {
      return `rgba(255, 255, 248, ${alpha})`;
    } else if (d > 0.4) {
      return `rgba(180, 210, 255, ${alpha})`;
    } else {
      return `rgba(100, 140, 180, ${alpha})`;
    }
  }

  // ── Render loop ──────────────────────────────────────────────────
  let frame = 0;

  function render() {
    frame++;

    // Fade background
    ctx.fillStyle = 'rgba(5, 5, 15, 0.08)';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < cols; i++) {
      const d = depths[i];
      const cfg = depthConfig(d);

      drops[i] += cfg.speed;

      if (drops[i] > H + cfg.trail * cfg.size) {
        drops[i] = Math.random() * -50;
        heads[i] = Math.random() * 30;
        depths[i] = Math.random();
      }

      // Draw trail
      for (let j = 1; j <= cfg.trail; j++) {
        const y = drops[i] - j * cfg.size;
        if (y < 0) continue;

        const trailAlpha = (1 - j / cfg.trail) * cfg.brightness * 0.6;
        ctx.font = `${cfg.size}px "Noto Sans JP", "Hiragino Kaku Gothic Pro", "Yu Gothic", sans-serif`;
        ctx.fillStyle = dropColor(d, trailAlpha);

        if (j === 1) {
          if (cfg.glow > 0.1) {
            ctx.shadowColor = dropColor(d, cfg.glow);
            ctx.shadowBlur = 8 * cfg.glow;
          }
          ctx.fillText(pickChar(d), i * 16, y);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillText(pickChar(d), i * 16, y);
        }
      }

      // Draw head
      const headAlpha = cfg.brightness;
      ctx.font = `${cfg.size}px "Noto Sans JP", "Hiragino Kaku Gothic Pro", "Yu Gothic", sans-serif`;
      ctx.shadowColor = dropColor(d, cfg.glow);
      ctx.shadowBlur = 10 * cfg.glow;
      ctx.fillStyle = dropColor(d, headAlpha);
      ctx.fillText(pickChar(d), i * 16, drops[i]);
      ctx.shadowBlur = 0;

      if (Math.random() < 0.02) {
        heads[i] = Math.random() * 30;
      }
    }

    requestAnimationFrame(render);
  }

  // ── Tap to reset ─────────────────────────────────────────────────
  canvas.addEventListener('touchstart', () => {
    for (let i = 0; i < cols; i++) {
      drops[i] = Math.random() * -100;
    }
  });

  canvas.addEventListener('click', () => {
    for (let i = 0; i < cols; i++) {
      drops[i] = Math.random() * -100;
    }
  });

  // ── Start ────────────────────────────────────────────────────────
  render();
})();
