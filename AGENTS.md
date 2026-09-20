# Project Guidelines & Rules: "נצחון מוחלט" ("Total Victory" / "October 7")

## 1. Spec Maintenance Rule (MANDATORY ON EVERY ITERATION)
- **Continuous Spec Synchronization:** At the conclusion of EVERY iteration where features, bugfixes, game balance, UI adjustments, audio, or architectural decisions are made:
  1. You **MUST** update `spec.md` to reflect all decisions, formulas, architecture, and UI behavior.
  2. Maintain `spec.md` as the single source of truth so the user or any developer can pick up and run with the complete project anywhere.
  3. Ensure metadata synchronization via `npm run update-spec` or `./scripts/update-spec-version.sh`.

## 2. Mobile Viewport Architecture (Zero-Scroll Guarantee)
- The entire game interface (`HeaderBar`, `TopStatusPill`, `NewsAlertTicker`, `HexMapCanvas`, and `BottomActionDeck` with all 4 buttons including **"יהוה צבאות"**) must fit on a single screen (`100dvh`) with **strictly zero vertical scrolling** on mobile devices.
- `HexMapCanvas` uses responsive flex-scaling (`flex-1 min-h-[220px] max-h-full overflow-hidden` with `preserveAspectRatio="xMidYMid meet"`).

## 3. Bilingual Localization Parity
- All UI text, buttons, modals, floating tickers, breaking alerts, and news items must support both **Hebrew (`he`, RTL)** and **English (`en`, LTR)** with equal fidelity.

## 4. Verification & Build
- Verify every iteration with `npm run build` (TypeScript check `tsc` + Vite bundle) ensuring 0 errors before committing.

## 5. Git Commit and Push Delegation
- For commit-message drafting and `git push` work, delegate to the lowest-cost available model that can reliably perform the task (currently `gpt-5.6-luna`).
- Keep the delegated Git work scoped to the files and remote explicitly authorized by the user; do not include unrelated working-tree changes.
