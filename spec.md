# Technical & Game Design Specification: "October 7" / "לא מצביעים בלי שיודעים"

> **Document Type:** Comprehensive Game Design & Technical Architecture Specification (`spec.md`)  
> **Target Platform:** Client-Side Web Application (Mobile-First 390px, Responsive Desktop Bezel, Zero-Backend)  
> **Primary Locale:** Hebrew (`he`, RTL) | **Secondary Locale:** English (`en`, LTR)  
> **Repository:** `/home/jochman/dev/octGame`  
> **Last Synchronized:** 2026-09-20 16:04:07 UTC (Branch: `main`, Iteration #39)

---

## 1. Executive Summary & Core Message

**"October 7"** (working title: *"לא מצביעים בלי שיודעים"*) is an educational, satirical, and interactive mobile simulation game inspired by tactical analysis and political commentary (notably Yoni Haimovich's educational videos). 

The game places the player in the role of a policymaker/commander balancing sovereign border defense along the Green Line against political pressure to construct and garrison isolated outposts in the West Bank. Through accessible mobile idle/strategy mechanics (3D tactile clay-morphic interface, floating shekel coins, and an irresistible satirical **"יהוה צבאות"** false miracle button), players experience firsthand the direct zero-sum tradeoff: **every soldier sent to protect an isolated outpost is a soldier missing from the sovereign border.**

The game concludes in one of two fundamental narrative endings:
1. **The October 7 Catastrophe (`gameStatus: 'catastrophe'`):**
   - **Primary Tactical Trigger (Homeland HP Collapse):** Defense gaps left unsealed along the sovereign border continuously drain Homeland HP (`landHp`) by -0.4 HP/s per hole. Hostile infiltrations that penetrate gaps and reach Israeli cities inflict -20 HP and -20₪ damage. When Homeland HP drops to 0%, the nation's defenses collapse completely, sirens wail, and the October 7 defeat screen appears with a comprehensive policy post-mortem.
   - **Satirical Trigger (Messianic Idol Collapse):** If the border collapses to 0% defense, the false miracle button **"יהוה צבאות"** enters panic mode. Tapping it 7 times shatters the idol (`sounds.playCrackCollapse()`), exposing the tragedy of relying on miracles instead of sovereign strategy.
2. **Rational Victory ("ביטחון בר-קיימא", `gameStatus: 'rational_victory'`):**
   - **Strategic Awakening:** The player chooses sovereign security over messianic illusion.
   - **Exact Path to Victory:**
     1. Player builds at least 3 outposts (`settlementsCount >= 3`) to experience political/military overextension.
     2. Player opens outposts on the map and taps **"פנה מאחז והחזר כוחות לגבול" (Evacuate outpost & return troops to border)**.
     3. Outposts are dismantled down to 2 or fewer (`settlementsCount <= 2`).
     4. All 8 sovereign border checkpoints are fully remanned, achieving 100% border readiness (`defenseScore === 100%`).
     5. The game immediately halts, plays triumphant victory fanfare (`sounds.playVictory()`), and presents the "Sustainable Security" victory debrief.

---

## 2. System Architecture & Tech Stack

### 2.1 Technology Choices

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | **React 19 + TypeScript + Vite** | Strict type safety for state machine transitions, high render performance, instantaneous hot reload. |
| **Styling** | **Tailwind CSS v4 + CSS Variables** | Native `dir="rtl"` and `dir="ltr"` support, 3D tactile clay-morphic button styling, custom drop shadows. |
| **Map Engine** | **Responsive SVG 2D Viewport** | Crisp rendering at all pixel densities (Retina/OLED), exact coordinate control, zero dynamic map resizing to eliminate layout shifts. |
| **Audio Engine** | **Web Audio API (Procedural Synthesizer)** | 100% client-side zero-asset sound generation; safe execution guards for non-browser/SSR environments. |
| **State Management** | **Pure React `useReducer` Architecture** | Deterministic game logic, replayable turns, clean action dispatching, and seamless serialization. |
| **Build & Deployment** | **Vite Static SPA Bundle (`dist/`)** | Zero backend requirement; statically deployable to GitHub Pages, Cloudflare Pages, Netlify, or AWS S3. |

### 2.3 GitHub Pages Deployment Branch
- The GitHub Pages workflow runs automatically only for pushes to `main` on `origin`; `master` is not a deployment branch or workflow trigger.

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
                    │ Budget: 140₪ | Income: 4₪ │
                    └─────────────┬─────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
[Build Settlement]        [Call Reserves]             [Collect Shekels]
Cost: 100₪                +4 Troops (Max 3)           Floating Sea Coins
Places Outpost in WB      Slows Passive Income        +30₪ Cash Infusion
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

```typescript
export type TerrainType = 'israel' | 'westbank' | 'border' | 'sea' | 'desert';

export interface HexCoord {
  q: number;
  r: number;
}

export interface HexTile {
  id: string;
  coord: HexCoord;
  x: number;
  y: number;
  terrain: TerrainType;
  label?: string;
  subLabel?: string;
  hasSettlement: boolean;
  settlementName?: string;
  garrisonCount: number;      // Soldiers stationed here
  isBorderCheckpoint?: boolean;
  isLocalCity?: boolean;      // Palestinian urban center in West Bank
  isBreached?: boolean;
  hasAlert?: boolean;
  hp?: number;                // Settlement health: 0..100
  maxHp?: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  headlineHe?: string;
  headlineEn?: string;
  sourceHe?: string;
  sourceEn?: string;
  category?: 'politics' | 'celebs' | 'military' | 'rabbis';
  arcId?: string;
  arcStep?: number;
  totalArcSteps?: number;
  timestamp?: string;
  isUrgent?: boolean;
}

export interface CollectibleCoin {
  id: string;
  x: number;
  y: number;
  amount: number;
  createdAt: number;
}

export interface GreenSideAttack {
  id: string;
  breachId: string;
  targetCityId: string;
  targetCityName: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0.0 -> 1.0
  createdAt: number;
  durationMs: number;
}

export interface ClashEvent {
  id: string;
  settlementId: string;
  arabCityId: string;
  settlerInitiated: boolean;
  settlementName: string;
  arabCityName: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  midX: number;
  midY: number;
  createdAt: number;
  durationMs: number;
  title: string;
  isGarrisoned: boolean;
}

export interface FinancialPenalty {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

export interface FinancialGrant {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

export interface GameState {
  locale: 'he' | 'en';
  soundEnabled: boolean;
  gameStatus: 'playing' | 'catastrophe' | 'rational_victory';
  budget: number;
  maxBudget: number;
  incomeRate: number;
  settlementsCount: number;
  soldiersTotal: number;
  soldiersAtBorder: number;
  soldiersAtSettlements: number;
  reservesBatchesLeft: number; // Starts at 3
  defenseScore: number;       // 0..100%
  isBuildMode: boolean;
  constructions: Record<string, { tileId: string; progress: number }>;
  collectibleCoins: CollectibleCoin[];
  lordOfHosts: {
    chargePercent: number;
    stage: 1 | 2 | 3 | 4;
    stageGoalText: string;
    countdownSeconds: number | null;
    isPanicMashMode: boolean;
    mashCount: number;
    isCracked: boolean;
    piousToast: string | null;
  };
  tiles: Record<string, HexTile>;
  activeBreaches: string[];
  infiltratingTrucks: {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    progress: number;
  }[];
  currentNews: NewsItem | null;
  newsHistory: NewsItem[];
  activeStoryArcs: Record<string, number>;
  lastNewsTick: number;
  selectedSettlementId: string | null;
  selectedInfiltrationId: string | null;
  isNewsModalOpen: boolean;
  isScreenShaking: boolean;
  sparks: { id: string; startX: number; startY: number; targetX: number; targetY: number; createdAt: number }[];
  movingTroops: { id: string; fromX: number; fromY: number; toX: number; toY: number; createdAt: number }[];
  clashes: ClashEvent[];
  lastClashTick: number;
  latestPenalty: FinancialPenalty | null;
  lastPenaltyTick: number;
  latestGrant: FinancialGrant | null;
  greenSideAttacks: GreenSideAttack[];
  lastGreenAttackTick: number;
  landHp: number;             // 0..100% (National resilience / Homeland integrity)
  interceptedToast: InterceptionToast | null;
  isIntroModalOpen: boolean;  // Entrance instruction modal visibility
  isPaused: boolean;          // Smart pause during modals or user manual pause
  infoPopover: { title: string; text: string } | null; // Tap-to-explain stat popovers
}
```

---

## 5. Mathematical Balancing & Economic Equations

### 5.1 Game Session Target Duration
- **Fast/Skilled Player:** ~4 to 5 minutes.
- **Standard/Slow Player:** ~6 to 7 minutes.

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
  $$\text{MaxBudget} = 300\text{₪} + (\text{BuiltSettlements} \times 20\text{₪})$$
- **Paced Income Formula:**
  - **Base Civilian Production:** Calling military reserves pulls workers from the civilian economy:
    $$\text{CallsMade} = 3 - \text{reservesBatchesLeft}$$
    $$\text{BaseCivilianIncome} = \max\left(1\text{₪/s}, 3 - \text{CallsMade}\right)$$
  - **Guarded Outpost Coalition Multiplier:** Each garrisoned outpost yields government funding:
    $$\text{GuardedBonus} = \text{GuardedSettlements} \times 1\text{₪/s}$$
  - **Effective Passive Income Rate:**
    $$\text{IncomeRate} = \text{BaseCivilianIncome} + \text{GuardedBonus}$$

| Guarded Outposts | Base Civilian (0 calls) | Settlement Bonus | Total Passive Income | Player Experience |
|---|---|---|---|---|
| **0 outposts** | +3 ₪/s | +0 ₪/s | +3 ₪/s | Balanced civilian economy |
| **1 outpost** | +3 ₪/s | +1 ₪/s | +4 ₪/s | Paced early growth |
| **2 outposts** | +3 ₪/s | +2 ₪/s | +5 ₪/s | Moderate treasury growth |
| **4 outposts** | +3 ₪/s | +4 ₪/s | +7 ₪/s | Rewarding incentive to guard outposts |
| **8 outposts** | +3 ₪/s | +8 ₪/s | +11 ₪/s | Peak expansion income |

### 5.4 Troop Deployment Cost ("עלות פריסת כוחות")
- **Operational Expenditure:** Deploying soldiers from the sovereign border to West Bank outposts costs **25₪ per transferred soldier** to finance mobile trailers, armored transport, and security infrastructure:
  $$\text{DeploymentCost} = \text{TransferredSoldiers} \times 25\text{₪}$$
  $$\text{NewBudget} = \max(0, \text{Budget} - \text{DeploymentCost})$$
- **Affordability Requirement:** If `state.budget < 25₪`, deployment is disabled and button indicates `(נדרש 25₪)`.
- **Audio & Visual Feedback:**
  - Deployment sound (`sounds.playDeploy()`) and expenditure thud (`sounds.playPenalty()`).
  - Floating deduction tag appears in the status pill: `💸 -25₪ (עלות פריסת כוחות)`.
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
  - Infiltration raid striking an Israeli city: **-20 HP** directly to Land HP, **-20₪** damage, and screen shake.
  - West Bank settlement destroyed in a clash: **-10 HP** to Land HP.
- **Resilience Recovery:**
  - When border is 100% fortified with 0 holes and 0 active attacks: recovers **+0.5 HP/s** (up to 100%).
  - Successfully sealing a breach / thwarting an attack: awards **+3 to +5 HP**.
- **Defeat Threshold:**
  If `landHp <= 0`, sovereign defenses collapse and the **October 7 Catastrophe** defeat modal triggers immediately.

### 5.7 Israeli Cities Shekel Collection ("כספים קואליציוניים")
- **Placement:** Spawns on sovereign Israeli cities.
- **Controlled Quantity:** Strictly at most **1 coin** present at a time (cooldown: 16s between spawns).
- **Balanced Value:** **+15₪** per coin, with 3D gold shekel animation, 30px touch hitbox, and cash register chime.

---

## 6. Combat, Clashes & Infiltration Mechanics

### 6.1 West Bank Clashes & Settlement HP Degradation
- Clashes occur between built outposts and adjacent Palestinian cities (e.g. Nablus, Ramallah, Jenin, Hebron).
- **Frequency:** Kept spaced out (~1 every 40 seconds) to prevent visual chaos.
- **Garrisoned Settlements:** Soldier defends the perimeter. Sound: tactical clash sfx. HP remains protected.
- **Ungarrisoned Outposts (HP Bar Mechanic):**
  - Exposed outposts lack IDF protection.
  - When attacked, the outpost suffers **-35 HP** damage (visible health bar).
  - Sound: emergency siren and alert ring.
  - At **0 HP**, the outpost is burned/destroyed, settlement count drops by 1, and the disaster is reported on the news wire.

### 6.2 Green-Side Hostile Infiltrations (16-Second Human-Readable Transit)
- Whenever an unmanned border checkpoint exists (`isBreached: true`), hostile raiding squads can penetrate into the Green side.
- **Extended 16-Second Response Window:**
  - Raiders traverse along dashed attack vectors with `durationMs = 16000` (~16 seconds total transit time, speed `progress += 0.065/tick`).
  - This guarantees ample human reaction time to comfortably read the alert headline, digest the tactical situation, and dispatch countermeasures.
  - Live countdown tag displayed directly above the moving hostile vehicle: `🎯 [עיר] (15ש׳ לבלימה)`.
- **Tri-Fold Actionable Defense:**
  1. **Floating Emergency Alert with Direct Button:** The urgent operational alert remains visible for 14 seconds and embeds a direct action button: `[🛡️ לחץ כאן לבלימת החדירה!]` opening the defense modal instantly.
  2. **The Reserves Button:** Turns red, pulsing with `🚨 בלום חדירה! / Intercept!`.
  3. **Map Truck & City Clicking:** Clicking the raider truck or the target city opens `InfiltrationDefenseModal` showing the animated approach bar with exact seconds remaining (`~14s left to intercept`).
- **Failure to Intercept:** If the truck reaches the city: **-25₪** direct damage, -6% defense drop, and city alert.

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

## 10. Mobile Single-Screen Viewport Architecture & Full-Screen Execution

To deliver an authentic arcade/tactical mobile feel with **strictly zero vertical scrolling and true full-screen execution**:
1. **Root-Level Viewport Lock:** `html, body, #root` use `position: fixed; inset: 0; width: 100%; height: 100dvh; overflow: hidden; overscroll-behavior: none; touch-action: manipulation;`. This eliminates elastic rubber-banding, browser chrome expansion jumps, and accidental page scrolling across all mobile browsers (iOS Safari, Android Chrome, in-app webviews).
2. **Edge-to-Edge Mobile Container:** `MobileFrame` occupies 100% of the mobile screen (`w-full h-[100dvh] max-w-none rounded-none border-none p-0`), restricting the `max-w-[430px]` framed smartphone mockup strictly to desktop screens (`sm:`). This prevents letterboxing or dark bars on wider phones.
3. **Adaptive Zero-Scroll Flex-Map Engine:** `HexMapCanvas` uses `flex-1 min-h-0 max-h-full overflow-hidden` with `viewBox="0 0 460 565"` and `preserveAspectRatio="xMidYMid meet"`. The SVG map automatically scales dynamically into whatever viewport height remains, guaranteeing that the **"יהוה צבאות"** button is always 100% visible on screen above the bezel.
4. **Native Browser Fullscreen API:** `HeaderBar` provides a dedicated **Fullscreen Toggle button (`Maximize2` / `Minimize2`)** allowing mobile and desktop players to toggle browser fullscreen on demand (`document.documentElement.requestFullscreen()`).
5. **Interactive Entrance Instruction Modal (`EntranceInstructionModal.tsx`):**
   - Automatically welcomes players on their first visit (persisted via `localStorage: 'oct7_seen_intro_guide'`).
   - Reopenable at any time during gameplay via the dedicated **`❓` (HelpCircle)** button in `HeaderBar`.
   - Concisely frames the satirical narrative mission:
     - **The Core Dilemma:** Zero-sum manpower tradeoff between West Bank outposts and sovereign border defense.
     - **National Goal:** Settle all hilltops across Samaria and Judea to awaken the supreme miracle of "יהוה צבאות" at 100%!
     - **Step 1:** Constructing hill-top outposts (100₪).
     - **Step 2:** Troop deployment cost (25₪/soldier) to protect outposts from clashes and fines, which pulls soldiers from the border.
     - **Step 3:** Sovereign border breach risk & Homeland HP (`landHp`) continuous bleed (-0.4 HP/s per hole) and raid hits (-20% HP).
     - **Step 4:** Charging "יהוה צבאות" to 100% vs. Risk of October 7 collapse (0% HP or button shattering upon 7 panic mashing taps).
     - **Narrative Integrity:** The tutorial deliberately avoids revealing the rational evacuation victory condition upfront, allowing players to organically discover that prioritizing sovereign borders over messianic expansion is the true path to sustainable security.
6. **Smart Auto-Pause & Manual Pause Engine:**
   - **Smart Auto-Pause:** Game loop interval automatically pauses whenever overlay modals are opened (`NewsFeedModal`, `EntranceInstructionModal`, `SettlementInspectorModal`, `InfiltrationDefenseModal`), removing reading pressure on mobile devices.
   - **Manual Pause Button:** Dedicated `Play` / `Pause` toggle button in `HeaderBar` (`TOGGLE_PAUSE`) with a floating amber banner (`המשחק מושהה - לחץ להמשך / Game Paused - tap to resume`).
7. **Mobile Tactile Feedback Engine (`src/utils/haptics.ts`):**
   - Web Vibration API (`navigator.vibrate`) integration for mobile devices:
     - Light click tick (`haptics.light()`, 10ms) on buttons, troop deployments, and outposts.
     - Cash & Tax double-pulse (`haptics.coin()`, `[15, 30, 15]ms`) when tapping city taxes or collecting coins.
     - Infiltration warning pulse (`haptics.warning()`, `[30, 40, 30]ms`) on siren pings and panic mashing.
     - Impact strike vibration (`haptics.impact()`, `[60, 50, 60]ms`) on border collapse.
8. **Tap-to-Explain Stat Popovers (`TopStatusPill.tsx`):**
   - Tapping any stat (Soldiers, Settlements, Budget, Land HP, Border Readiness) triggers a floating informational speech bubble (`SHOW_INFO_POPOVER`) with concise bilingual explanations.
   - Auto-dismisses after 4.5 seconds or immediately upon tapping `✕` / popover body (`CLEAR_INFO_POPOVER`).
   - Floats absolutely (`absolute top-full mt-1.5`) with 0px layout height to preserve zero-scroll mobile geometry.
9. **3-Step Guided Onboarding Quests (`BottomActionDeck.tsx`):**
   - Built directly into the Tactical Situation Advisor bar during early play:
     - **Quest 1/3:** `🎯 משימה 1/3: הקם מאחז ראשון בגבעות (לחץ 'בניית יישוב')` (shown when `settlementsCount === 0`).
     - **Quest 2/3:** `🎯 משימה 2/3: אבטח את המאחז (לחץ 'פריסת כוחות' - 25₪)` (shown when outposts are ungarrisoned).
     - **Quest 3/3:** `🎯 משימה 3/3: הגבול נחשף! בלום חדירה (⚠️) או טען את 'יהוה צבאות'!` (shown when border breaches emerge).
     - Emergency raid alerts (`🚨`) dynamically preempt all quests during active combat.

---

## 11. Tactical Interception & Defense Mechanics

1. **Direct Breach Containment (`SEAL_BREACH` & Prioritized Targeting):**
   - Tapping an unmanned border checkpoint bearing the `⚠️ פרצה (לחץ לבלימה)` prompt immediately dispatches `SEAL_BREACH`.
   - **Troop Recall Priority:** If soldiers are garrisoned in West Bank outposts, the system immediately pulls a soldier from the closest outpost and leaps them straight to the breached checkpoint.
   - The checkpoint is instantly re-manned (`garrisonCount = 1`, `isBreached = false`, `hasAlert = false`), the sovereign defense score increases, and any hostile squad traversing that breach is intercepted on the spot.
   - Triggers `sounds.playShieldChime()` and pops the feedback banner: `🛡️ חדירה סוכלה בהצלחה! לוחם הוחזר ממאחז לבלימת הפרצה!`.
   - **Target Prioritization in `RECALL_TROOP`:** Recalling troops from settlement modals now strictly targets the checkpoint under active hostile attack rather than choosing an empty checkpoint at random, guaranteeing that returning a soldier always thwarts the immediate threat.
   - **Reserve Fallback:** If zero soldiers are deployed in outposts, `SEAL_BREACH` mobilizes available reserves specifically to the targeted breach.

2. **West Bank Clashes: Skewed Against Non-Secured Settlements:**
   - When non-secured outposts (`garrisonCount === 0`) are present in the West Bank:
     - Clash pacing accelerates dramatically: cooldown shrinks from 32s to 14s, and trigger chance climbs to 42%.
     - **85% Probability Weight:** Clashes are heavily weighted to strike non-secured, exposed outposts rather than garrisoned settlements.
     - **Vulnerability & Attrition:** Non-secured outposts endure direct damage (-35 HP per incident, sirens, -15₪ damages) and are wiped off the map if HP reaches 0%.
     - **Narrative Framing:** Breaking headlines highlight the security vacuum (*"מאחז חשוף תחת מתקפה: בהיעדר כוחות צה״ל לשמירה..."*), creating a sharp dilemma between protecting sovereign borders and preventing outpost destruction.

3. **Settlement Inspector Tactical Feedback:**
   - In `SettlementInspectorModal`, the troop recall button displays explicit strategic benefit: `⚡ +12.5% הגנה לקו הגבול הריבוני בהחזרת חייל!`.

4. **Garrison Benefits & Outpost Repair:**
   - Outposts with stationed troops display a miniature IDF shield badge (`✡`).
   - Garrisoned outposts regenerate durability at +5 HP/second, while ungarrisoned outposts degrade during local clashes.

5. **Perimeter Collapse Visuals:**
   - Sovereign border line turns dashed amber below 50% defense.
   - Below 25% defense, the border line turns glowing pulsating red with crackling hazard alert sparks along the Green Line.

---

## 12. Defeat Screen Post-Mortem & Social Sharing

1. **Choice-Based Post-Mortem Timeline:**
   - `October7DefeatModal` breaks down the player's chain of policy decisions that precipitated the tragedy:
     - Number of isolated hill-top outposts established.
     - Quantity of IDF soldiers drained from sovereign border to West Bank guarding duties.
     - Exhaustion of civilian reserves (impacting economic output).
     - Reliance on the messianic false-hope button ("יהוה צבאות").
     - Multi-point simultaneous collapse of the sovereign border.
2. **1-Click WhatsApp Sharing:**
   - Dedicated direct WhatsApp share button (`https://api.whatsapp.com/send?text=...`) enabling immediate viral civic discourse.
3. **Responsive Modal Container:**
   - Scoped with `max-h-[94dvh] overflow-y-auto` to guarantee full readability on every mobile screen size.

---

## 13. Verification & Quality Assurance

- **TypeScript Compilation:** Strict verification with 0 errors via `tsc`.
- **Production Build:** `npm run build` bundles client in ~170ms into static `dist/`.
- **Browser Compatibility:** Tested on mobile WebKit (Safari), Blink (Chrome/Edge/Android), and Gecko (Firefox).
- **Responsive Geometry:** SVG map coordinates remain pixel-perfect across standard mobile displays and wide desktop monitors.

---

## 14. Authorial & Educational Inscription

> **"לא מצביעים בלי שיודעים."**  
> Dedicated to clarity, public responsibility, and sovereign defense prioritization.
