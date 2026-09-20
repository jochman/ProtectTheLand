# נצחון מוחלט / Total Victory

A mobile-first, bilingual (Hebrew/English) educational strategy simulation. The player balances a finite force between eight sovereign-border checkpoints and isolated outposts: moving a guard to an outpost can leave a checkpoint exposed.

The game is a client-side React application; it has no backend or external game assets. It uses procedural Web Audio, an SVG map, and a reducer-driven simulation.

## Play

1. Build an outpost (₪100) and let its construction finish.
2. Deploy a troop to garrison it. This opens a border gap if that troop came from a checkpoint.
3. Restore checkpoint coverage with reserves, available troops, or a recall.
4. After the tutorial, staff three outposts, keep all eight checkpoints staffed, and repel three consecutive tactical threats to reach rational victory.

If Homeland HP reaches zero, or the ready "יהוה צבאות" satire button is tapped five times while border defense is at 25% or below, the campaign ends in catastrophe. The header provides pause, sound, fullscreen, restart, guide, strategy desk, and Hebrew/English controls.

## Requirements

- Node.js 26 or newer
- npm 12 or newer

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The interface is designed for a 390 × 844 mobile viewport and remains contained within `100dvh` without vertical scrolling.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and generate the production bundle in `dist/`. |
| `npm test` | Run the reducer and game-rule test suite. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run update-spec` | Synchronize the specification metadata after an iteration. |

## Project structure

- `src/game/` — reducer, game rules, map data, threats, and news content.
- `src/components/` — the mobile frame, SVG map, action deck, accessibility controls, and modal surfaces.
- `src/locales/` — Hebrew and English translation catalogs.
- `src/audio/` — procedural Web Audio sound engine.
- `spec.md` — the complete game design and technical source of truth.

## Deployment

The app builds as a static Vite SPA. The repository's GitHub Pages workflow deploys pushes to `main` on `origin`.

## License and context

This project uses a satirical, educational framing to illustrate the strategic costs of spreading a finite force across isolated positions. Review `spec.md` for the complete mechanics, narrative framing, accessibility behavior, and technical architecture.
