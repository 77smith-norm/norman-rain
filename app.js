// norman-rain — generative character rain / simulacra
// Canvas 2D, 60fps, depth-based rendering, Baudrillard's hyperreal

(() => {
  'use strict';

  // ── Character pools ──────────────────────────────────────────────
  const CJK = 'の雨に溶ける空の文字が降る森の静けさ風が運ぶ花びら星の光川の流れ山の声雲の影月の明かり朝の露夜の闇桜の咲く道雪の降る夜秋の紅葉冬の雪春の訪れ夏の蝉';
  const GREEK = 'αβγδεζηθικλμνξοπρστυφχψω';
  const CYRILLIC = 'абвгдежзийклмнопрстуфхцчшщъыьэюя';
  const SWEDISH = 'åäö';
  const LATIN = 'abcdefghijklmnopqrstuvwxyz';
  const SYMBOLS = '・。、ー，。！？；：？「」『』【】〔〕〈〉《》〈〉';
  const CODE = '{}[]();=>.:/\\+-*&|!<>?@#$%^_~"\'';

  // ── Baudrillard ──────────────────────────────────────────────────
  const QUOTES = [
    'The simulacrum is never what hides the truth — it is the truth that hides that there is none.',
    'Simulation is no longer that of a territory, a referential being, or a substance.',
    'It is the generation by models of a real without origin or reality: a hyperreal.',
    'We live in a world where there is more and more information, and less and less meaning.',
    'The very definition of the real becomes: that of which it is possible to give an equivalent reproduction.',
  ];
  let quoteIndex = 0;
  let quoteVisible = false;

  // ── Code visibility / Info overlay ───────────────────────────────
  let showCode = false;

  // ── Canvas setup ─────────────────────────────────────────────────
  const canvas = document.getElementById('rain');
  const ctx = canvas.getContext('2d');

  let W, H, cols, drops, heads, depths;
  const COL_SPACING = 12;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.floor(W / COL_SPACING);
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
    MATRIX: {
      name: 'Matrix',
      background: { r: 0, g: 5, b: 0 },
      fadeAlpha: 0.05,
      depthRange: {
        speed:   { min: 0.5, max: 3.0 },
        size:    { min: 8,   max: 18 },
        brightness: { min: 0.2, max: 1.0 },
        glow:    { min: 0.1, max: 0.8 },
        trail:   { min: 10,  max: 30 },
      },
      colorStops: [
        { threshold: 0.7, color: { r: 0,   g: 255, b: 65  } },
        { threshold: 0.4, color: { r: 0,   g: 200, b: 50  } },
        { threshold: 0,   color: { r: 0,   g: 100, b: 25  } },
      ],
      glowBlur: { head: 12, trail: 10 },
    },
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

  let currentTheme = THEMES.MATRIX;
  const themeList = [THEMES.MATRIX, THEMES.DEFAULT, THEMES.SEPIA, THEMES.MONO];
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
      if (r < 0.6) return CJK[Math.floor(Math.random() * CJK.length)];
      if (r < 0.75) return GREEK[Math.floor(Math.random() * GREEK.length)];
      if (r < 0.9) return CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)];
      return CODE[Math.floor(Math.random() * CODE.length)];
    } else if (d > 0.4) {
      if (r < 0.35) return CJK[Math.floor(Math.random() * CJK.length)];
      if (r < 0.5) return GREEK[Math.floor(Math.random() * GREEK.length)];
      if (r < 0.65) return CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)];
      if (r < 0.8) return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      return CODE[Math.floor(Math.random() * CODE.length)];
    } else {
      if (r < 0.25) return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      if (r < 0.4) return LATIN[Math.floor(Math.random() * LATIN.length)];
      if (r < 0.55) return CODE[Math.floor(Math.random() * CODE.length)];
      if (r < 0.7) return GREEK[Math.floor(Math.random() * GREEK.length)];
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

  // ── Baudrillard overlay ──────────────────────────────────────────
  function createOverlay() {
    const el = document.createElement('div');
    el.id = 'baudrillard-quote';
    el.textContent = '';
    el.style.cssText = [
      'position:fixed',
      'bottom:calc(80px + env(safe-area-inset-bottom,0px))',
      'left:50%',
      'transform:translateX(-50%)',
      'font-family:"Courier New",monospace',
      'font-size:11px',
      'color:rgba(0,255,65,0.3)',
      'text-align:center',
      'pointer-events:none',
      'z-index:15',
      'transition:opacity 2s ease',
      'opacity:0',
      'max-width:80%',
      'line-height:1.4',
    ].join(';');
    document.body.appendChild(el);
    return el;
  }
  const quoteEl = createOverlay();

  function showQuote() {
    const q = QUOTES[quoteIndex];
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    quoteEl.textContent = '\u300c ' + q + ' \u300d\u2014 Jean Baudrillard';
    quoteEl.style.opacity = '1';
    quoteVisible = true;
    setTimeout(() => {
      quoteEl.style.opacity = '0';
      quoteVisible = false;
    }, 10000);
  }

  setTimeout(showQuote, 30000);
  setInterval(() => {
    if (!quoteVisible) showQuote();
  }, 45000);

  // ── Info / "See the code" panel ──────────────────────────────────
  function createInfoPanel() {
    const el = document.createElement('div');
    el.id = 'info-panel';
    el.style.cssText = [
      'position:fixed',
      'top:calc(20px + env(safe-area-inset-top,20px))',
      'left:20px',
      'font-family:"Courier New",monospace',
      'font-size:10px',
      'color:rgba(0,255,65,0.5)',
      'line-height:1.6',
      'pointer-events:none',
      'z-index:25',
      'display:none',
      'text-shadow:0 0 4px rgba(0,255,65,0.3)',
    ].join(';');
    document.body.appendChild(el);
    return el;
  }
  const infoEl = createInfoPanel();

  const codeBtn = document.createElement('button');
  codeBtn.textContent = '</>';
  codeBtn.setAttribute('aria-label', 'Toggle code overlay');
  codeBtn.style.cssText = [
    'position:fixed',
    'bottom:calc(20px + env(safe-area-inset-bottom,0px))',
    'left:70px',
    'width:40px',
    'height:40px',
    'border-radius:50%',
    'border:1px solid rgba(0,255,65,0.3)',
    'background:rgba(0,0,0,0.5)',
    'color:rgba(0,255,65,0.8)',
    'font-size:12px',
    'font-family:"Courier New",monospace',
    'font-weight:bold',
    'cursor:pointer',
    'z-index:20',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'touch-action:manipulation',
    '-webkit-tap-highlight-color:transparent',
    'user-select:none',
  ].join(';');
  codeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showCode = !showCode;
    infoEl.style.display = showCode ? 'block' : 'none';
  });
  document.body.appendChild(codeBtn);

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

  const DIGITAL = {
    enabled: true,
    dialUpInterval: 15000,
    blipInterval: 4000,
    dialUpFreq1: 1070,
    dialUpFreq2: 1270,
    dialUpVolume: 0.015,
    blipVolume: 0.02,
    bitCrushBits: 6,
  };

  let audioCtx = null;
  let audioNodes = null;
  let audioInitialized = false;
  let dialUpTimeout = null;
  let blipTimeout = null;
  let frameCount = 0;
  let lastFpsTime = 0;
  let displayFps = 60;

  function makeBitCrushCurve(bits, samples) {
    samples = samples || 44100;
    const steps = Math.pow(2, bits);
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i / samples) * 2 - 1;
      curve[i] = Math.round(x * steps) / steps;
    }
    return curve;
  }

  function playDialUpTone(startTime, freq, duration, volume) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  function playDialUpPattern() {
    if (!audioCtx || !DIGITAL.enabled) return;
    const t = audioCtx.currentTime;
    const f1 = DIGITAL.dialUpFreq1;
    const f2 = DIGITAL.dialUpFreq2;
    const vol = DIGITAL.dialUpVolume;
    for (let i = 0; i < 6; i++) {
      const toneTime = t + i * 0.18;
      const freq = i % 2 === 0 ? f1 : f2;
      playDialUpTone(toneTime, freq, 0.08, vol);
    }
    scheduleDialUp();
  }

  function scheduleDialUp() {
    clearTimeout(dialUpTimeout);
    dialUpTimeout = setTimeout(playDialUpPattern, DIGITAL.dialUpInterval + Math.random() * 5000);
  }

  function playBlip() {
    if (!audioCtx || !DIGITAL.enabled) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = 600 + Math.random() * 1400;
    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(DIGITAL.blipVolume, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
    scheduleBlip();
  }

  function scheduleBlip() {
    clearTimeout(blipTimeout);
    blipTimeout = setTimeout(playBlip, DIGITAL.blipInterval + Math.random() * 3000);
  }

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

    const bitCrush = audioCtx.createWaveShaper();
    bitCrush.curve = makeBitCrushCurve(DIGITAL.bitCrushBits);

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = AUDIO.noiseFilterFreq;
    noiseFilter.Q.value = AUDIO.noiseFilterQ;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = AUDIO.noiseVolume;

    const master = audioCtx.createGain();
    master.gain.value = AUDIO.masterVolume;

    noise.connect(bitCrush);
    bitCrush.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    drone.connect(droneGain);
    droneGain.connect(dronePan);
    dronePan.connect(master);

    master.connect(audioCtx.destination);

    drone.start();
    lfo.start();
    noise.start();

    audioNodes = { drone, lfo, noise, master, droneGain, noiseGain, dronePan, lfoGain, noiseFilter, bitCrush };

    scheduleDialUp();
    scheduleBlip();
  }

  function startAudio() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
      scheduleDialUp();
      scheduleBlip();
    }
  }

  function stopAudio() {
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend();
      clearTimeout(dialUpTimeout);
      clearTimeout(blipTimeout);
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

  const muteBtn = document.createElement('button');
  muteBtn.textContent = '\u266a';
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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAudio();
    } else {
      startAudio();
    }
  });

  // ── Render loop ──────────────────────────────────────────────────
  function render() {
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 1000) {
      displayFps = frameCount;
      frameCount = 0;
      lastFpsTime = now;
    }

    updateRipples();

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

      for (let j = 1; j <= cfg.trail; j++) {
        const y = drops[i] - j * cfg.size;
        if (y < 0) continue;

        const trailAlpha = (1 - j / cfg.trail) * cfg.brightness * 0.6;
        ctx.font = `${cfg.size}px "Noto Sans JP", "Hiragino Kaku Gothic Pro", "Yu Gothic", monospace, sans-serif`;
        ctx.fillStyle = dropColor(d, trailAlpha, currentTheme);

        if (j === 1) {
          if (cfg.glow > 0.1) {
            ctx.shadowColor = dropColor(d, cfg.glow, currentTheme);
            ctx.shadowBlur = currentTheme.glowBlur.trail * cfg.glow;
          }
          ctx.fillText(pickChar(d), i * COL_SPACING, y);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillText(pickChar(d), i * COL_SPACING, y);
        }
      }

      const headAlpha = cfg.brightness;
      ctx.font = `${cfg.size}px "Noto Sans JP", "Hiragino Kaku Gothic Pro", "Yu Gothic", monospace, sans-serif`;
      ctx.shadowColor = dropColor(d, cfg.glow, currentTheme);
      ctx.shadowBlur = currentTheme.glowBlur.head * cfg.glow;
      ctx.fillStyle = dropColor(d, headAlpha, currentTheme);
      ctx.fillText(pickChar(d), i * COL_SPACING, drops[i]);
      ctx.shadowBlur = 0;

      if (Math.random() < 0.02) {
        heads[i] = Math.random() * 30;
      }
    }

    drawRipples(ctx);

    if (showCode) {
      infoEl.innerHTML = [
        `FPS: ${displayFps}`,
        `Cols: ${cols}`,
        `Theme: ${currentTheme.name}`,
        `Audio: ${audioCtx ? audioCtx.state : 'uninit'}`,
        `Size: ${W}\u00d7${H}`,
        '\u2014',
        '\u300cSimulacra and Simulation\u300d',
        'Jean Baudrillard',
      ].join('<br>');
    }

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
