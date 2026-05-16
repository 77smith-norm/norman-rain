# Features Plan — 2026-05-16
## Status: COMPLETED — 2026-05-16

## Overview

Three features to extend the Norman Rain generative art piece, each independent but layered on the same architecture. No build tools, no frameworks — pure HTML/CSS/JS.

## Feature 1: Selectable Color Themes

### Goal

Replace hardcoded depth/color values with a structured theme object. Provide a `default` theme matching the current look, plus 2–3 additional themes. Add a minimal UI to cycle through themes.

### Architecture

- `app.js`: define a `const THEMES = { default: {...}, sepia: {...}, mono: {...} }` object at module scope
- Each theme specifies:
  - `background` — base canvas fill color (RGB)
  - `fadeAlpha` — trail fade transparency
  - `depthRange` — interpolation bounds for `{ speed, size, brightness, glow, trail }`
  - `colorStops` — ordered array of `{ threshold, color }` for per-depth color selection
- `depthConfig(d, theme)` reads from `theme.depthRange` instead of magic numbers
- `dropColor(d, alpha, theme)` walks `theme.colorStops` instead of if/else chain
- `currentTheme` variable references active theme; all render functions thread `currentTheme`
- Theme-switch UI: small fixed button in lower-left or cycle-on-tap (tap toggles next theme)

### Implementation Steps

1. Define `THEMES` object with `default` theme matching current hardcoded values
2. Refactor `depthConfig(d)` → `depthConfig(d, theme)`
3. Refactor `dropColor(d, alpha)` → `dropColor(d, alpha, theme)`
4. Thread `currentTheme` through `render()` — one line change in the render loop
5. Add 2+ additional themes (e.g. `sepia: warm brown/orange tones`, `mono: white-to-gray`)
6. Add minimal theme-switch UI (a small `◉` button or tap-cycle)
7. Verify each theme renders without console errors

## Feature 2: Interactive Splash Ripples

### Goal

When the user clicks or taps on the canvas, ripples emanate from the click point — concentric ellipses that expand and fade, displacing nearby raindrop columns.

### Architecture

- New `ripples` array — each entry: `{ x, y, radius, maxRadius, alpha }` 
- On `click`/`touchstart`: create a ripple at event coordinates
- Per-frame: update ripple radius, fade alpha; remove when `alpha <= 0`
- Draw ripple as expanding stroked circle (or ellipse) beneath the rain layer
- Optional: slightly shift adjacent columns' drop positions outward from ripple center for a displacement effect

### Implementation Steps

1. Add `ripples = []` array
2. Add `RIPPLE` config constants: `{ maxRadius: 120, duration: 40, lineWidth: 2, rings: 3 }`
3. Implement `addRipple(x, y)` — pushes new ripple entries
4. Update `click`/`touchstart` handlers to call `addRipple`
5. Implement `updateRipples()` — advance radius, fade alpha, remove dead ripples
6. Implement `drawRipples(ctx)` — draw each ripple as expanding concentric rings
7. Call `updateRipples()` and `drawRipples()` in `render()`
8. Verify: click/tap creates visible ripples that expand and fade smoothly

## Feature 3: Ambient Audio

### Goal

Subtle generative ambient audio using the Web Audio API — no audio files, everything synthesized. Low drone or rain-like texture that fades in/out or responds to visual state.

### Architecture

- Web Audio API: `AudioContext` created on first user gesture (browser autoplay policy)
- Audio graph:
  ```
  OscillatorNode (low frequency drone)
    → GainNode (subtle, 0.02–0.05)
    → StereoPannerNode (gentle LFO pan)
    → AudioDestination
  
  Noise source (rain texture via BufferSource of random samples)
    → BiquadFilterNode (bandpass, gentle)
    → GainNode (0.01–0.03)
    → AudioDestination
  ```
- `AudioContext` lifecycle: create on first user interaction, suspend/resume on visibility change
- Optional: tie audio parameters to visual state (e.g., number of columns affects noise density)

### Implementation Steps

1. Add `AUDIO` config object: `{ enabled: true, masterVolume: 0.05, droneFreq: 55, noiseFilterFreq: 2000 }`
2. Implement `initAudio()` — create `AudioContext`, build audio graph
3. Implement `startAudio()` / `stopAudio()` — resume/suspend context
4. Wire `initAudio()` into the first `click`/`touchstart` handler (autoplay policy)
5. Add visibility change listener (suspend when tab hidden)
6. Verify: audio plays on first interaction, stops on tab hide, no console errors
7. Optional: add a mute toggle UI

## Sequence

These features are independent within the render loop — each adds a concern that doesn't break the others. Recommended order:

1. Color themes (data refactor, no new render concern)
2. Splash ripples (new render pass, plus input)
3. Ambient audio (new subsystem, no render changes)

Each feature gets its own commit. TCR+R applies per feature.
