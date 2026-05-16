# Matrix / Digital Rain / Baudrillard — 2026-05-16

## Goal

Transform norman-rain into a hyperreal digital rain piece. Deepen the thematic coherence around simulation, increase visual density, and weave digital audio artifacts into the soundscape.

## Changes

### Feature 1: Matrix Green Theme (canonical default)

- Add `MATRIX` theme to `THEMES` — classic green (#00FF41) color stops, very dark green background
- Set `currentTheme = THEMES.MATRIX` and `themeList[0] = MATRIX`
- Update `index.html` background to `#000a00`, orb to green radial gradient
- Update title to include "Simulacra and Simulation"

### Feature 2: Visual Density

- Reduce column spacing: `COL_SPACING = 12` (was hardcoded `16`) — 33% more columns
- `Matrix` theme depth ranges: trail `10–30` (was `0–15`), speed `0.5–3.0`, glow `0.1–0.8`
- Add `monospace` to font stack for cyber aesthetic
- Add `CODE` character pool — `{}[]();=>.:/\\+-*&|!<>?@#$%^_~"\'`
  distributed through `pickChar()` alongside CJK/script characters

### Feature 3: Digital Rain Audio

Keep existing drone + bandpassed noise. Add:

- **Bit-crushing:** WaveShaperNode (6-bit quantization) inserted in the noise path — digital artifact texture
- **Dial-up tones:** Alternating 1070Hz/1270Hz oscillator bursts every 15–20s, simulating modem handshake
- **Synthetic blips:** Random sine/triangle oscillator pings every 4–7s with fast exponential decay envelope
- Clean timeout-based scheduling that suspends/resumes with audio context

### Feature 4: Baudrillard Philosophical Anchor

- **Quote overlay:** DOM element fading Baudrillard quotes in/out every 45s (first at 30s)
- **"/>" code button:** Toggles an info overlay (top-left) showing FPS, column count, theme, audio state, "Simulacra and Simulation" — the aesthetic of "seeing the code"
- `CODE` characters in the rain visually suggest code/simulation breaking through

## Files Changed

- `app.js` — all structural changes
- `index.html` — background, orb colors, subtitle
- `docs/2026-05-16-matrix-digital-plan.md` — this file

## Verification

1. Open `index.html` — no console errors
2. Default theme is Matrix green — bright green characters on dark green/black
3. Rain is visibly denser — more columns, longer trails
4. Audio plays on first click/tap: noise + drone + occasional dial-up tones and blips
5. Baudrillard quote fades in after 30s at bottom of screen
6. `</>` button toggles code overlay showing simulation state
7. Theme cycle button still works through all 4 themes
