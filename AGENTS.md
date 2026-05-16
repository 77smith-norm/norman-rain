# AGENTS.md — norman-rain

## What This Is

A single-page generative art piece: tranquil character rain with depth. Pure HTML + CSS + vanilla JS. No dependencies. Deployed to GitHub Pages.

## Stack

- Single `index.html` + `app.js`
- Canvas 2D rendering at 60fps
- CJK / Greek / Cyrillic / Swedish / Latin character sets
- Depth-based column rendering (speed, size, brightness, glow)
- iOS Safari responsive with safe-area insets

## Project Structure

```
norman-rain/
├── index.html        # Page shell, meta tags, safe-area CSS, orb
├── app.js            # Canvas render loop, drop system, character pools
├── AGENTS.md         # This file
├── .gitignore
└── .github/
    └── workflows/
        └── deploy.yml   # GitHub Actions → GitHub Pages
```

## Build & Test

- **Preview:** open `index.html` in any browser
- **Mobile:** view on iOS Safari — full-screen, safe-area respected, no zoom
- **Validate:** check FPS in Safari DevTools (or any browser perf monitor) — target 60fps

## TCR+R Discipline

All implementation follows TCR+R. Every change, without exception.

**The cycle:**
1. Write the test that describes the next piece of work
2. Run the test suite (expect RED — feature doesn't exist yet)
3. Write the implementation
4. Run the test suite (expect GREEN)
5. GREEN → commit immediately | RED → revert immediately, decompose, retry
6. Small cycles: 5–10 minutes max per cycle, then a commit or revert
7. Never let RED persist. Never commit while tests are failing.

**After each session:** 2-minute reflection — what worked, what didn't, what to improve next time.

## Plans

Plans live in `docs/` named `YYYY-MM-DD-<feature>-plan.md`.

## Compaction Recovery

If context compacts:
1. `cat docs/YYYY-MM-DD-x-plan.md`
2. `git log --oneline -20`
3. Open `index.html` in browser — confirm visual behavior
4. Resume from next incomplete step. Do not restart. Do not re-implement committed work.

## Off-Limits

- Do not add build tools, bundlers, or frameworks. This is vanilla HTML/JS.
- Do not modify `index.html` meta tags (iOS Safari full-screen config).
- Do not change git user config.

## References

- Harness: [refs/DEVELOPMENT.md](../../refs/DEVELOPMENT.md)
- Coding agent: [skills/coding-agent/SKILL.md](../../skills/coding-agent/SKILL.md)
- ACP routing: [skills/acp-router/SKILL.md](../../skills/acp-router/SKILL.md)
