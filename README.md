# 雨 norman-rain

![Norman Rain Logo](norman-rain.png)

> *Simulacra and Simulation* — a generative character rain experience.
>
> *The simulacrum is never what hides the truth — it is the truth that hides that there is none.*

**norman-rain** is a single-page generative art piece: tranquil cascades of characters drawn from CJK, Greek, Cyrillic, Swedish, and Latin scripts, with depth-based rendering, interactive ambient audio, and multiple visual themes. Pure HTML + CSS + vanilla JS — no dependencies.

---

## Features

- **Depth-based column rendering** — every column rains independently with randomized speed, size, brightness, and glow
- **4 themes** — Matrix, Default, Sepia, and Mono — cycle via the ◉ button
- **Ambient audio** — a low drone, filtered noise, and periodic dial-up/blip textures
- **The Stillness Beneath** — press/touch to create a stillness void that slows and dims the rain around your cursor
- **Baudrillard quotes** — periodic overlays from *Simulacra and Simulation*
- **Interactive code overlay** — toggle `</>` to see live stats (FPS, columns, theme, audio state)
- **iOS Safari responsive** — full-screen with safe-area insets, no zoom

---

## Quick Start

```
open index.html
```

That's it. Open the file in any modern browser and the rain begins.

---

## Themes

| Button | Theme    | Description                         |
|--------|----------|-------------------------------------|
| ◉      | Matrix   | Green-on-black, deep glow, fast     |
|        | Default  | Cool blue-white, softer fall        |
|        | Sepia    | Warm brown ambient, paper-like      |
|        | Mono     | Monochrome grayscale, minimal       |

Tap the ◉ button in the bottom-left corner to cycle through themes.

---

## Interaction

| Input                | Effect                                                   |
|----------------------|----------------------------------------------------------|
| Click / Touch        | Initiates audio; creates a stillness void at the point   |
| Drag / Move          | Moves the stillness void, slowing and dimming rain there |
| Release              | Void disperses, rain resumes                             |
| ◉ (bottom-left)      | Cycle visual theme                                       |
| `</>` (bottom-left)  | Toggle live debug overlay (FPS, cols, theme, audio)      |
| ♪ (bottom-right)     | Toggle audio on/off                                      |

---

## Project Structure

```
norman-rain/
├── index.html          # Page shell, meta tags, safe-area CSS, orb
├── app.js              # Canvas render loop, drop system, audio, input
├── AGENTS.md           # Agent/development instructions
├── LICENSE             # MIT License
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions → GitHub Pages
└── docs/               # Development plans
```

---

## Stack

- **Canvas 2D** — 60fps render loop with `requestAnimationFrame`
- **Web Audio API** — procedural drone, filtered noise, dial-up/blip patterns
- **Vanilla JS** — no frameworks, no build tools, no dependencies
- **CSS env(safe-area-inset-\*)** — full-screen iOS Safari support

---

## Deploy

Pushes to `main` automatically deploy to GitHub Pages via the included workflow.

---

## License

MIT — see [LICENSE](LICENSE). Copyright 2026 Russell Dillin.
