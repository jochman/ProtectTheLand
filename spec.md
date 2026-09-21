# Technical & Game Design Specification: "נצחון מוחלט" / "Total Victory"

> **Document Type:** Comprehensive Game Design & Technical Architecture Specification (`spec.md`)  
> **Target Platform:** Client-Side Web Application (Mobile-First 390px, Responsive Desktop Bezel, Zero-Backend)  
> **Primary Locale:** Hebrew (`he`, RTL) | **Secondary Locale:** English (`en`, LTR)  
> **Repository:** `/home/jochman/dev/octGame`
> **Last Synchronized:** 2026-09-21 13:58:06 UTC (Branch: `main`, Iteration #66)

---

## 1. Executive Summary & Core Message

**"נצחון מוחלט"** ("Total Victory", previously working title: *"7 באוקטובר" / "לא מצביעים בלי שיודעים"*) is an educational, satirical, and interactive mobile simulation game inspired by tactical analysis and political commentary (notably Yoni Haimovich's educational videos). 

The game places the player in the role of a policymaker/commander balancing sovereign border defense along the Green Line against political pressure to construct and garrison isolated outposts in the West Bank. Through accessible mobile idle/strategy mechanics (3D tactile clay-morphic interface, floating shekel coins, and an irresistible satirical **"יהוה צבאות"** false miracle button), players experience firsthand the direct zero-sum tradeoff: **every soldier sent to protect an isolated outpost is a soldier missing from the sovereign border.**

The game has no victory state. Its declared target is to establish settlements at all **17** canonical sites and staff every one, but completing that target does not end the war: tactical threats continue indefinitely. This is the central satirical structure—each apparent success produces another requirement, so “success” remains a failure to reach peace or safety.

The only terminal state is the **October 7 Catastrophe** (`gameStatus: 'catastrophe'`):
- **Primary Tactical Trigger (Citizen Loss):** Israel begins with 100,000 citizens alive. Every unsealed sovereign-border gap kills 400 citizens per second. Hostile infiltrations that reach Israeli cities kill 12,000 citizens and inflict -10₪ damage. When the citizen count reaches zero, the nation's defenses collapse completely, sirens wail, and the October 7 defeat screen appears with a comprehensive policy post-mortem.
- **Satirical Trigger (Completed Expansion):** The **"יהוה צבאות"** button becomes fully operational only after all 17 settlement sites are built and every settlement has a permanent guard. Five taps then shatter the idol (`sounds.playCrackCollapse()`), exposing that total territorial control still provides no victorious ending. The first tap pauses the simulation for eight ticks (normally eight seconds).
- **Tutorial Completion:** Build and staff an outpost while keeping the border secure, or restore all border coverage and stop active raids after a deployment opened a gap. Available-pool deployment and reserve auto-garrisoning count as valid staffing. This sets `tutorialStep` to `done` and continues the same run; it never ends the game or resets resources, troops, time or history. Removing the last outpost before staffing returns the instruction to building.

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
- Every completed iteration synchronizes the specification, passes the required checks, and is committed and pushed to `origin` on the current branch under standing user authorization. Unrelated working-tree changes are excluded. Commit-message drafting and pushes are delegated to the lowest-cost reliable model available.

### 2.5 Project Documentation
- `README.md` is the concise developer and player entry point. It documents the client-side architecture, local Node/npm requirements, development/build/test/spec-sync commands, campaign objective, directory map, and GitHub Pages deployment trigger.
- `spec.md` remains the comprehensive source of truth for game mechanics, localization, UI behavior, and architecture; the README links contributors here for the complete contract.

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

### 3.2 Shared UI Translation Catalog
- Static and interpolated player-facing UI copy is centralized in `src/locales/inlineTranslations.ts` as Hebrew/English pairs. Components call `translate(state.locale, key, values)` from `src/locales/translate.ts`; `{{0}}`-style placeholders preserve dynamic game values without duplicating locale conditionals in JSX or game rules.
- Hebrew copy maintains high linguistic fidelity: terminology distinguishes sovereign green line cities from hilltop outposts (`מאחז`), active actions avoid confusing telegram-style dismissals (e.g. `לאטימת הפרצה` instead of ambiguous `לסגירה`), and numeric unit suffixes (`ש׳`, `שנ׳`, `אזרחים`) are strictly localized to prevent BiDi inversion and Latin character leakage.
- `selectLocale()` is reserved for already-bilingual runtime records such as live news and tactical feedback. Language state remains owned by `GameState`, preserving immediate RTL/LTR changes and the existing reducer-based language switch.

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
 [Defense Drops Below 75%]                  [Expansion Continues]
 Border tension, checkpoints unmanned       3 sites: another promise
 Ungarrisoned outposts take clash damage    8 sites: still not enough
 Hostile pickup trucks raid cities          17 sites: now guard them all
            │                                           │
            └─────────────────────┬─────────────────────┘
                                  ▼
                    [ALL 17 BUILT AND STAFFED]
                   Button becomes fully operational
                    Threats still continue forever
                                  │
                                  ▼
                    [FIVE-TAP FALSE "SUCCESS"]
                    Button shatters; no victory exists
                                  │
                                  ▼
                    [OCTOBER 7 CATASTROPHE]
                    Full-screen defeat & debrief
```

### 4.2 TypeScript Data Contract (`src/types.ts`)

The complete, compile-checked contract lives in `src/types.ts`; shared formulas and objective selectors live in `src/game/rules.ts`. The reducer wraps individual actions with resource normalization, event accounting, and Lord-of-Hosts progression normalization.

- Resources: budget, income, total soldiers, soldiers assigned to outposts, border/available soldiers, three reserve batches, surviving citizens, and the eight checkpoint garrisons.
- `availableTroops = soldiersTotal - sum(tile.garrisonCount) - reinforcements.length`. Temporary support is reserved during both travel and combat and cannot be spent twice. The legacy `soldiersAtBorder` count includes all personnel outside outpost garrisons, including available and temporary forces; actual readiness derives only from permanent checkpoint guards.
- `elapsedSeconds` advances only on an unpaused simulation tick. Tactical deadlines, travel and the next-threat schedule use this same clock.
- Tactical state: `threats` stores target tile, required strength and deadline; `reinforcements` stores one soldier per entry, incident id, source coordinates, departure and arrival times. `nextThreatAt`, `threatSequence`, `selectedThreatId` and bilingual `threatFeedback` provide pacing, deterministic selection, planning and outcome feedback. `src/game/threats.ts` owns dispatch, resolution and cancellation; the reducer normalizes resources afterward.
- `peakSettlementsCount` starts at zero and records the maximum number of concurrent completed outposts on actions that begin after tutorial completion. `seed` defaults to `7102023`.
- There is no `defenseStreak`, victory threshold, `hasWon` selector, victory medal calculation or rational-victory status. Successful tactical defenses are still recorded as interceptions in metrics and the timeline, but never terminate the campaign. `gameStatus` is only `playing | catastrophe`.
- `tutorialStep`: `build | deploy | observe | done`. Every new game starts at `build`. Before completion, derive the next step after each gameplay action: exposed border/active raid → `observe`; no completed outposts → `build`; otherwise → `deploy`. A secure board with a staffed outpost, or restoration of security from `observe`, completes the tutorial and schedules the first threat 20 seconds later. Construction progress appears in the instruction strip while the first site is building.
- Direct deployment: the bottom Deploy action immediately staffs the next exposed outpost, while tapping an exposed outpost on the map staffs that specific site. `DEPLOY_TROOP` chooses its source automatically at dispatch time. Normal play has no deploy mode, source picker, settlement inspector or confirmation step. Legacy UI state and optional explicit source IDs remain only for reducer/replay compatibility.
- `metrics`: cumulative actual citizen deaths from exposure, raids, outpost clashes and tactical threats (clamped to citizens remaining at each hit), successful interceptions, miracle-button clicks, and reserve calls made during this run.
- `timeline`: simulation second, action/event kind, optional source/breach sector, gaps remaining, citizens alive after the action, and optional deaths/interception count. It covers construction starts, deployments, reserves, recalls, evacuations, sealing, raid impacts, outpost losses, reinforcement dispatches and tactical battle outcomes.
- Player-facing pause sources are manual pause, the compact game menu, the first-run introduction, the strategy guide, compact status tooltips and the optional news center. Settlement, infiltration and reinforcement planning dialogs remain removed. Page Visibility (`visibilitychange`) and `pagehide` also set the persistent manual pause flag when a tab/window is backgrounded or minimized; returning never silently resumes the simulation.
- Restarts reconstruct the standard starting board and seed, clear time/metrics/history and tutorial/expansion progress, and preserve locale, sound and reduced-motion settings.
- Gameplay mutations are rejected after catastrophe. UI controls and game restart remain available.

---

## 5. Mathematical Balancing & Economic Equations

### 5.1 Game Session Target Duration
- The guided opening is a short build/deploy/restore exercise within the main run. Play continues without any victory condition, including after full-map conquest and staffing. Session length depends on expansion, permanent citizen losses, player decisions or deliberate five-tap activation. Paused reading time is excluded.

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
- **Settlement Completion Grant:** Every completed outpost immediately awards a one-time **40₪ coalition grant**. This is capped by the expanded treasury ceiling and is surfaced as temporary green budget feedback; it is not passive income.
- **Initial Treasury:** 100₪ (Balanced to cover either 1st settlement or troop deployment savings).
- **Dynamic Treasury Cap:** Starts at 300₪ and expands as the settlement empire grows:
  $$\text{MaxBudget} = 300\text{₪} + (\text{BuiltSettlements} \times 25\text{₪})$$
- **Paced Income Formula:**
  - **Base Civilian Production:** Calling military reserves pulls workers from the civilian economy:
    $$\text{CallsMade} = 3 - \text{reservesBatchesLeft}$$
    $$\text{BaseCivilianIncome} = \max\left(1\text{₪/s}, 4 - \text{CallsMade}\right)$$
  - **Settlement Financial Return:** Settlements generate no income, whether guarded or unguarded:
    $$\text{SettlementIncome} = 0\text{₪/s}$$
  - **Effective Passive Income Rate:**
    $$\text{IncomeRate} = \text{BaseCivilianIncome}$$

| Guarded outposts | Civilian income, no calls | Settlement income | Total |
|---|---|---|---|
| 0 | 4 ₪/s | 0 ₪/s | 4 ₪/s |
| 1 | 4 ₪/s | 0 ₪/s | 4 ₪/s |
| 2 | 4 ₪/s | 0 ₪/s | 4 ₪/s |
| 4 | 4 ₪/s | 0 ₪/s | 4 ₪/s |
| 8 | 4 ₪/s | 0 ₪/s | 4 ₪/s |

### 5.4 Troop Deployment Cost ("עלות פריסת כוחות")
- **Operational Expenditure:** Deploying soldiers from the sovereign border to West Bank outposts costs **15₪ per transferred soldier** to finance mobile trailers, armored transport, and security infrastructure:
  $$\text{DeploymentCost} = \text{TransferredSoldiers} \times 15\text{₪}$$
  $$\text{NewBudget} = \max(0, \text{Budget} - \text{DeploymentCost})$$
- **Affordability Requirement:** If `state.budget < 15₪`, deployment is disabled and button indicates `(נדרש 15₪)`.
- **Audio & Visual Feedback:**
  - Deployment sound (`sounds.playDeploy()`) and expenditure thud (`sounds.playPenalty()`).
  - The budget counter changes immediately; the event is recorded in the run timeline.
  - The `DEPLOY_TROOPS` button prominently displays the cost: `₪15 / חייל`.
- **Lord-of-Hosts Progress:** The button fill derives from the number of completed settlement sites, with milestones at 3, 8 and all 17. Permanent staffing matters only for the final transition from 96% to fully operational. See §7 for the authoritative formula and click messages.

### 5.5 Active City Tax Clicker
- Players can tap on sovereign Israeli cities (Tel Aviv, Haifa, Sharon, Jerusalem, Ashdod, Be'er Sheva):
  - Each tap collects **+2₪** in municipal taxes / donations.
  - Audio chime and ascending spark particle.
  - Controlled by a **3.5s cooldown per city**, providing a modest supplemental top-up without creating runaway hyper-inflation.

### 5.6 Citizen Survival System & Defense-Gap Deaths
- **State Metric:** `citizens: number` starts at `RULES.nationalCitizens = 100,000`. This is the national number of citizens still alive; it is never displayed as HP or a percentage.
- **Continuous Deaths from Defense Gaps:**
  Every unsealed checkpoint gap causes deaths every simulation second:
  $$\text{GapDeaths} = \text{ActiveBreaches} \times 400\text{ citizens/s}$$
  Leaving four gaps unsealed kills 1,600 citizens per second.
- **Direct Attack Impact:**
  - An infiltration raid striking an Israeli city kills **12,000 citizens**, inflicts **-10₪** damage and triggers screen shake.
  - Every attack against an unguarded outpost kills up to **250 outpost citizens** and removes the same number from the national citizen count.
- **Irreversible Losses:** Citizen deaths never regenerate. Fortifying the border, garrisoning an outpost or intercepting a raid prevents future deaths but cannot restore citizens. Sealing and reserve actions no longer award population.
- **Defeat Threshold:**
  If `citizens <= 0`, sovereign defenses collapse and the **October 7 Catastrophe** defeat modal triggers immediately.

### 5.7 Israeli Cities Shekel Collection & Economy
- **Settlement Yield:** Settlements generate **0₪/s**. Guarding or evacuating one does not change passive income.
- **Civilian Baseline:** Starts at **+4₪/s**, tapering by -1₪/s per reserve call-up.
- **Placement:** Spawns on sovereign Israeli cities.
- **Controlled Quantity:** Strictly at most **1 coin** present at a time (cooldown: 16s between spawns).
- **Balanced Value:** **+15₪** per coin, with 3D gold shekel animation, 30px touch hitbox, and cash register chime.
- **Coalition Fines:** Cooldown increased to **36-45s** (previously 16s), and fine amounts halved to **8-14₪** (previously 20-35₪).

---

## 6. Combat, Clashes & Infiltration Mechanics

### 6.1 Tutorial Clashes & Settlement Citizen Losses
- During the tutorial, legacy clashes occur between built outposts and adjacent Palestinian cities (e.g. Nablus, Ramallah, Jenin, Hebron). After tutorial completion, the warned tactical incidents below replace these random clashes.
- **Progressive Cooldown Curve:**
  - Settlements ≤ 1: Cooldown is at least **45 seconds** (grace period to allow first garrisoning).
  - Settlements = 2: Cooldown is at least **38 seconds**.
  - Settlements ≥ 3: Cooldown is **32 seconds** (unsecured) / **50-60 seconds** (secured).
- **Garrisoned Settlements:** A soldier defends the perimeter. Sound: tactical clash sfx. No outpost citizens are killed.
- **Ungarrisoned Outposts (Citizen Bar):**
  - Exposed outposts lack IDF protection.
  - Each outpost begins with **1,000 citizens**. Every attack kills up to **250 citizens** and inflicts a **-6₪** minor clash cost.
  - Sound: emergency siren and alert ring.
  - At **0 citizens**, the outpost is burned/destroyed, settlement count drops by 1, and the disaster is reported on the news wire.

### 6.1.1 Main-Game Tactical Threats & Mobile Reinforcements

- **Opening and cadence:** Tutorial completion schedules the first threat 20 simulation seconds later. Subsequent threats start every 26 seconds with 0–3 outposts (one active maximum), or every 18 seconds with 4+ outposts (two active maximum). All give 24 seconds of warning. Targets cannot have two simultaneous incidents. With 4+ outposts, warning windows overlap by six seconds.
- **Targets and strength:** Two incidents target outposts, then one targets a checkpoint; with no outposts, all target checkpoints. Staffed locations remain eligible. A seeded stream (`randomStream(seed, threatSequence, 8)`) chooses among eligible tiles. Required troops are 2 for 0–1 outposts, 3 for 2–3, 4 for 4–7, and 5 for 8+. Strength is fixed when the incident starts; current expansion determines later incidents.
- **Dispatch:** `REINFORCE_THREAT` automatically chooses one soldier from the available pool or another staffed outpost/checkpoint using the priorities in §15. It is free and takes exactly 4 simulation seconds. The source loses its guard immediately, including its funding or border coverage. A target cannot supply its own reinforcement. Dispatches are rejected for empty/invalid sources, already sufficient assigned strength, or less than four seconds remaining.
- **Defense:** `defenders = target.garrisonCount + arrivedSupport`. Troops in transit are displayed separately and do not count until arrival. Arrival exactly at the deadline counts. Support is temporary: it does not become a permanent garrison, grant funding, repair an outpost, or seal a border gap.
- **Resolution:** At the deadline, `missing = max(0, required - defenders)`. Each missing soldier kills **6,000 national citizens**, causes a **4₪** loss and, for an outpost target, kills **150 outpost citizens**. All values clamp at zero; actual national deaths are recorded in `metrics.threatDamage` and the timeline. Zero missing soldiers means an interception with no deaths. Zero national citizens causes defeat. Zero outpost citizens removes the outpost and releases its guard to the available pool without an extra destruction penalty.
- **Return and cancellation:** All incident support returns immediately to the available pool after resolution; soldiers do not automatically return to their former posts. Evacuating/removing a threatened outpost cancels its incident and releases all assigned support, including travelling soldiers. Soldiers are conserved across dispatch, resolution, loss and evacuation.
- **Permanent Losses:** Outpost and national citizen deaths do not regenerate. A guarded board remains vulnerable to tactical incidents; well-timed reinforcement can prevent deaths entirely.
- **UI and direct reinforcement:** The objective strip becomes a compact threat status/countdown after the tutorial. It shows target, troops present/required, seconds remaining and an indicator when two incidents are active; during recovery it shows the result or time to the next threat. Every tap on the status strip, map threat marker or contextual **Reinforce** action immediately sends one automatically sourced soldier to the first understrength incident. Repeat until present plus incoming strength meets the requirement. Invalid, excess and late dispatches are rejected. There is no reinforcement-planning modal or incident-tab menu.
- **Dispatch feedback:** Direct reinforcement remains free and takes four simulation seconds. If no source exists, the always-visible Call Reserves action remains available. Blue travel paths/dots, changing strength counts and bilingual status feedback show the result without interrupting play.
- **Map/audio/reporting:** Red target rings and countdown badges turn green when enough troops arrive. Blue travel paths/dots advance with simulation seconds, so they freeze while reading. The warning uses the existing siren, dispatch uses deployment audio, and successful defense uses the shield chime, respecting mute. Bilingual outcomes enter news history and tactical damage/interceptions appear in the run report. Resolved or cancelled incidents never create a victory state or stop future threat scheduling.
- **Mission feedback:** The action-deck objective shows built sites out of 17, staffed settlements out of those built and covered checkpoints out of eight in Hebrew and English. During a threat, the strip prioritizes the compact reinforcement instruction. The strategy desk explains that full conquest and staffing merely make the Lord-of-Hosts button operational; the war and threats continue.

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
  1. **Floating Emergency Alert with Direct Button:** The urgent operational alert auto-dismisses after six seconds and embeds a direct action button that immediately dispatches `SEAL_BREACH` for the attacking checkpoint.
  2. **The Reserves Button:** Remains a stable, labeled action with the number of calls remaining. The short advisor highlights the gap to seal.
  3. **Map Truck & City Clicking:** Clicking the raider truck or its target city immediately seals the originating checkpoint with `SEAL_BREACH`; no defense dialog interrupts the map.
- **Failure to Intercept:** If the truck reaches the city: **-10₪** and **12,000 citizens killed**. Readiness remains the fraction of staffed checkpoints; raid impacts do not introduce an unrelated readiness penalty.

---

## 7. The Satirical "יהוה צבאות" (Lord of Hosts) System

The game’s psychological core relies on subverting messianic rhetoric using mobile idle-game retention patterns.

### 7.1 Full-Button Progress and Readiness
- Constructed outposts retain the golden soul-spark animation toward the button and celestial audio feedback.
- The entire pill-shaped button fills horizontally with gold, from the logical start edge (right in Hebrew, left in English). Its pale unfilled portion, dark text, and 54px minimum height keep progress and the action readable on mobile without scrolling.
- While charging, the button shows explicit compact progress: settlements built out of 17 and settlements staffed. There is no fake countdown and no mention of an explicit “redemption promise” in the explanatory material; the promise remains implicit in the button's escalating responses.
- Progress is normalized after every gameplay action:
  - Below 3 settlements: proportional fill from 0–30%.
  - 3–7 settlements: starts at 35% and rises toward the next milestone.
  - 8–16 settlements: starts at 65% and rises toward 90%.
  - All 17 built but not all staffed: 96%.
  - All 17 built and all 17 staffed: 100% and fully operational.
- Clicking at each milestone produces the required response:
  - Before 3: “Establish 3 settlements before asking for the promise.”
  - From 3 through 7: “We have promised that this will be enough, but God needs more support”.
  - From 8 through 16: “The land takeover is progressing, but not enough”.
  - All 17 built but not fully staffed: “We conquered all of the land, but the settlements are not guarded enough”.
- The corresponding Hebrew copy is first-class and carries the same meaning. Clicking at a milestone only shows its toast; it does not pause, win or alter resources.
- Ready presentation: full gold fill, brighter pulsing halo, flame icon, and **“מבצעי לחלוטין · לחצו להפעלה!” / “Fully operational · Tap to activate!”**. Once tapping begins, readiness stays latched until the sequence ends or the run ends.

### 7.2 Five-Tap Climax and Feedback
- Every ready-state tap adds one of five persistent lit marks beneath the action text, flashes the button, triggers warning haptics where supported, and plays a thud with increasing starting pitch (`140 + tap * 35` Hz).
- The first four taps show distinct bilingual encouragement, ending with “עוד לחיצה אחת!” / “One final tap!”. A polite live region announces feedback and the remaining-tap count; keyboard Enter/Space use the same button action.
- Motion stays within the established button/screen effects, with reduced-motion support from both the accessibility setting and the system preference. Persistent text and lit marks remain usable without animation.
- The first tap starts **eight simulation ticks of grace**, normally eight seconds. During grace, `TICK_TIMER` decrements only `graceSecondsRemaining` and clears screen shake: citizen deaths, attacks, threat deadlines, income, construction, and simulation time do not advance. Reading/manual pauses also pause grace. Subsequent taps never renew it. After expiry, ordinary simulation and deaths resume.
- The **fifth tap** plays the shatter sound, fractures the button, removes its gold fill/glow, locks it to **“אין סומכין על הנס” / “Miracles don't defend borders”**, clears grace and screen shake, and opens the catastrophe modal. It restores neither troops nor citizens.
- Restart clears taps, grace, readiness and cracks. Readiness normalization is centralized in the reducer so deployments, support transfers, reserves and recalls behave consistently. Both click action variants count each tap once in the run report.
- Verification: reducer coverage includes exact 3/8/all milestone messages, dynamic 17-site completion, all-settlement staffing, finite grace, threat freeze/resumption, invalid early taps, latching and restart. Browser checks reach the effect through real construction/deployment controls in both languages, prove that full conquest opens no victory modal, exercise keyboard input and all five taps, and verify the 320×568 layout; the broader viewport suite retains zero-scroll coverage.

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
12. **`playShieldChime()`**: Crisp resonant protective shield chime arpeggio (`G5 784Hz -> C6 1046Hz -> E6 1318Hz`) triggered whenever an infiltration attempt is thwarted.

---

## 10. Mobile Viewport, Guided Opening & Pausing

- The root document is fixed at `100dvh` with overflow hidden. `MobileFrame` accounts for safe areas; the desktop bezel is capped to available viewport height.
- The map uses `flex-1 min-h-[220px] max-h-full overflow-hidden` and `preserveAspectRatio="xMidYMid meet"`. Header, status, ticker, objective and all four action buttons share the remaining height.
- The action deck has a short, wrapping, read-only instruction/progress strip. Build immediately chooses the next canonical site, Deploy immediately staffs the next exposed outpost, and the contextual Reinforce action sends one soldier to the first understrength incident. Candidate hills, exposed outposts and gaps retain visible map cues and generous hit areas.
- The build action is deliberately self-explanatory rather than another menu: its compact label shows current outpost progress toward all 17 canonical sites, the 100₪ cost and the +40₪ completion grant. A full bilingual accessible name preserves the complete purpose and amounts.
- A compact initial explanation introduces the three direct playable steps: Build (100₪ with a 40₪ completion grant), Deploy (15₪ with automatic target/source), and tap a highlighted gap to restore security. It explicitly names full-map conquest and full staffing as the declared target while explaining that there is no victory screen and threats continue. The former explicit “redemption promise” explanatory note remains removed; that theme is implicit in presentation rather than another rule to learn.
- Guided state follows the actual board through construction, staffing and restoring security. Staffing from available troops or reserves can complete guidance without opening a gap. The same map, budget, forces and history remain in play. The visible objective then switches to built/17, staffed/built and border coverage; it never becomes a victory checklist.
- The introduction, compact menu, strategy guide, news center and terminal-result overlays use `.modal-panel` with scrolling confined to the panel; the underlying game never scrolls. Contextual source, confirmation, settlement, infiltration and reinforcement overlays are not part of normal play.
- Manual pause is independent of overlay visibility. Both the interval and reducer reject ticks while the introduction, compact game menu or strategy guide is open. Closing the strategy guide preserves the prior manual pause.
- Browser minimization/backgrounding listens to `visibilitychange` and `pagehide` and dispatches idempotent `PAUSE_GAME`. The paused banner remains visible on return and the player must explicitly resume, preventing income, construction, damage, raids, threat deadlines and simulation time from advancing unseen.
- Simulation time drives construction, cooldowns, damage, attacks, tactical reinforcement travel and clash expiry. Legacy cosmetic troop/spark/toast clearing remains wall-clock based and does not advance gameplay.
- Each of the five status counters opens one compact bilingual tap-to-explain tooltip without adding a persistent HUD row. The news ticker opens a bilingual, internally scrolling news center with the current headline and history. The objective strip remains read-only. Haptics remain available for status/map interactions and the miracle button.
- Reduced-motion styling disables CSS motion. Buttons and interactive map checkpoints/outposts have visible keyboard focus.

---

## 11. Tactical Interception & Defense Mechanics

1. **Direct Breach Containment (`SEAL_BREACH` & Prioritized Targeting):**
   - Tapping an unmanned border checkpoint bearing the `⚠️ פרצה (לחץ לבלימה)` prompt immediately dispatches `SEAL_BREACH`.
   - **Available Troop Priority:** First use any existing unassigned soldier, including unused troops from an earlier reserve call. This uses no reserve call and opens no other gap.
   - **Troop Recall Priority:** If soldiers are garrisoned in West Bank outposts, the system immediately pulls a soldier from the closest outpost and leaps them straight to the breached checkpoint.
   - The checkpoint is instantly re-manned (`garrisonCount = 1`, `isBreached = false`, `hasAlert = false`), the sovereign defense score increases, and any hostile squad traversing that breach is intercepted on the spot.
   - Triggers `sounds.playShieldChime()` and pops the feedback banner: `🛡️ חדירה סוכלה בהצלחה! לוחם הוחזר ממאחז לבלימת הפרצה!`.
   - **Target Prioritization in `RECALL_TROOP`:** Recalling troops from settlement modals now strictly targets the checkpoint under active hostile attack rather than choosing an empty checkpoint at random, guaranteeing that returning a soldier always thwarts the immediate threat.
   - **Reserve Fallback:** If zero soldiers are deployed in outposts, `SEAL_BREACH` mobilizes available reserves specifically to the targeted breach.

2. **West Bank Clashes: Skewed Against Non-Secured Settlements:**
   - When non-secured outposts (`garrisonCount === 0`) are present in the West Bank:
     - Clash pacing accelerates dramatically: cooldown is 45/38/32 seconds for 1/2/3+ outposts with a 28% trigger chance; guarded-only boards use 60/50 seconds and 10%.
     - **85% Probability Weight:** Clashes are heavily weighted to strike non-secured, exposed outposts rather than garrisoned settlements.
     - **Vulnerability & Attrition:** Non-secured outposts lose 250 citizens per incident, trigger sirens and incur -6₪ damage; they are wiped off the map when no citizens remain.
     - **Narrative Framing:** Breaking headlines highlight the security vacuum (*"מאחז חשוף תחת מתקפה: בהיעדר כוחות צה״ל לשמירה..."*), creating a sharp dilemma between protecting sovereign borders and preventing outpost destruction.

3. **Direct Settlement Feedback:**
   - Unguarded outposts use a persistent amber target ring and the bottom action shows the 15₪ deployment cost. One tap deploys automatically; guarded outposts are not interactive deployment targets. Legacy recall/evacuation actions remain in reducer history compatibility but are not exposed as a normal-play inspector.

4. **Garrison Benefits & Permanent Citizen Loss:**
   - Outposts with stationed troops display a miniature IDF shield badge (`✡`).
   - Garrisoned outposts prevent tutorial-clash deaths. Citizen losses never regenerate; main-game incidents can still kill citizens at any outpost with insufficient defenders.

5. **Perimeter Collapse Visuals:**
   - Sovereign border line turns dashed amber below 50% defense.
   - Below 25% defense, the border line turns glowing pulsating red with crackling hazard alert sparks along the Green Line.

---

## 12. Run Reports & Social Sharing

- The catastrophe screen embeds `RunReport`: objective, elapsed simulation seconds, final citizens alive, intercepted raids, a death-source table and an expandable chronological event list.
- Reporting sums actual citizen deaths from exposure, raid impacts, outpost clashes and understaffed tactical incidents. Losses are irreversible, so the final citizen count and historical source totals remain consistent.
- Miracle reliance is mentioned only when this run actually recorded a button press. The defeat text distinguishes the citizen count reaching zero from the panic-button shatter.
- Medals and victory rewards are removed because there is no successful terminal outcome to reward.
- The defeat ending offers a new standard game; there is no scenario selector. The shared seed keeps threat opportunities comparable, while different policies affect which threats are eligible.
- Defeat retains native sharing, WhatsApp sharing and a standalone SVG result card. Shared text reports final outposts, gaps and citizens alive without inventing decisions.
- Terminal screens are bounded, internally scrollable panels; the map and deck retain their layout behind them.

## 12.1. Low-Interruption Notification Behavior

- Transient alerts are tap-to-dismiss across their card surface; the explicit `✕` remains an optional affordance.
- Emergency alerts are limited to active infiltration events and auto-dismiss after six seconds. Interception confirmation and devotional toast cards can also be dismissed with one tap.
- Financial penalty and grant feedback does not add a separate visual popup.

---

## 13. Verification & Quality Assurance

- `npm run build`: strict TypeScript checking and Vite production bundle, required before completion.
- `npm test`: 42 reducer regressions covering tutorial/deployment recovery, automatic source selection, citizen danger thresholds, replay, death reporting, permanent outpost deaths, available troops, Lord-of-Hosts behavior and tactical threats. Dedicated coverage verifies the 40₪ completion grant, bilingual Jerusalem name, idempotent automatic pause and blocked ticks until explicit resume. Campaign checks prove that resolved battles never create victory, active reinforcement can sustain an endless run, full staffed conquest keeps `gameStatus: 'playing'`, and threat scheduling continues after every site is controlled.
- Chromium checks in `scripts/test-browser.mjs` cover both languages at 320×568, 360×640, 390×844, 430×932, 568×320, 844×390 and 1280×720. They assert no document scrolling, a map of at least 220px, no objective/ticker/action overlap, visibility of all four actions, exactly three persistent header controls and five interactive status tooltips. They verify the tooltip and news-center keyboard flows on a 320×568 screen, Jerusalem, persistent auto-pause, explicit resume, direct Build → Deploy → Seal, one-tap reinforcement, the strategy guide, danger/defeat, exact 3/8/17 Lord-of-Hosts messages, the absence of a victory modal after full conquest and the fully operational five-tap ending, while rejecting unexpected gameplay-planning dialogs and runtime errors. Safari and Firefox have not been verified in this iteration.
- The browser runner also checks direct threat dispatch from map/status/action surfaces in Hebrew and English, arrival feedback, guard transfer, breach sealing and automatic support return. Captured viewport screenshots confirm an unobstructed map without planning dialogs.
- The browser runner is optional development tooling: install Playwright separately and run `node scripts/test-browser.mjs`, or point `PLAYWRIGHT_MODULE` to its module. `PLAYWRIGHT_EXECUTABLE_PATH` can select an existing Chromium binary. It is not a runtime dependency.

### 13.1. Exploratory Audit — 2026-09-20

- Detailed reproductions, evidence, proposed fixes and verification limits are recorded in [the playtest audit](docs/playtest-audit-2026-09-20.md). The original audit made no runtime changes. The former rational-victory model has since been removed; expansion now continues through every canonical settlement site without creating a successful terminal state.
- Resolved tutorial deviations: reserve auto-garrisoning now advances the tutorial, available-pool deployment completes it without requiring an artificial gap, and removing the last unstaffed outpost restores the build instruction.
- Resolved accessibility deviation: shared modal focus handling includes native disclosure summaries and excludes controls hidden inside closed disclosures. Some older bilingual news strings still embed a name from only one locale.
- The former immediate resilience rewards for recall/seal actions were removed with the citizen model because completed defensive actions cannot restore dead citizens. Tactical outcomes remain recorded, but no defense count or coverage state can produce victory.
- Small-phone layout retains zero scrolling and the 220px minimum map. Outpost and gap hit circles are 36 SVG units in radius; the compact map still scales below 44 CSS pixels on small phones. The location picker was removed at the user's request; direct map targets retain keyboard operation, focus rings and highlighted unguarded outposts, while bottom actions retain at least 44px touch targets.
- At original audit time, all 30 reducer tests, production build and existing bilingual Chromium suite passed; targeted probes still reproduced those gaps. Current expanded coverage is described above.

### 13.2. Decision Clarity and Accessible Controls

- Main actions use distinct semantic translation keys: Call reserves / +4 · batches left; Deploy troop / ₪15 per troop; Reinforce / one tap sends one troop, arriving in 4s. Construction progress, actual active-threat count, guarded status, available-pool deployment, gap-opening costs and available-pool sealing have distinct Hebrew and English messages.
- Once the tutorial is complete, the read-only action-deck instruction card continuously shows built sites/17, staffed settlements/built sites and covered checkpoints/8 when no urgent threat instruction supersedes it. It opens no help or information popover; the strategy guide contains the longer explanation. No extra persistent vertical HUD row is added.
- The former `defenseResetReason` and `defenseStreak` state, streak-reset news, victory counters and victory checklist are removed. Coverage problems and failed encounters remain visible through live board/threat feedback.
- The all-sectors hamburger/location list and all contextual gameplay-planning dialogs have been removed. Construction sites, exposed outposts, breaches and threats remain directly clickable and keyboard accessible on the map. Unguarded outposts have a permanent amber dashed target ring; guarded outposts are noninteractive deployment targets. Tiny decorative labels are suppressed on narrow phones while essential state remains in the HUD.
- `ModalAccessibility` provides initial dialog focus, Tab/Shift+Tab containment, Escape dismissal, focus restoration and inert background branches for the compact game menu, introduction, strategy guide, status tooltips and news center. Terminal results retain explicit restart controls. The objective strip remains read-only; the manual resume banner is a native button and reduced-motion control exposes its name and pressed state.
- Run reports distinguish elapsed time, citizens alive, interceptions, raid deaths, outpost deaths, open-gap deaths and available-pool sources. The largest accumulated death category determines a bilingual next-attempt tip linked to the corresponding events in the existing decision timeline; zero-death runs receive an explicit no-death statement. Equal totals choose the first category in report order. Advice is based on recorded totals, without inventing individual decisions.
- Verification adds tutorial reserve/available-pool recovery, automatic target/source selection, danger thresholds, persistent-defense assertions, and bilingual browser checks for construction feedback, the direct action loop, focus restoration, reinforcement keyboard input and absence of contextual gameplay dialogs.

## 14. Compact Game Menu, Strategy Desk, Replay & Accessibility

- The persistent header is reduced from seven controls to three: Pause/Resume, Language and one Game Menu. The menu consolidates the strategy guide, sound, reduced motion, fullscreen and restart; opening it pauses simulation and Escape closes it with focus restoration. The first-run introduction remains the only automatic teaching dialog.
- The Game Menu's single guide action opens the bilingual strategy desk without altering a pre-existing manual pause. The desk includes the policy ledger, reduced-motion toggle, the endless-campaign objective and the original inspiration link.
- Every game begins with 100₪, eight soldiers staffing eight checkpoints, zero outposts, 100,000 citizens alive and three reserve batches. Every completed outpost begins with 1,000 citizens.
- The strategy desk is informational only; it has no scenario list or game-start controls. Header restart and the two result-screen restart buttons return to the standard guided opening.
- `randomStream(seed, elapsedSeconds, channel)` gives separate coin, raid and clash opportunity streams. No UI action or reading delay advances these streams. Narrative randomness is cosmetic; equal gameplay decisions at equal simulation seconds reproduce the threat outcomes.
- Checkpoint readiness, current income, budget capacity and troop totals are normalized centrally after gameplay changes. Costs/rewards are defined in `RULES` and used by gameplay and previews.
- `DEPLOY_TROOP` is dispatched directly by the bottom action for the next exposed outpost or by tapping a specific exposed outpost on the map. It costs 15₪ per soldier, chooses an unassigned soldier or border guard automatically and has no selection mode or inspector.
- Available-pool deployment reduces the unassigned count by one and staffs the target without moving any existing guard, opening a breach, changing total manpower, or calling another reserve batch. Readiness is derived from actual staffed checkpoints and cannot exceed 100%. Empty-pool and duplicate-garrison attempts are rejected without charging.
- The top status pill shows total manpower and a separate available count. Example: 20 total, 8 border guards and no outpost guards leaves 12 available; staffing one outpost leaves 11 available and all eight border posts staffed.
- Gap sealing prefers the available pool. Breach markers, emergency alerts, raider trucks and attacked cities expose the direct action, so the player need not open a defense menu. Feedback and deployment news distinguish available-pool deployments from border transfers in both languages.
- The first-run introduction, compact menu, strategy guide, main objective, report and controls support Hebrew and English. Short instructions wrap without changing the map height.
- Named map locations use shared bilingual names; active raid targets and restart news refresh when language changes. The former Shfela/Modi'in sovereign-city tile is now Jerusalem (`isr-8`, `ירושלים` / `Jerusalem`) and border sector 4 targets it for raid narration.
- Short landscape screens use two columns: map and objective on one side, status/ticker/actions on the other. Portrait retains the single-column layout and 220px map minimum.

## 15. Authorial & Educational Inscription

> **"לא מצביעים בלי שיודעים."**  
> Dedicated to clarity, public responsibility, and sovereign defense prioritization.

## 15. Persistent Danger Warning & Easier Troop Movement

- **Danger strip:** During active play, the existing objective/threat status row becomes a persistent, nonmodal warning below 35,000 citizens (amber), below 20,000 citizens (red), or whenever a currently underdefended tactical attack or active city raid can individually kill every remaining citizen (red). At exactly 35,000 there is no count-only warning; at exactly 20,000 it remains amber unless an attack is lethal. Terminal screens clear it.
- **Threat calculation:** Missing defenders = max(0, required strength − permanent garrison − support arriving at or before that incident's deadline). Potential tactical deaths = missing defenders × 6,000 citizens. Each city raid can kill 12,000 citizens. This is a current-risk indicator, not a forecast of all future attacks or cumulative deaths.
- **Advice priority:** Lethal raid → seal border gaps; lethal tactical threat → send reinforcements; otherwise open gaps → seal; understaffed tactical threat → reinforce; unguarded outpost → guard; otherwise hold defenses. The text supports Hebrew/RTL and English/LTR and uses a polite, atomic live region. No dismissal, pause, timer or modal is added. Direct threat reinforcement remains available through the map marker and contextual Reinforce action when the warning occupies the status row.
- **Presentation:** Amber and red CSS theme variables, an alert icon, explicit warning text, and a restrained two-second critical border pulse. Critical citizen/attack risk also enables the existing screen-edge glow. OS reduced-motion and the in-game preference suppress warning motion. The strip reuses existing HUD space; the map remains at least 220px and all four bottom actions remain visible without document scrolling in phone portrait/landscape and desktop layouts.
- **Deployment:** Cost is 15₪ per permanent outpost guard. Existing troop totals, reserve batches, build costs, travel times and damage rules remain unchanged; Lord-of-Hosts readiness follows the full-conquest rules in §7. The bottom Deploy action staffs the next exposed outpost automatically; tapping an exposed map outpost targets it directly. There is no target/source-selection step or inspector. Already guarded outposts cannot accept or charge for another permanent guard. Unavailable funds/troops are explained by the action state; the always-visible reserves button supplies more troops.
- **Automatic source order:** Use unassigned troops first. For permanent deployment, candidates are staffed checkpoints. For temporary reinforcement, candidates also include other staffed outposts, excluding the target. Rank candidates by (garrison > 1 ? 0 : 4) + (active tactical threat on source ? 2 : 0) + (checkpoint ? 1 : 0), then by stable tile ID. This favors surplus guards, avoids threatened sources within the same coverage class, and preserves border coverage before an outpost's last guard when reinforcement must expose a post. If coverage loss is unavoidable, display the consequence before sending.
- **Integrity:** Source choice is recalculated in the reducer, actual source IDs are written to the run timeline, and existing cost, soldier conservation, travel/deadline and sufficient-strength checks still apply. The old preview and all-sectors state/actions are removed from normal play; contextual settlement, infiltration and reinforcement modal components stay deleted. Status tooltips and the news center are informational only.
- **Verification:** Reducer regressions cover automatic free/spare/last-guard selection, target exclusion, duplicate sends, no-source rejection, timeline source recording, citizen thresholds, lethal attacks, on-time support and terminal warning removal. Browser checks cover both locales, seven viewport sizes, both danger tiers during a real losing run, direct deployment/reinforcement without contextual dialogs, keyboard input, milestone copy, full-map non-victory and reaching the five-tap ending through automatic transfers.
