# Technical & Game Design Specification: "נצחון מוחלט" / "Total Victory"

> **Document Type:** Comprehensive Game Design & Technical Architecture Specification (`spec.md`)  
> **Target Platform:** Client-Side Web Application (Mobile-First 390px, Responsive Desktop Bezel, Zero-Backend)  
> **Primary Locale:** Hebrew (`he`, RTL) | **Secondary Locale:** English (`en`, LTR)  
> **Repository:** `/var/home/jochman/dev/octGame`
> **Last Synchronized:** 2026-09-20 18:11:23 UTC (Branch: `main`, Iteration #49)

---

## 1. Executive Summary & Core Message

**"נצחון מוחלט"** ("Total Victory", previously working title: *"7 באוקטובר" / "לא מצביעים בלי שיודעים"*) is an educational, satirical, and interactive mobile simulation game inspired by tactical analysis and political commentary (notably Yoni Haimovich's educational videos). 

The game places the player in the role of a policymaker/commander balancing sovereign border defense along the Green Line against political pressure to construct and garrison isolated outposts in the West Bank. Through accessible mobile idle/strategy mechanics (3D tactile clay-morphic interface, floating shekel coins, and an irresistible satirical **"יהוה צבאות"** false miracle button), players experience firsthand the direct zero-sum tradeoff: **every soldier sent to protect an isolated outpost is a soldier missing from the sovereign border.**

The game concludes in one of two fundamental narrative endings:
1. **The October 7 Catastrophe (`gameStatus: 'catastrophe'`):**
   - **Primary Tactical Trigger (Homeland HP Collapse):** Defense gaps left unsealed along the sovereign border continuously drain Homeland HP (`landHp`) by -0.4 HP/s per hole. Hostile infiltrations that penetrate gaps and reach Israeli cities inflict -12 HP and -10₪ damage. When Homeland HP drops to 0%, the nation's defenses collapse completely, sirens wail, and the October 7 defeat screen appears with a comprehensive policy post-mortem.
   - **Satirical Trigger (Messianic Idol Collapse):** If the border collapses to 0% defense, the false miracle button **"יהוה צבאות"** enters panic mode. Tapping it 7 times shatters the idol (`sounds.playCrackCollapse()`), exposing the tragedy of relying on miracles instead of sovereign strategy.
2. **Rational Victory ("ביטחון בר-קיימא", `gameStatus: 'rational_victory'`):**
   - **Strategic Awakening:** The player chooses sovereign security over messianic illusion.
   - **Victory Evaluation:** A shared `hasWon` check runs after every gameplay action. All victories require eight staffed checkpoints, no active raids, positive HP, and no unfinished construction. Returning forces through recalls, reserves, evacuation, or breach sealing can satisfy the objective.
   - **Open / Guided Play:** Experience an actual deployment, then restore security with at most two outposts.
   - **Defend First:** Survive 120 simulation seconds with at least 80 HP and 30 consecutive secure seconds. At seconds 30, 60, and 90, sectors 2, 4, and 6 respectively become unstaffed; the displaced troops remain available for redeployment by tapping a gap.
   - **Overextension:** At most two outposts and 15 consecutive secure seconds.
   - **Emergency Recovery:** At most two outposts, at least 80 HP, and 15 consecutive secure seconds.
   - Each completed objective stops the clock and displays a run-specific report and medals.

---

## 2. System Architecture & Tech Stack

### 2.1 Technology Choices

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | **React 19 + TypeScript + Vite** | Strict type safety for state machine transitions, high render performance, instantaneous hot reload. |
| **Styling** | **Tailwind CSS v4 + CSS Variables** | Native `dir="rtl"` and `dir="ltr"` support, 3D tactile clay-morphic button styling, custom drop shadows. |
| **Map Engine** | **Responsive SVG 2D Viewport** | Crisp rendering at all pixel densities (Retina/OLED), exact coordinate control, zero dynamic map resizing to eliminate layout shifts. |
| **Audio Engine** | **Web Audio API (Procedural Synthesizer)** | 100% client-side zero-asset sound generation; safe execution guards for non-browser/SSR environments. |
| **State Management** | **React `useReducer` Architecture** | Centralized transitions, seeded threat streams and simulation time. Existing sound calls remain reducer side effects; the reducer is not fully pure. |
| **Build & Deployment** | **Vite Static SPA Bundle (`dist/`)** | Zero backend requirement; statically deployable to GitHub Pages, Cloudflare Pages, Netlify, or AWS S3. |

### 2.3 GitHub Pages Deployment Branch
- The GitHub Pages workflow runs automatically only for pushes to `main` on `origin`; `master` is not a deployment branch or workflow trigger.

### 2.4 Specification Synchronization Hooks
- `scripts/update-spec-version.sh` is the shared metadata updater for both supported coding-agent workflows. It accepts `SPEC_SYNC_AGENT=agy` or `SPEC_SYNC_AGENT=codex` from the corresponding Stop hook and supports `manual` execution through `npm run update-spec`.
- `.agents/hooks.json` invokes the script for agy, and `.codex/hooks.json` invokes the same script for Codex. Both hooks update the `Last Synchronized` metadata in `spec.md`.
- `scripts/hooks/pre-commit` independently updates the staged copy of `spec.md`, preserving unrelated unstaged specification edits.
- Commit-message drafting and authorized pushes are delegated to the lowest-cost reliable model available, while preserving the user's selected files and remote.

### 2.2 Layout Strategy & Viewport Discipline
- **Primary Viewport:** Portrait mobile ratio (`390px x 844px`, base aspect ratio `9 / 19.5`).
- **Desktop Adaptation:** Centered, bezel-framed mobile mock within an ambient, textured desert-olive backdrop.
- **Strict Invariant Layout:** The map viewport height is strictly fixed. Floating emergency alerts, build banners, and toasts use absolute positioning with 0px layout impact, preventing any distracting map jumps during gameplay.
- **Safe Area Support:** Native support for `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.

---

## 3. Bilingual Localization & Dynamic i18n Engine

The game operates seamlessly in **Hebrew (`he`, RTL)** and **English (`en`, LTR)**.

### 3.1 Live Dynamic Translation Engine
- Toggling the language button in the header immediately:
  1. Updates `state.locale` (`'he' | 'en'`).
  2. Updates `document.documentElement.lang` and `dir` (`rtl` vs `ltr`).
  3. Translates current live ticker news item via `translateNewsItem()`.
  4. Translates all historical news items in `state.newsHistory` in-place.
  5. Translates UI labels, buttons, modals, and goal descriptions.
- Dynamic news items store bilingual fields (`headlineHe`, `headlineEn`, `sourceHe`, `sourceEn`).
- Legacy or story-arc news items dynamically fall back to arc-catalog lookups (`STORY_ARCS` and `STANDALONE_QUOTES`).

---

## 4. Game Entities & State Machine

### 4.1 State Machine Architecture

```
                    ┌───────────────────────────┐
                    │       INITIAL STATE       │
                    │ 8 Soldiers (at border)    │
                    │ 0 Settlements | Def: 100% │
                    │ Budget: 100₪ | Income: 4₪ │
                    └─────────────┬─────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
[Build Settlement]        [Call Reserves]             [Collect Shekels]
Cost: 100₪                +4 Troops (Max 3)           Floating Sea Coins
Places Outpost in WB      Slows Passive Income        +15₪ Cash Infusion
Demands Dedicated Troop   (-1₪/s per mobilization)    Golden Spark Burst
      │                           │                           │
      └───────────────────────────┴───────────────────────────┘
                                  │
                                  ▼
                         [Deploy Troops]
                 Soldiers moved: Border ➔ Outposts
                 Defense Score drops: 100% ➔ 88% ➔ 50% ➔ 25% ➔ 0%
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
 [Defense Drops Below 75%]                  [Defense Kept at 100%]
 Border tension, checkpoits unmanned        Dismantle outposts ("פינוי מאחז")
 Ungarrisoned outposts take clash damage    Recall troops to sovereign border
 Hostile pickup trucks raid Green Side cities           │
            │                                           ▼
            ▼                                  [RATIONAL VICTORY]
 [0% Defense / Infiltration Collapse]          Perimeter secure, reserves safe
 99.9% Panic-Mashing on "יהוה צבאות"            "ביטחון בר-קיימא" Modal
 Button shatters ("אין סומכין על הנס")
            │
            ▼
 [OCTOBER 7 CATASTROPHE]
 Full-screen defeat takeover & debrief
```

### 4.2 TypeScript Data Contract (`src/types.ts`)

The complete, compile-checked contract lives in `src/types.ts`; shared formulas and objective selectors live in `src/game/rules.ts`. The reducer wraps individual actions with resource normalization, event accounting, and scenario completion.

- Resources: budget, income, total soldiers, soldiers assigned to outposts, border/available soldiers, three reserve batches, resilience, and the eight checkpoint garrisons.
- `availableTroops = soldiersTotal - sum(tile.garrisonCount)`. These troops are available before recalling outpost troops or calling another reserve batch. The legacy `soldiersAtBorder` count includes this available pool; actual readiness always derives from staffed checkpoints.
- `elapsedSeconds` advances only on an unpaused simulation tick. `secureSeconds` counts consecutive ticks with no gaps or active raids and resets upon a gap/raid.
- `scenarioId`: `open | defend_first | overextension | recovery`; `seed` defaults to `7102023`.
- `tutorialStep`: `build | deploy | observe | done`. Non-tutorial scenarios start at `done`.
- Deployment UI: `isDeployMode`, `selectedSettlementId`, `pendingBorderId`; source selection previews a transfer, and only `DEPLOY_TROOP` confirms it.
- `metrics`: cumulative actual exposure, raid and outpost-loss HP damage (clamped to HP remaining at each hit), raids intercepted, miracle-button clicks, and reserve calls made during this run.
- `timeline`: simulation second, action/event kind, optional source/breach sector, gaps remaining, HP after action, and optional damage/interception count. It covers construction starts, deployments, reserves, recalls, evacuations, sealing, raid impacts, outpost losses and scheduled disruptions.
- UI pause sources: manual pause, introduction, strategy desk, news feed, settlement inspector, infiltration inspector and information popovers.
- Replays reconstruct the same scenario and seed, clear time/metrics/history, and preserve locale, sound and reduced-motion settings.
- Gameplay mutations are rejected after a terminal result. UI controls and scenario restart remain available.

---

## 5. Mathematical Balancing & Economic Equations

### 5.1 Game Session Target Duration
- Guided play is a short build/deploy/restore exercise. Overextension and recovery length depend on decisions and healing. Defend First has a 120-second minimum. Paused reading time is excluded.

### 5.2 Defense Score Equation
The sovereign border consists of **8 critical checkpoints** (`bdr-1` through `bdr-8`):

$$\text{ActiveCheckpoints} = \sum_{i=1}^{8} \mathbb{I}(\text{tile}[i].\text{garrisonCount} > 0)$$

$$\text{DefenseScore} = \min\left(100\%, \text{round}\left(\frac{\text{ActiveCheckpoints}}{8} \times 100\%\right)\right)$$

- Baseline: 8 soldiers at 8 checkpoints = $100\%$.
- 7 checkpoints manned = $88\%$.
- 5 checkpoints manned = $63\%$.
- 3 checkpoints manned = $38\%$.
- 0 checkpoints manned = $0\%$.

### 5.3 Treasury, Labor-Burnout & Paced Economic Model
- **Settlement Construction Cost:** 100₪.
- **Initial Treasury:** 100₪ (Balanced to cover either 1st settlement or troop deployment savings).
- **Dynamic Treasury Cap:** Starts at 300₪ and expands as the settlement empire grows:
  $$\text{MaxBudget} = 300\text{₪} + (\text{BuiltSettlements} \times 25\text{₪})$$
- **Paced Income Formula:**
  - **Base Civilian Production:** Calling military reserves pulls workers from the civilian economy:
    $$\text{CallsMade} = 3 - \text{reservesBatchesLeft}$$
    $$\text{BaseCivilianIncome} = \max\left(1\text{₪/s}, 4 - \text{CallsMade}\right)$$
  - **Guarded Outpost Coalition Multiplier:** Each garrisoned outpost yields government funding:
    $$\text{GuardedBonus} = \text{GuardedSettlements} \times 2\text{₪/s}$$
  - **Effective Passive Income Rate:**
    $$\text{IncomeRate} = \text{BaseCivilianIncome} + \text{GuardedBonus}$$

| Guarded outposts | Civilian income, no calls | Outpost funding | Total |
|---|---|---|---|
| 0 | 4 ₪/s | 0 ₪/s | 4 ₪/s |
| 1 | 4 ₪/s | 2 ₪/s | 6 ₪/s |
| 2 | 4 ₪/s | 4 ₪/s | 8 ₪/s |
| 4 | 4 ₪/s | 8 ₪/s | 12 ₪/s |
| 8 | 4 ₪/s | 16 ₪/s | 20 ₪/s |

### 5.4 Troop Deployment Cost ("עלות פריסת כוחות")
- **Operational Expenditure:** Deploying soldiers from the sovereign border to West Bank outposts costs **25₪ per transferred soldier** to finance mobile trailers, armored transport, and security infrastructure:
  $$\text{DeploymentCost} = \text{TransferredSoldiers} \times 25\text{₪}$$
  $$\text{NewBudget} = \max(0, \text{Budget} - \text{DeploymentCost})$$
- **Affordability Requirement:** If `state.budget < 25₪`, deployment is disabled and button indicates `(נדרש 25₪)`.
- **Audio & Visual Feedback:**
  - Deployment sound (`sounds.playDeploy()`) and expenditure thud (`sounds.playPenalty()`).
  - The budget counter changes immediately; the event is recorded in the run timeline.
  - The `DEPLOY_TROOPS` button prominently displays the cost: `-25₪ עלות`.
- **Messianic Charge Acceleration:** Stationing soldiers at outposts advances the "יהוה צבאות" charge gauge by **+4% per soldier**, enticing the player toward divine miracle illusions.

### 5.5 Active City Tax Clicker
- Players can tap on sovereign Israeli cities (Tel Aviv, Haifa, Sharon, Modi'in, Ashdod, Be'er Sheva):
  - Each tap collects **+2₪** in municipal taxes / donations.
  - Audio chime and ascending spark particle.
  - Controlled by a **3.5s cooldown per city**, providing a modest supplemental top-up without creating runaway hyper-inflation.

### 5.6 Homeland HP System ("חוסן המדינה") & Defense Holes Bleed
- **State Metric:** `landHp: number` (0% to 100%, starts at 100%).
- **Continuous Bleed from Defense Gaps:**
  Every unsealed checkpoint gap along the border fence erodes national security every second:
  $$\text{HoleBleed} = \text{ActiveBreaches} \times 0.4\text{ HP/s}$$
  Leaving 4 gaps unsealed drains 1.6 HP/s (16% HP lost every 10 seconds).
- **Direct Attack Impact:**
  - Infiltration raid striking an Israeli city: **-12 HP** directly to Land HP, **-10₪** damage, and screen shake (reduced from -20 HP / -20₪ for balanced expansion pacing).
  - West Bank settlement destroyed in a clash: **-10 HP** to Land HP.
- **Resilience Recovery:**
  - When border is 100% fortified with 0 holes and 0 active attacks: recovers **+0.5 HP/s** (up to 100%).
  - Successfully sealing a breach / thwarting an attack: awards **+2 HP** for recall-based sealing, **+3 HP** for reserve-based sealing, or **+5 HP** when those actions intercept a raid. Redeploying an already-available soldier grants no bonus HP.
- **Defeat Threshold:**
  If `landHp <= 0`, sovereign defenses collapse and the **October 7 Catastrophe** defeat modal triggers immediately.

### 5.7 Israeli Cities Shekel Collection & Economy
- **Guarded Outpost Yield:** Each secured settlement generates **+2₪/s** (increased from +1₪/s to reward player expansion).
- **Civilian Baseline:** Starts at **+4₪/s**, tapering by -1₪/s per reserve call-up.
- **Placement:** Spawns on sovereign Israeli cities.
- **Controlled Quantity:** Strictly at most **1 coin** present at a time (cooldown: 16s between spawns).
- **Balanced Value:** **+15₪** per coin, with 3D gold shekel animation, 30px touch hitbox, and cash register chime.
- **Coalition Fines:** Cooldown increased to **36-45s** (previously 16s), and fine amounts halved to **8-14₪** (previously 20-35₪).

---

## 6. Combat, Clashes & Infiltration Mechanics

### 6.1 West Bank Clashes & Settlement HP Degradation
- Clashes occur between built outposts and adjacent Palestinian cities (e.g. Nablus, Ramallah, Jenin, Hebron).
- **Progressive Cooldown Curve:**
  - Settlements ≤ 1: Cooldown is at least **45 seconds** (grace period to allow first garrisoning).
  - Settlements = 2: Cooldown is at least **38 seconds**.
  - Settlements ≥ 3: Cooldown is **32 seconds** (unsecured) / **50-60 seconds** (secured).
- **Garrisoned Settlements:** Soldier defends the perimeter. Sound: tactical clash sfx. HP remains protected.
- **Ungarrisoned Outposts (HP Bar Mechanic):**
  - Exposed outposts lack IDF protection.
  - When attacked, the outpost suffers **-25 HP** damage (previously -35 HP) and **-6₪** minor clash cost (halved from -15₪).
  - Sound: emergency siren and alert ring.
  - At **0 HP**, the outpost is burned/destroyed, settlement count drops by 1, and the disaster is reported on the news wire.

### 6.2 Green-Side Hostile Infiltrations (18-Second Extended Reaction Window)
- Whenever an unmanned border checkpoint exists (`isBreached: true`), hostile raiding squads can penetrate into the Green side.
- **Dynamic Pacing & Cooldown Curve:**
  - Settlements ≤ 1: Cooldown is at least **60 seconds** with only 22% trigger probability.
  - Settlements = 2: Cooldown is at least **50 seconds** with 30% trigger probability.
  - Settlements ≥ 3: Cooldown is **42 seconds** (previously 26 seconds).
- **Extended 18-Second Response Window:**
  - Raiders traverse along dashed attack vectors with `durationMs = 18000` (~18 seconds total transit time, speed `progress += 0.055/tick`).
  - Guarantees comfortable reaction time to read alerts, digest tactical advice, and dispatch defenses without panic.
  - Live countdown tag displayed directly above the moving hostile vehicle: `🎯 [עיר] (17ש׳ לבלימה)`.
- **Tri-Fold Actionable Defense:**
  1. **Floating Emergency Alert with Direct Button:** The urgent operational alert auto-dismisses after six seconds and embeds a direct action button: `[🛡️ לחץ כאן לבלימת החדירה!]` opening the defense modal instantly.
  2. **The Reserves Button:** Remains a stable, labeled action with the number of calls remaining. The short advisor highlights the gap to seal.
  3. **Map Truck & City Clicking:** Clicking the raider truck or the target city opens `InfiltrationDefenseModal` showing the animated approach bar with exact seconds remaining.
- **Failure to Intercept:** If the truck reaches the city: **-10₪** and **-12 HP**. Readiness remains the fraction of staffed checkpoints; raid impacts do not introduce an unrelated readiness penalty.

---

## 7. The Satirical "יהוה צבאות" (Lord of Hosts) System

The game’s psychological core relies on subverting messianic rhetoric using mobile idle-game retention patterns.

### 7.1 Living Radiance & Soul Sparks
- The button is visually dazzling: breathing golden aura, live charge progress bar, and ascending celestial chime audio.
- Whenever settlements are constructed, glowing golden soul sparks arc across the map into the button.

### 7.2 Shifting Goalposts Matrix

| Stage | Requirement Text | Displayed Progress | Click Toast Response |
|---|---|---|---|
| **Stage 1** | `"דרושים: 6 יישובים לפתיחת שערי שמיים"` | `12% -> 50%` | *"התפילות נשמעות, המשיכו ליישב את הארץ!"* |
| **Stage 2** | `"נדרשת מסירות: 11 יישובים"` | `50% -> 85%` | *"קרובים למדרגה הבאה! עוד מאמץ התיישבותי."* |
| **Stage 3** | `"שעת המבחן: 15 יישובים ומסירות נפש"` | `85% -> 99%` | *"הגאולה מתעכבת בשל קטני אמונה בקבינט!"* |
| **Stage 4** | **`נס בעוד: 00:30`** (Fake Countdown) | `99.0%` | Resets with excuse: *"רפיון רוח! נדרש עוד מאחז אחד!"* |

### 7.3 Panic-Mashing Climax & Mechanical Shatter
When Defense hits 0%:
1. Button switches to flashing red-gold: **`לחצו במהירות לנס! (99.9%)`**.
2. Frantic taps trigger massive orchestral bass thuds and violent screen shaking.
3. On the **7th/8th tap**:
   - Metallic shatter sound plays.
   - Fracture line splits the button.
   - Golden glow instantly dies into ash gray.
   - Text permanently locks: **`אין סומכין על הנס`**.
   - Immediate blackout transition to the October 7 Defeat modal.

---

## 8. Narrative Media & Multi-Step Story Arcs

Over 40 satirical and realistic headlines organized across 4 categories:

### 8.1 Multi-Step Story Arcs
1. **Netanyahu & Ben-Gvir Arc:**
   - Step 1: Pre-election interview: *"Ben-Gvir will never be a minister in my government, he is unfit"*.
   - Step 2: Coalition agreement grants Ben-Gvir Internal Security portfolio and outpost powers.
   - Step 3: Ben-Gvir threatens to dissolve government unless 4 border battalions are moved to outposts.
   - Step 4: Netanyahu late-night press conference: *"I hold the wheel with both hands; Ben-Gvir is merely pressing the gas pedal"*.
2. **Netanyahu & Tally Gotliv Arc:**
   - Step 1: Likud meeting: Netanyahu pleads for fewer aggressive tweets and industrial quiet.
   - Step 2: 10 minutes later: Gotliv tweets an 800-word manifesto accusing leadership of defeatism.
   - Step 3: Netanyahu executes evasive maneuver in Knesset hallways, hiding in supply closet from Gotliv's megaphone.
   - Step 4: Foreign interview: *"Tally Gotliv? A very colorful colleague"*.
3. **Netanyahu & The Red Marker Arc:**
   - Step 1: UN speech with poster board and red marker drawing lines on outpost maps.
   - Step 2: Indelible neon ink permanently stains Netanyahu's custom white shirt cuffs.
   - Step 3: Official TikTok: *"They ask about the outposts and border? There was nothing, no one pulled my lapel"*.
   - Step 4: Press briefing: *"Absolute victory is within reach, sour journalists will eat their hats"*.
4. **Smotrich & Defense Budget Arc:**
   - Finance Ministry freezes drone procurement to fund unauthorized outpost access roads.
5. **Rabbis & Angel Legions Arc:**
   - Chief Rabbis promise angels will guard the border; kabbalists abandon fence due to heatwave, leaving anti-drone amulets.
6. **Celebrities in the Samaria Hills:**
   - Reality stars visit outposts for viral hummus reviews while soldiers stand guard in dust storms.

---

## 9. Web Audio API Procedural Sound Engine

Synthesized procedurally with zero external asset dependencies (`src/audio/soundEngine.ts`):

1. **`playClick()`**: Clean woodblock sine drop (`320Hz -> 120Hz`).
2. **`playBuild()`**: Deep wooden construction thud with resonant decay.
3. **`playDeploy()`**: Upward major triad arpeggio (`C5 -> E5 -> G5`).
4. **`playReserves()`**: Dual brass military fanfare horn (`F4 -> Bb4`).
5. **`playSiren()`**: Urgent two-tone oscillating emergency klaxon (`880Hz / 440Hz`).
6. **`playLordOfHostsClick()`**: High angelic chime with comedic flat buzz drop.
7. **`playPanicMashThud()`**: Heavy low-end 40Hz sub-bass impact causing screen vibration.
8. **`playCrackDefeat()`**: Metallic mechanical shear followed by white noise shatter.
9. **`playCoinCollect()`**: Bright dual-frequency cash bell chime (`1760Hz + 2637Hz`).
10. **`playPenalty()`**: Descending minor slide with dull cash drawer thud.
11. **`playClash()`**: Sharp percussive ricochet and friction hit.
12. **`playVictory()`**: Warm harmonious orchestral cadence.
13. **`playShieldChime()`**: Crisp resonant protective shield chime arpeggio (`G5 784Hz -> C6 1046Hz -> E6 1318Hz`) triggered whenever an infiltration attempt is thwarted.

---

## 10. Mobile Viewport, Guided Opening & Pausing

- The root document is fixed at `100dvh` with overflow hidden. `MobileFrame` accounts for safe areas; the desktop bezel is capped to available viewport height.
- The map uses `flex-1 min-h-[220px] max-h-full overflow-hidden` and `preserveAspectRatio="xMidYMid meet"`. Header, status, ticker, objective and all four action buttons share the remaining height.
- The action deck has a short, wrapping instruction with tap-to-read detail. Build mode highlights candidate hills; deployment mode highlights unguarded outposts; gaps have a visible ring and a generous hit area.
- A compact initial explanation introduces the three playable steps: build (100₪), preview and confirm deployment (25₪), then observe the highlighted gap and restore security. The miracle mechanic is explicitly satirical and never presented as a mechanical defense action.
- Guided state advances from construction to deployment to observation. Scenario objectives are visible throughout play, including elapsed and required secure time.
- New/updated overlays use `.modal-panel` with scrolling confined to the panel; the underlying game never scrolls. Source selection and confirmation have separate controls and stable checkpoint numbers.
- Manual pause is independent of modal visibility. Both the interval and reducer reject ticks while any reading overlay or information popover is open. Closing the strategy desk preserves the prior manual pause.
- Simulation time drives construction, cooldowns, damage, attacks and clash expiry. Cosmetic troop/spark/toast clearing remains wall-clock based and does not advance gameplay.
- Information popovers dismiss on tap or after 4.5 seconds. Haptics remain available for map interactions and the miracle button.
- Reduced-motion styling disables CSS motion, and victory confetti respects the same setting. Buttons and interactive map checkpoints/outposts have visible keyboard focus.

---

## 11. Tactical Interception & Defense Mechanics

1. **Direct Breach Containment (`SEAL_BREACH` & Prioritized Targeting):**
   - Tapping an unmanned border checkpoint bearing the `⚠️ פרצה (לחץ לבלימה)` prompt immediately dispatches `SEAL_BREACH`.
   - **Available Troop Priority:** First use any existing unassigned soldier, including a soldier displaced by a scheduled disruption. This uses no reserve call and opens no other gap.
   - **Troop Recall Priority:** If soldiers are garrisoned in West Bank outposts, the system immediately pulls a soldier from the closest outpost and leaps them straight to the breached checkpoint.
   - The checkpoint is instantly re-manned (`garrisonCount = 1`, `isBreached = false`, `hasAlert = false`), the sovereign defense score increases, and any hostile squad traversing that breach is intercepted on the spot.
   - Triggers `sounds.playShieldChime()` and pops the feedback banner: `🛡️ חדירה סוכלה בהצלחה! לוחם הוחזר ממאחז לבלימת הפרצה!`.
   - **Target Prioritization in `RECALL_TROOP`:** Recalling troops from settlement modals now strictly targets the checkpoint under active hostile attack rather than choosing an empty checkpoint at random, guaranteeing that returning a soldier always thwarts the immediate threat.
   - **Reserve Fallback:** If zero soldiers are deployed in outposts, `SEAL_BREACH` mobilizes available reserves specifically to the targeted breach.

2. **West Bank Clashes: Skewed Against Non-Secured Settlements:**
   - When non-secured outposts (`garrisonCount === 0`) are present in the West Bank:
     - Clash pacing accelerates dramatically: cooldown is 45/38/32 seconds for 1/2/3+ outposts with a 28% trigger chance; guarded-only boards use 60/50 seconds and 10%.
     - **85% Probability Weight:** Clashes are heavily weighted to strike non-secured, exposed outposts rather than garrisoned settlements.
     - **Vulnerability & Attrition:** Non-secured outposts endure direct damage (-25 outpost HP per incident, sirens, -6₪ damages) and are wiped off the map if HP reaches 0%.
     - **Narrative Framing:** Breaking headlines highlight the security vacuum (*"מאחז חשוף תחת מתקפה: בהיעדר כוחות צה״ל לשמירה..."*), creating a sharp dilemma between protecting sovereign borders and preventing outpost destruction.

3. **Settlement Inspector Tactical Feedback:**
   - The inspector previews budget and income changes and whether removing the selected troop actually opens a gap. Recall is disabled when no gap needs filling.

4. **Garrison Benefits & Outpost Repair:**
   - Outposts with stationed troops display a miniature IDF shield badge (`✡`).
   - Garrisoned outposts regenerate durability at +5 HP/second, while ungarrisoned outposts degrade during local clashes.

5. **Perimeter Collapse Visuals:**
   - Sovereign border line turns dashed amber below 50% defense.
   - Below 25% defense, the border line turns glowing pulsating red with crackling hazard alert sparks along the Green Line.

---

## 12. Run Reports, Medals & Social Sharing

- Both terminal screens embed `RunReport`: objective, elapsed simulation seconds, final HP, intercepted raids, medals, a damage-source table and an expandable chronological event list.
- Damage reporting sums actual HP removed by exposure, raid impacts and destroyed outposts before later healing. Final state totals are not substituted for historical decisions.
- Miracle reliance is mentioned only when this run actually recorded a button press. The defeat text distinguishes HP exhaustion from the panic-button shatter.
- Three medals are available only on victory: finish with 90+ HP; use at most one reserve call during the run; finish within 90 seconds (125 seconds for Defend First).
- Both endings offer same-scenario replay and choosing another scenario. The shared seed keeps threat opportunities comparable, while different policies affect which threats are eligible.
- Defeat retains native sharing, WhatsApp sharing and a standalone SVG result card. Shared text reports final outposts, gaps and HP without inventing decisions.
- Terminal screens are bounded, internally scrollable panels; the map and deck retain their layout behind them.

## 12.1. Low-Interruption Notification Behavior

- Transient alerts are tap-to-dismiss across their card surface; the explicit `✕` remains an optional affordance.
- Emergency alerts are limited to active infiltration events and auto-dismiss after six seconds. Interception confirmation and devotional toast cards can also be dismissed with one tap.
- Financial penalty and grant feedback does not add a separate visual popup.

---

## 13. Verification & Quality Assurance

- `npm run build`: strict TypeScript checking and Vite production bundle, required before completion.
- `npm test`: executable reducer regressions covering tutorial/deployment, all security-restoring victory paths, timed disruptions, recovery thresholds, pause behavior, seeded replay, actual damage and interception accounting, and terminal-state immutability.
- Chromium checks in `scripts/test-browser.mjs` cover both languages at 320×568, 360×640, 390×844, 430×932, 568×320, 844×390 and 1280×720. They assert no document scrolling, a map of at least 220px, no objective/ticker/action overlap, and visibility of all four actions. They also exercise build → preview → deploy → seal → victory, scenario switching, defeat and replay, collecting runtime errors. Safari and Firefox have not been verified in this iteration.
- The browser runner is optional development tooling: install Playwright separately and run `node scripts/test-browser.mjs`, or point `PLAYWRIGHT_MODULE` to its module. It is not a runtime dependency.

## 14. Strategy Desk, Replay & Accessibility

- Header book control opens the bilingual strategy desk without altering manual pause. The desk includes the policy ledger, reduced-motion toggle, scenario descriptions, current objective and medal thresholds, and the original inspiration link.
- Scenario starts: Open has 100₪ and eight staffed checkpoints; Defend First adds 50₪; Overextension starts with two guarded outposts and two gaps; Recovery starts with three guarded outposts, five staffed checkpoints, 70 HP and one reserve batch.
- Every scenario is available from the desk, including return to guided play. Launching one resets the current run.
- `randomStream(seed, elapsedSeconds, channel)` gives separate coin, raid and clash opportunity streams. No UI action or reading delay advances these streams. Narrative randomness is cosmetic; equal gameplay decisions at equal simulation seconds reproduce the threat outcomes.
- Checkpoint readiness, current income, budget capacity and troop totals are normalized centrally after gameplay changes. Costs/rewards are defined in `RULES` and used by gameplay and previews.
- `DEPLOY_TROOPS` enters/cancels map selection. Opening an outpost clears stale source selection. Choosing a stable numbered checkpoint shows a preview; a separate confirmation dispatches `DEPLOY_TROOP`.
- Modal content, scenario objectives, reports, medals and controls support Hebrew and English. Long instructions wrap or move into tap-to-read detail without changing the map height.
- Named map locations and inspector titles use shared bilingual names; active raid targets and restart news refresh when language changes.
- Short landscape screens use two columns: map and objective on one side, status/ticker/actions on the other. Portrait retains the single-column layout and 220px map minimum.

## 15. Authorial & Educational Inscription

> **"לא מצביעים בלי שיודעים."**  
> Dedicated to clarity, public responsibility, and sovereign defense prioritization.
