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

  // ── Theme system ─────────────────────────────────────────────────
  const THEMES = {
    DEFAULT: {
      name: 'Default',
      background: { r: 5, g: 5, b: 15 },
      fadeAlpha: 0.08,
      depthRange: {
        speed:   { min: 0.3, max: 2.0 },
        size:    { min: 8,   max: 20 },
        brightness: { min: 0.15, max: 1.0 },
        glow:    { min: 0,   max: 0.6 },
        trail:   { min: 0,   max: 15 },
      },
      colorStops: [
        { threshold: 0.7, color: { r: 255, g: 255, b: 248 } },
        { threshold: 0.4, color: { r: 180, g: 210, b: 255 } },
        { threshold: 0,   color: { r: 100, g: 140, b: 180 } },
      ],
      glowBlur: { head: 10, trail: 8 },
    },
    SEPIA: {
      name: 'Sepia',
      background: { r: 18, g: 12, b: 6 },
      fadeAlpha: 0.08,
      depthRange: {
        speed:   { min: 0.3, max: 2.0 },
        size:    { min: 8,   max: 20 },
        brightness: { min: 0.15, max: 1.0 },
        glow:    { min: 0,   max: 0.6 },
        trail:   { min: 0,   max: 15 },
      },
      colorStops: [
        { threshold: 0.7, color: { r: 255, g: 235, b: 200 } },
        { threshold: 0.4, color: { r: 180, g: 140, b: 90 } },
        { threshold: 0,   color: { r: 80,  g: 55,  b: 35 } },
      ],
      glowBlur: { head: 10, trail: 8 },
    },
    MONO: {
      name: 'Mono',
      background: { r: 0, g: 0, b: 0 },
      fadeAlpha: 0.08,
      depthRange: {
        speed:   { min: 0.3, max: 2.0 },
        size:    { min: 8,   max: 20 },
        brightness: { min: 0.15, max: 1.0 },
        glow:    { min: 0,   max: 0.6 },
        trail:   { min: 0,   max: 15 },
      },
      colorStops: [
        { threshold: 0.7, color: { r: 255, g: 255, b: 255 } },
        { threshold: 0.4, color: { r: 150, g: 150, b: 150 } },
        { threshold: 0,   color: { r: 60,  g: 60,  b: 60 } },
      ],
      glowBlur: { head: 10, trail: 8 },
    },
  };

  let currentTheme = THEMES.DEFAULT;
  const themeList = [THEMES.DEFAULT, THEMES.SEPIA, THEMES.MONO];
  let themeIndex = 0;

  const themeBtn = document.createElement('button');
  themeBtn.textContent = '◉';
  themeBtn.setAttribute('aria-label', 'Cycle theme');
  themeBtn.style.cssText = [
    'position:fixed',
    'bottom:calc(20px + env(safe-area-inset-bottom,0px))',
    'left:20px',
    'width:40px',
    'height:40px',
    'border-radius:50%',
    'border:1px solid rgba(255,255,255,0.3)',
    'background:rgba(0,0,0,0.5)',
    'color:rgba(255,255,255,0.8)',
    'font-size:18px',
    'cursor:pointer',
    'z-index:20',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'touch-action:manipulation',
    '-webkit-tap-highlight-color:transparent',
    'user-select:none',
  ].join(';');
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeIndex = (themeIndex + 1) % themeList.length;
    currentTheme = themeList[themeIndex];
  });
  document.body.appendChild(themeBtn);

  // ── Depth-based config ───────────────────────────────────────────
  function depthConfig(d, theme) {
    const r = theme.depthRange;
    return {
      speed: r.speed.min + d * (r.speed.max - r.speed.min),
      size: r.size.min + d * (r.size.max - r.size.min),
      brightness: r.brightness.min + d * (r.brightness.max - r.brightness.min),
      glow: r.glow.min + d * (r.glow.max - r.glow.min),
      trail: Math.floor(r.trail.min + d * (r.trail.max - r.trail.min)),
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
  function dropColor(d, alpha, theme) {
    for (const stop of theme.colorStops) {
      if (d > stop.threshold) {
        return `rgba(${stop.color.r}, ${stop.color.g}, ${stop.color.b}, ${alpha})`;
      }
    }
    const last = theme.colorStops[theme.colorStops.length - 1].color;
    return `rgba(${last.r}, ${last.g}, ${last.b}, ${alpha})`;
  }

  // ── Ripple system ─────────────────────────────────────────────────
  const RIPPLE = {
    maxRadius: 120,
    duration: 40,
    lineWidth: 2,
    rings: 3,
  };
  let ripples = [];

  function addRipple(x, y) {
    ripples.push({
      x, y,
      radius: 0,
      alpha: 0.7,
      maxRadius: RIPPLE.maxRadius * (0.8 + Math.random() * 0.4),
    });
  }

  function updateRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.maxRadius / RIPPLE.duration;
      r.alpha -= 0.7 / RIPPLE.duration;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
      }
    }
  }

  function drawRipples(ctx) {
    const c = currentTheme.colorStops[0].color;
    for (const r of ripples) {
      for (let ring = 0; ring < RIPPLE.rings; ring++) {
        const ringRadius = r.radius - ring * 12;
        if (ringRadius <= 0) continue;
        const alpha = r.alpha * (1 - ring / RIPPLE.rings);
        ctx.beginPath();
        ctx.arc(r.x, r.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
        ctx.lineWidth = RIPPLE.lineWidth * (1 - ring / RIPPLE.rings * 0.5);
        ctx.stroke();
      }
    }
  }

  // ── Audio system ──────────────────────────────────────────────────
  const AUDIO = {
    enabled: true,
    masterVolume: 0.04,
    droneFreq: 55,
    droneVolume: 0.03,
    noiseVolume: 0.015,
    noiseFilterFreq: 2000,
    noiseFilterQ: 1,
    lfoRate: 0.15,
    lfoDepth: 0.5,
  };

  let audioCtx = null;
  let audioNodes = null;
  let audioInitialized = false;

  function initAudio() {
    if (audioInitialized) return;
    audioInitialized = true;

    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();

    const drone = audioCtx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = AUDIO.droneFreq;

    const droneGain = audioCtx.createGain();
    droneGain.gain.value = AUDIO.droneVolume;

    const dronePan = audioCtx.createStereoPanner();
    dronePan.pan.value = 0;

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = AUDIO.lfoRate;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = AUDIO.lfoDepth;
    lfo.connect(lfoGain);
    lfoGain.connect(dronePan.pan);

    const noiseLength = audioCtx.sampleRate * 4;
    const noiseBuffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = AUDIO.noiseFilterFreq;
    noiseFilter.Q.value = AUDIO.noiseFilterQ;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = AUDIO.noiseVolume;

    const master = audioCtx.createGain();
    master.gain.value = AUDIO.masterVolume;

    drone.connect(droneGain);
    droneGain.connect(dronePan);
    dronePan.connect(master);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    master.connect(audioCtx.destination);

    drone.start();
    lfo.start();
    noise.start();

    audioNodes = { drone, lfo, noise, master, droneGain, noiseGain, dronePan, lfoGain, noiseFilter };
  }

  function startAudio() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function stopAudio() {
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend();
    }
  }

  function toggleMute() {
    if (!audioCtx) return;
    if (audioCtx.state === 'running') {
      stopAudio();
    } else {
      startAudio();
    }
  }

  // Mute toggle button
  const muteBtn = document.createElement('button');
  muteBtn.textContent = '♪';
  muteBtn.setAttribute('aria-label', 'Toggle audio');
  muteBtn.style.cssText = [
    'position:fixed',
    'bottom:calc(20px + env(safe-area-inset-bottom,0px))',
    'right:20px',
    'width:40px',
    'height:40px',
    'border-radius:50%',
    'border:1px solid rgba(255,255,255,0.3)',
    'background:rgba(0,0,0,0.5)',
    'color:rgba(255,255,255,0.8)',
    'font-size:18px',
    'cursor:pointer',
    'z-index:20',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'touch-action:manipulation',
    '-webkit-tap-highlight-color:transparent',
    'user-select:none',
  ].join(';');
  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMute();
  });
  document.body.appendChild(muteBtn);

  // Visibility change — suspend audio when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAudio();
    } else {
      startAudio();
    }
  });

  // ── Render loop ──────────────────────────────────────────────────
  let frame = 0;

  function render() {
    frame++;

    updateRipples();

    // Fade background
    ctx.fillStyle = `rgba(${currentTheme.background.r}, ${currentTheme.background.g}, ${currentTheme.background.b}, ${currentTheme.fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < cols; i++) {
      const d = depths[i];
      const cfg = depthConfig(d, currentTheme);

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
        ctx.fillStyle = dropColor(d, trailAlpha, currentTheme);

        if (j === 1) {
          if (cfg.glow > 0.1) {
            ctx.shadowColor = dropColor(d, cfg.glow, currentTheme);
            ctx.shadowBlur = currentTheme.glowBlur.trail * cfg.glow;
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
      ctx.shadowColor = dropColor(d, cfg.glow, currentTheme);
      ctx.shadowBlur = currentTheme.glowBlur.head * cfg.glow;
      ctx.fillStyle = dropColor(d, headAlpha, currentTheme);
      ctx.fillText(pickChar(d), i * 16, drops[i]);
      ctx.shadowBlur = 0;

      if (Math.random() < 0.02) {
        heads[i] = Math.random() * 30;
      }
    }

    drawRipples(ctx);

    requestAnimationFrame(render);
  }

  // ── Input ────────────────────────────────────────────────────────
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    const p = getPos(e);
    addRipple(p.x, p.y);
  }, { passive: false });

  canvas.addEventListener('click', (e) => {
    initAudio();
    const p = getPos(e);
    addRipple(p.x, p.y);
  });

  // ── Start ────────────────────────────────────────────────────────
  render();
})();
