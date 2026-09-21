# נצחון מוחלט / Total Victory

A mobile-first, bilingual (Hebrew/English) educational strategy simulation. The player balances a finite force between eight sovereign-border checkpoints and isolated outposts: moving a guard to an outpost can leave a checkpoint exposed.

The game is a client-side React application; it has no backend or external game assets. It uses procedural Web Audio, an SVG map, and a reducer-driven simulation.

## Play

1. Build an outpost (₪100) and let its construction finish.
2. Deploy a troop to garrison it. This opens a border gap if that troop came from a checkpoint.
3. Restore checkpoint coverage with reserves, available troops, or a recall.
4. After the tutorial, keep expanding toward every settlement site while responding to an endless sequence of tactical threats.

There is no victory state: even establishing and staffing all 17 settlement sites does not end the war. The "יהוה צבאות" satire button advances at 3 settlements, 8 settlements and full-map conquest, and becomes fully operational only when every settlement is guarded. Five operational taps end the campaign in catastrophe. Israel begins with 100,000 citizens alive, every successful hit kills citizens permanently, and reaching zero also ends in catastrophe. The compact header provides pause, language and a game menu containing the remaining settings and guidance.

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
