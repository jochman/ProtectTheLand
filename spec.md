# Technical & Game Design Specification: "October 7" / "לא מצביעים בלי שיודעים"

> **Document Type:** Comprehensive Game Design & Technical Architecture Specification (`spec.md`)  
> **Target Platform:** Client-Side Web Application (Mobile-First 390px, Responsive Desktop Bezel, Zero-Backend)  
> **Primary Locale:** Hebrew (`he`, RTL) | **Secondary Locale:** English (`en`, LTR)  
> **Repository:** `/home/jochman/dev/octGame`  
> **Last Synchronized:** 2026-09-20 15:26:07 UTC (Branch: `main`, Iteration #31)

---

## 1. Executive Summary & Core Message

**"October 7"** (working title: *"לא מצביעים בלי שיודעים"*) is an educational, satirical, and interactive mobile simulation game inspired by tactical analysis and political commentary (notably Yoni Haimovich's educational videos). 

The game places the player in the role of a policymaker/commander balancing sovereign border defense along the Green Line against political pressure to construct and garrison isolated outposts in the West Bank. Through accessible mobile idle/strategy mechanics (3D tactile clay-morphic interface, floating shekel coins, and an irresistible satirical **"יהוה צבאות"** false miracle button), players experience firsthand the direct zero-sum tradeoff: **every soldier sent to protect an isolated outpost is a soldier missing from the sovereign border.**

The game concludes in either:
1. **The October 7 Catastrophe:** The collapse of sovereign defenses, hostile infiltrations into Israeli population centers, the shattering of messianic illusions, and a sobering educational debrief.
2. **Rational Victory ("ביטחון בר-קיימא"):** Strategic awakening, tactical withdrawal from isolated outposts, restoration of 100% sovereign border defense, and demobilization of civilian reserves.

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
  greenSideAttacks: GreenSideAttack[];
  lastGreenAttackTick: number;
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

### 5.3 Treasury & Labor-Burnout Model
- **Settlement Construction Cost:** 100₪.
- **Initial Treasury:** 140₪ (Allows immediate first settlement + buffer).
- **Treasury Cap:** 300₪.
- **Civilian Economy Decay Formula:**
  Calling military reserves pulls workers from the productive civilian economy:

$$\text{CallsMade} = 3 - \text{reservesBatchesLeft}$$

$$\text{IncomeRate} = \max\left(2\text{₪/s}, 4 - \text{CallsMade}\right)$$

| Reserves Calls Made | Total Troops Available | Passive Income Rate | Economic Status |
|---|---|---|---|
| **0 calls** | 8 | +4 ₪/sec | Healthy economy |
| **1 call** | 12 | +3 ₪/sec | Minor civilian slowdown |
| **2 calls** | 16 | +2 ₪/sec | Labor shortage alert |
| **3 calls (Max)** | 20 | +2 ₪/sec | Complete mobilization burnout |

### 5.4 Israeli Cities Shekel Collection ("כספים קואליציוניים")
- **Placement:** Spawns directly on actual sovereign Israeli cities (Tel Aviv `[105, 210]`, Haifa `[115, 60]`, Netanya/Sharon `[110, 135]`, Shfela/Modi'in `[100, 285]`, Ashdod `[95, 360]`, Beer Sheva `[95, 435]`). Completely separated from the Mediterranean sea tiles.
- **Controlled Quantity:** Strictly at most **1 coin** present on screen at any time (initial: 1 coin at Tel Aviv; cooldown: 14s between spawns).
- **Balanced Value:** **+25₪** per coin (calibrated to support the 5-7 minute game loop without flooding treasury).
- **Visuals & Feedback:** 3D gold shekel with `<animateTransform>` bobbing, generous 30px touch hitbox, badge `+25₪`, cash register chime, and golden spark burst effect on collection.

### 5.5 Settlement Financial Drain Penalties
Building outposts creates permanent infrastructure drain (bypass roads, armored shuttles, security squads):
- **Cooldown:** At least 28s between penalties.
- **Probability:** $\min(0.28, 0.04 + \text{settlements} \times 0.025)$.
- **Penalty Amount:** $18 + (\text{settlements} \times 7) \pm 5\text{₪}$ (scales between 25₪ and 95₪).

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

### 6.2 Green-Side Hostile Infiltrations
- Whenever an unmanned border checkpoint exists (`isBreached: true`), hostile raiding squads can penetrate into the Green side.
- Raider pickup trucks traverse along dashed attack vectors toward sovereign Israeli population centers (Tel Aviv, Netanya, Haifa, Gaza Envelope, etc.).
- **Actionable Player Defense:**
  1. The **Reserves Button** turns red, pulsing with `🚨 בלום חדירה! / Intercept!`.
  2. Clicking the raider truck, target city, or alert opens the **`InfiltrationDefenseModal`**.
  3. The modal clearly provides the tactical choices:
     - **Call Reserves:** Seals the border and immediately intercepts the raid squad.
     - **Recall Troop:** Returns a soldier from an outpost to the western border.
- **Failure to Intercept:** If the truck reaches the city: **-25₪** direct damage, defense drop, and city alert.

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

## 10. Mobile Single-Screen Viewport Architecture (`100dvh`)

To deliver an authentic arcade/tactical mobile feel with **strictly zero vertical scrolling**:
1. **Dynamic Viewport Height (`100dvh`):** `MobileFrame` uses `h-[100dvh] max-h-[100dvh] overflow-hidden` to adapt perfectly to mobile browser navigation bars without content shifting or spilling over.
2. **Responsive Flex-Map Engine:** `HexMapCanvas` uses `flex-1 min-h-[220px] max-h-full overflow-hidden` with `viewBox="0 0 460 565"` and `preserveAspectRatio="xMidYMid meet"`. The map automatically scales dynamically into whatever viewport height remains, guaranteeing that the **"יהוה צבאות"** button is always 100% visible on screen above the bezel.
3. **Adaptive Component Heights:** Header bar, status pills, and action decks feature responsive compact paddings (`py-1 sm:py-2`), ensuring complete one-screen fit across iPhone SE, iPhone 13/14/15, and Android devices.

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
