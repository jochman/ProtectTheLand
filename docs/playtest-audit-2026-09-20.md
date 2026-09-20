# Game design and playtest audit — 2026-09-20

Reviewed the current working tree, including its existing uncommitted tactical-threat changes. This is an audit; runtime behavior and balance were not changed. Suggested fixes below are proposals, not newly adopted rules.

**Subsequent implementation:** The user confirmed that players must expand to at least three outposts and defend them and the border through several attacks. The game now requires three consecutive successful defenses with at least three staffed outposts and all eight border posts staffed. Dismantling below three and failed battles reset progress, resolving finding 2 below. The original findings and test counts are retained as the audit record; current rules and verification live in `spec.md`. The other audit findings remain open.

## Confirmed findings, in priority order

### 1. High — the tutorial can ask for an impossible next action

**Reproduce:** Start → build the first outpost → wait for completion → call reserves before deploying manually.

Reserves automatically staff the outpost. The tutorial still says “2/3 · Select Deploy and preview the cost,” but Deploy is disabled because no unguarded outpost exists. Waiting another 200 simulation seconds leaves the tutorial at `deploy`, with no tactical threats. Evacuating that outpost leaves zero outposts and the same deployment instruction. Building another outpost and deploying manually can recover the run; this is a stalled guided path rather than an irreversible game lock.

**Cause:** Tutorial progression recognizes the `DEPLOY_TROOP` action, while `CALL_RESERVES` can achieve the same garrison state. There is also no tutorial rollback when all outposts disappear. See `src/game/gameReducer.ts:214–225,689` and `src/components/BottomActionDeck.tsx:19–20,34`.

**Suggested fix:** Advance the tutorial from achieved board conditions, accepting automatic garrisoning as deployment. Recompute the appropriate instruction when its target disappears. Explain reserve deployment without claiming that a border gap necessarily opened.

**Regression coverage:** Reserve-first and reserve-after-build flows; evacuation or destruction before first deployment; both locales; tutorial must lead to a currently available action.

Screenshot: `/tmp/octgame-audit-tutorial.png`.

### 2. Medium — an outpost destroyed in battle can award rational victory

**Reproduce in a reducer fixture:** Complete the tutorial, reach three completed outposts, staff all checkpoints, leave no raids or construction, and let the sole active threat destroy an outpost with 15 durability. With 100 homeland HP and three missing defenders, the battle removes 18 homeland HP and the third outpost. The result is `rational_victory` at 82 HP alongside “outpost lost” feedback.

This boundary state was directly verified; it was not a complete natural browser playthrough. A separate idle three-outpost simulation ended in defeat, so losing an outpost does not universally produce a win.

**Cause:** `src/game/rules.ts:43` checks peak and current outpost counts, without distinguishing deliberate evacuation from destruction. `src/game/threats.ts:61` removes destroyed outposts before the shared victory check runs. The victory screen nevertheless describes security as restored and raids as stopped.

**Suggested decision:** If victory is intended to recognize a deliberate policy reversal, track voluntary contraction after expansion. If battlefield losses may count, explicitly document that rule and make the ending explain the actual outcome. Add a dedicated loss-versus-evacuation victory test.

### 3. Medium — the reinforcement dialog breaks forward keyboard navigation

**Reproduce:** Open a threat while more support is needed → focus Close → press Tab repeatedly with the transfer disclosure collapsed.

Observed focus sequence: Close → Send available troop → “Transfer a guard from another post” summary → Close, repeating. Forward Tab cannot reach the reserve and return-to-map buttons below the disclosure. Escape does work.

**Cause:** The focus trap in `src/components/ThreatCommand.tsx:56–59` collects only buttons. A native `summary` receives focus but is absent from that list, so its index is −1 and the next Tab resets to the first button. The list also includes buttons inside a collapsed disclosure.

**Suggested fix:** Include every visible focusable control, including `summary`, and wrap only at the actual first and last controls. Exclude hidden disclosure contents. Test forward/backward Tab with the disclosure both open and closed.

Screenshot: `/tmp/octgame-audit-keyboard.png`.

### 4. Medium — equivalent troop movements give different resilience rewards

**Reproduce in a reducer comparison:** Begin at 50 homeland HP with one border gap, one guarded outpost, no spare troops and no raid. Compare sealing the gap through `SEAL_BREACH` with recalling that same guard through `RECALL_TROOP`.

Both finish with the same troop positions. Sealing yields 52 HP; recalling yields 50 HP. Sealing using a spare troop gives no immediate HP bonus, while the reserve fallback can grant 3 HP. Some interception branches grant 5 HP. The control does not disclose these differences.

**Cause:** Healing is embedded in individual branches of `src/game/gameReducer.ts:1645,1733`, rather than tied to the outcome. The normal recall path has no equivalent reward.

**Suggested decision:** Define one recovery rule based on what happened—gap closed or raid intercepted—independent of which UI control or troop source performed it. Alternatively, retain deliberate source-specific rewards and explain them in the preview. Test equivalent paths against the chosen rule.

### 5. Medium — English news still contains Hebrew location names

**Reproduce:** Switch to English → build Ariel → deploy from a checkpoint → seal the gap.

Observed headline: “Emergency containment: Soldier recalled from אריאל to seal the border breach.” The recall headline has the same construction. Raid-impact bilingual strings also interpolate the single already-localized `targetCityName`, so later language switching can retain the previous language's city name.

**Cause:** Dynamic English news reads `settlementName` directly at `src/game/gameReducer.ts:1638,1843`; the shared `tileName(tile, locale)` lookup is already available elsewhere. Raid-impact news builds both language fields from one display string.

**Suggested fix:** Resolve names separately for each stored language field. Check newly generated news and history after toggling languages in both directions.

### 6. Low — phone layout fits, but map targets are difficult to tap and read

At 320×568, the measured outpost button bounds were approximately 25×25 CSS pixels. Screenshot inspection also shows very small location labels. The existing tests correctly verify zero scrolling and the 220px minimum map height, but those assertions do not measure interaction comfort or readability.

**Suggested improvement:** Provide a readable location list or map detail view for precise selection. Any larger invisible hit areas need overlap checks because locations are close together. Keep the zero-scroll main layout intact.

Screenshots: `/tmp/octgame-threat-en-320x568.png`, `/tmp/octgame-threat-he-568x320.png`.

## Further design questions

- **Victory requires expansion first.** A player who secures the board without reaching three outposts cannot win. This is explicitly specified, so it is not an implementation bug. Decide whether the intended learning outcome requires making that mistake, or whether a sustained secure-board alternative would better fit the educational message.
- **Calling reserves silently assigns troops.** It fills border gaps, then empty outposts, then the free pool. Consequently “+4” does not mean four troops available to dispatch to a threat. Preview the allocation so a call-up is a predictable decision.
- **Threat rules change at tutorial completion.** Random local clashes stop and timed tactical threats start. The transition could explain the new need for temporary support and the fact that even a guarded outpost can be understaffed for a battle.

## Verification and limits

- `npm test`: all 30 existing reducer tests passed.
- `npm run build`: TypeScript and Vite passed.
- Existing Chromium browser suite passed in Hebrew and English at 320×568, 360×640, 390×844, 430×932, 568×320, 844×390 and 1280×720, including active-threat layouts, tutorial, victory, defeat, restart and reinforcement flows. No page errors were reported by that suite.
- Additional browser reproductions confirmed the reserve tutorial stall, stale instruction after evacuation, broken Tab sequence and small target size. Screenshots were visually inspected.
- Additional reducer probes confirmed the destruction/victory boundary, path-dependent healing and English news leak. Temporary runners are `/tmp/octgame-audit.mjs` and `/tmp/octgame-audit-browser.mjs`; they use the local Vite and installed Chromium/Playwright runtime.
- Firefox, Safari, real touch hardware, screen readers and long-duration performance were not tested.

Recommended implementation order: tutorial progression, keyboard navigation, dynamic localization, then explicit decisions and tests for victory attribution and recovery rewards.
