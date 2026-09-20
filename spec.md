# Technical & Game Design Specification: "October 7" / "לא מצביעים בלי שיודעים"

> **Document Type:** Game Design & Technical Architecture Specification (`spec.md`)  
> **Target:** Client-Side Browser Game (Mobile-First, Responsive Desktop, Zero-Backend)  
> **Primary Locale:** Hebrew (`he`, RTL) | **Secondary Locale:** English (`en`, LTR)  

---

## 1. System Architecture & Tech Stack

### 1.1 Technology Choices
To deliver an ultra-fast, zero-friction, app-like experience on mobile web without server dependencies:

| Component | Choice | Rationale |
|---|---|---|
| **Framework** | **React 19 + TypeScript + Vite** | Instant reactivity, strict type safety for game logic, and rapid UI state management. |
| **Styling** | **Tailwind CSS + Custom CSS Variables** | Flexible responsive utility classes, native `dir="rtl"` support, and custom CSS for 3D tactile clay-morphic buttons. |
| **Map Rendering Engine** | **Interactive 2D/2.5D SVG + HTML5 Canvas** | Crisp rendering at arbitrary screen densities (Retina/OLED mobile), smooth CSS/SVG animations (pulsing breach markers, troop placement, fence glow), and straightforward event handling. |
| **Audio Engine** | **Web Audio API (Synthesized SFX)** | Zero external audio asset loading delays; tactile clicks, warning sirens, build thuds, and false fanfare generated via native oscillators. |
| **State Management** | **React `useReducer` / Zustand** | Deterministic game state transitions, time-tick simulation engine, and replayable turns. |
| **Build & Bundle** | **Vite Static SPA** | Bundles into single static distribution (`dist/`) suitable for GitHub Pages, Cloudflare Pages, or Netlify. |

### 1.2 Viewport & Layout Strategy
- **Mobile-First Priority:** The primary viewport is designed as a portrait mobile ratio (`390px x 844px` baseline, `aspect-ratio: 9 / 19.5`).
- **Desktop Adaptation:** On viewports wider than `640px`, the game renders in a centered, bezel-framed mobile canvas surrounded by an ambient background with subtle vignette and desktop controls.
- **Orientation Lock & Safe Areas:** Full compatibility with `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to account for mobile notches and navigation bars.

---

## 2. Localization & Directionality (i18n & RTL)

The application is built bilingual from the ground up:
- **Default:** Hebrew (`he`) with `dir="rtl"` on `<html>`.
- **Secondary:** English (`en`) with `dir="ltr"`.
- **Switcher:** Accessible via top header toggle button (`עב / EN`).
- **Typography:**
  - Hebrew: Google Fonts `Rubik` & `Heebo` (clean, rounded, playful yet authoritative).
  - English: `Inter` & `Rubik`.

### 2.1 Translation Dictionary Schema
```typescript
export interface LocaleContent {
  gameTitle: string;
  subTitle: string;
  stats: {
    soldiers: string;
    settlements: string;
    defense: string;
    reservesLeft: string;
    casualties: string;
  };
  actions: {
    buildSettlement: string;
    deployTroops: string;
    callReserves: string;
    lordOfHosts: string;
    evacuateOutpost: string;
    cancel: string;
  };
  lordOfHostsTooltips: string[];
  newsAlerts: {
    id: string;
    headline: string;
    source: string;
  }[];
  defeatModal: {
    title: string;
    subtitle: string;
    explanation: string;
    slogan: string;
    statsHeader: string;
    restartBtn: string;
    shareBtn: string;
  };
  peaceModal: {
    title: string;
    subtitle: string;
    explanation: string;
    slogan: string;
    restartBtn: string;
  };
}
```

---

## 3. Game Entities & State Machine

```
              ┌───────────────────────────┐
              │       INITIAL STATE       │
              │ 8 Soldiers (at border)    │
              │ 0 Settlements, Def: 100%  │
              └─────────────┬─────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      [Build Settlement]          [Call Reserves]
   +1 Outpost in West Bank      +4 Troops (max 3 calls)
   Demands Troop Deployment     Increases Reserve Burnout
               │                         │
               └────────────┬────────────┘
                            │
                            ▼
                   [Deploy Troops]
           Soldiers moved: Border ➔ Outposts
           Border Defense Drops (Green ➔ Orange ➔ Red)
                            │
            ┌───────────────┴───────────────┐
            │ Defense < 50%                 │ Defense == 100% (Outposts evacuated)
            ▼                               ▼
  [Border Breaches Spawn]         [Sustainable Border Security]
  Red exclamation marks (!)       Defensive perimeter fortified
  Pickup trucks & attackers       Disaster averted
            │
            ├───────────────┐
            │ Player taps   │ Defense reaches 0%
            ▼               ▼
   [יהוה צבאות Button]   [OCTOBER 7 CATASTROPHE]
   Shimmering false hope Infiltration into Israel
   Goalposts shift       "7 באוקטובר" Defeat Screen
   Button NEVER activates
   Failure remains real
```

### 3.1 Data Structures (`types.ts`)

```typescript
export type TerrainType = 'israel' | 'westbank' | 'border' | 'sea' | 'desert';

export interface HexCoord {
  q: number;
  r: number;
  s: number;
}

export interface HexTile {
  id: string;
  coord: HexCoord;
  x: number;
  y: number;
  terrain: TerrainType;
  hasSettlement: boolean;
  settlementName?: string;
  garrisonCount: number; // Soldiers stationed here
  isBreached?: boolean;  // If border tile is compromised
  hasAlert?: boolean;     // Alert icon active
}

export interface GameState {
  locale: 'he' | 'en';
  soundEnabled: boolean;
  gameStatus: 'playing' | 'warning' | 'catastrophe' | 'rational_victory';
  
  // Numerical Resources
  settlementsCount: number;
  soldiersTotal: number;
  soldiersAtBorder: number;
  soldiersAtSettlements: number;
  reserveBatchesRemaining: number; // Max 3 (each gives 4 troops)
  casualtiesCount: number;
  defenseScore: number; // 0% to 100%
  
  // Satirical "Lord of Hosts" State
  lordOfHosts: {
    promisedThreshold: number; // Starts at 10, jumps to 15, then 20...
    clicksCount: number;
    lastMessage: string;
    isPermanentlyDisabled: true; // Hard-coded truth: never turns green
  };
  
  // Grid & Active Entities
  tiles: Record<string, HexTile>;
  borderTileIds: string[];
  settlementTileIds: string[];
  activeBreaches: string[];
  infiltratingUnits: {
    id: string;
    x: number;
    y: number;
    targetTileId: string;
    type: 'truck' | 'attacker';
  }[];
  
  // Narrative / News Queue
  currentNewsItem: {
    headline: string;
    source: string;
    timestamp: number;
  } | null;
  turnNumber: number;
}
```

---

## 4. Mathematical Model & Mechanics Balance

### 4.1 The Defense Score Formula
The sovereign border consists of **10 strategic checkpoints** along the Green Line and border perimeter.

$$\text{DefenseScore} = \min\left(100\%, \left(\frac{\text{SoldiersAtBorder}}{\text{RequiredBorderGarrison}}\right) \times 100\%\right)$$

- **Baseline:**
  - $\text{RequiredBorderGarrison} = 8\text{ soldiers}$ (minimum threshold for 100% coverage).
  - Starting State: 8 soldiers total, all 8 at border $\rightarrow \text{Defense} = 100\%$.
- **The Outpost Drain:**
  - Each settlement built requires **1 dedicated garrison soldier**.
  - If player taps "פריסת כוחות" (Deploy Troops), soldiers are pulled from the border pool to garrison un-garrisoned settlements.
  - Example: With 8 total soldiers, building 5 settlements and deploying troops leaves only 3 soldiers on the border:
    $$\text{DefenseScore} = \left(\frac{3}{8}\right) \times 100\% = 37.5\% \quad (\text{Orange/Red Warning})$$

### 4.2 The Reserve Mobilization Decay ("מילואים")
- **Capacity:** The player can tap "מילואים" a maximum of **3 times** in a game session.
  - Call 1: Mobilizes 4 reserve soldiers (Total = 12).
  - Call 2: Mobilizes 4 reserve soldiers (Total = 16).
  - Call 3: Mobilizes 4 reserve soldiers (Total = 20).
  - Call 4+: Button becomes disabled: `"אנשי המילואים נגמרו"` ("No more reserves available").
- **Reserve Fatigue & News Triggers:**
  - After Call 2: News banner alerts:  
    `"הרמטכ״ל הזהיר בקבינט: ללא פתרון למשבר כוח האדם — צה״ל יקרוס"`
  - After Call 3: News banner alerts:  
    `"קריסה במערך המילואים: שיעור ההתייצבות צנח ב-40%"`

### 4.3 Border Breaches & Threat Escalation
- When $\text{DefenseScore} \ge 75\%$: Border is fully secure (Green bar, glowing shield).
- When $50\% \le \text{DefenseScore} < 75\%$: Border under tension (Yellow bar, border fence blinks).
- When $25\% \le \text{DefenseScore} < 50\%$: Critical border strain (Orange bar, 2-3 border tiles display pulsating red exclamation marks `!`).
- When $\text{DefenseScore} < 25\%$:
  - Breaches open! White pickup trucks with gunmen ("טנדרים") spawn at unguarded border points.
  - Settlements also come under attack if left without garrison.
- When $\text{DefenseScore} = 0\%$ (or breaches unaddressed for 10 seconds):
  - Emergency klaxon sound.
  - Full-screen takeover: **"7 באוקטובר"** Defeat modal.

---

## 5. Specification of the Satirical "יהוה צבאות" Button

The button addresses the specific design mandate from **Ziv Yekutieli** and **Jochman**:

### 5.1 Visual Appearance
- Placed in the action tray with distinctive celestial styling (golden rim, Hebrew font with Biblical serif flair, faint ambient shimmer).
- State: **Always Disabled / Grayed-Gold tint** (`opacity-60 cursor-not-allowed filter grayscale-[30%]`).
- Subtext progress indicator beneath the label:
  - Initial: `"דרושים: 10 יישובים"`
  - At 10 settlements: Jumps to `"דרושים: 15 יישובים + 3 חללים"`
  - At 15 settlements: Jumps to `"דרושים: 20 יישובים — הגאולה בפתח!"`
  - When border collapses: Shakes violently with cracks appearing on the button icon.

### 5.2 Click Interaction & Audio
Even though disabled, clicking or tapping the button triggers active feedback:
- **Audio:** A brief, angelic choir tone that abruptly squeaks out / terminates with a dry tick.
- **Haptic:** Double short buzz.
- **Dynamic Pious Snark Toast:** A speech bubble or toast displays a randomized excuse:
  1. *"עוד קצת אמונה! ניסים לא קורים בחינם."* ("A little more faith! Miracles don't happen for free.")
  2. *"נסתרות דרכי האל — המשיכו לבנות!"* ("The Lord moves in mysterious ways — keep building!")
  3. *"הגאולה מתעכבת עקב קטני אמונה בקבינט."* ("Redemption is delayed due to those of little faith in the cabinet.")
  4. *"רק עוד מאחז אחד ומרכבות האש יורדות!"* ("Just one more outpost and the chariots of fire will descend!")
  5. *"אין סומכין על הנס... אבל תמשיכו בכל זאת."* ("One does not rely on miracles... but keep going anyway.")
- **The Reality:** **It never turns green. No fiery chariots descend. The enemy trucks continue their advance.**

---

## 6. The Alternative Strategic Route ("The Creative Solution")

As highlighted in Yoni Haimovich's video, the game allows an alternative path of strategic sanity:

1. **Evacuating Isolated Outposts ("פינוי מאחזים מבודדים"):**
   - The player can tap any settlement on the map to open an inspector card with the option: **"פינוי מאחז / קיצור קווים" (Consolidate Line / Evacuate Outpost)**.
   - When an isolated outpost is dismantled:
     - The soldier garrisoned there is freed up and returned to the border garrison.
     - The defense perimeter shortens.
     - Border defense climbs back toward 100%.
2. **Victory / Awakening Screen ("ביטחון בר-קיימא"):**
   - If the player maintains 100% border defense while keeping settlements to a sustainable minimum (e.g. $\le 4$ border-adjacent settlements):
     - The reserves are demobilized and sent home.
     - News banner flashes: *"גבולות המדינה מוגנים, המילואימניקים שבו לבתיהם"*.
     - Victory modal presents:
       *"בחרתם בביטחון על פני משיחיות. הגבול קצר, צה״ל מוגן, האסון נמנע."*
       Closing text: **"לא מצביעים בלי שיודעים."**

---

## 7. UI / UX Design & Component Layout

### 7.1 Component Hierarchy
```
<App>
  ├── <BackgroundAmbience>           // Subtle desert/olive styling for desktop
  └── <MobileFrame>                  // 390px max-width container, rounded, shadow
        ├── <HeaderBar>
        │     ├── <LanguageToggle>    // "עב" / "EN"
        │     ├── <SoundToggle>       // Mute / Unmute
        │     └── <ResetButton>       // Restart game
        │
        ├── <TopStatusPill>          // Floating rounded white pill
        │     ├── <SoldierCounter>    // Olive helmet icon + active count
        │     ├── <SettlementCounter> // White pitched house icon + count
        │     └── <DefenseMeter>      // Shield icon + Green/Yellow/Red progress bar
        │
        ├── <NewsAlertTicker>         // Marquee / Slide-down breaking news banner
        │
        ├── <HexMapViewport>          // SVG/Canvas interactive map
        │     ├── <IsraelZone>        // Lush green west, coastal waters
        │     ├── <GreenLineBorder>   // Red dashed fence line with checkpoints
        │     ├── <WestBankZone>      // Ochre/sand hex tiles, rolling hills, Dead Sea
        │     ├── <SettlementNodes>   // Clay house tokens + red dotted boundary rings
        │     ├── <SoldierTokens>     // Miniature green soldier figures
        │     ├── <BreachWarningIcons>// Pulsating "!" on unguarded border segments
        │     └── <EnemyVehicles>     // Animated white trucks moving on breach
        │
        ├── <BottomActionDeck>        // Warm clay-morphic 3D action buttons
        │     ├── <Button: מילואים>   // Call Reserves (+4 troops, shows remaining calls)
        │     ├── <Button: פריסת כוחות>// Deploy Troops to unguarded outposts
        │     ├── <Button: בניית יישוב>// Build Settlement in West Bank
        │     └── <Button: יהוה צבאות> // Shimmering gold, disabled, satirical promise
        │
        ├── <SettlementModal>         // Triggered by tapping an outpost (options: guard / evacuate)
        ├── <DefeatModal>             // "7 באוקטובר" takeover card
        └── <VictoryModal>            // "ביטחון מוגן" sustainable security card
```

### 7.2 Tactile Visual Styling (Clay-morphism)
To match the tactile, friendly aesthetic of the original video:
- Buttons use layered CSS box-shadows:
  ```css
  .clay-button {
    background: #e2c09c;
    border-radius: 28px;
    border: 3px solid #f6e6d5;
    box-shadow: 
      inset 0 4px 6px rgba(255, 255, 255, 0.6),
      inset 0 -6px 8px rgba(168, 122, 86, 0.4),
      0 6px 12px rgba(0, 0, 0, 0.15);
    color: #4a2810;
    font-weight: 800;
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .clay-button:active {
    transform: translateY(3px);
    box-shadow: 
      inset 0 2px 4px rgba(255, 255, 255, 0.4),
      inset 0 -3px 4px rgba(168, 122, 86, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.15);
  }
  ```
- **"יהוה צבאות" Button Styling:**
  ```css
  .messianic-button {
    background: linear-gradient(135deg, #e8dfbe, #c5b178);
    border: 3px solid #fff5d0;
    box-shadow: 
      0 0 15px rgba(255, 215, 0, 0.3),
      inset 0 3px 5px rgba(255, 255, 255, 0.8),
      inset 0 -4px 6px rgba(130, 105, 45, 0.4);
    opacity: 0.75;
    cursor: not-allowed;
  }
  ```

---

## 8. Web Audio API Sound Specifications

All sounds are synthesized procedurally via the browser's native `AudioContext`:
1. **Tap / Build Sound:** Short Sine wave drop (`150Hz -> 60Hz` over `80ms`) simulating a wooden/clay block landing.
2. **Deploy Soldier Sound:** Cheerful upward arpeggio (`Major triad: C5 - E5 - G5` over `120ms`).
3. **Reserves Call-up Sound:** Quick dual military horn note (`F4 -> Bb4` with square wave and low-pass filter).
4. **Border Breach Warning:** Harsh oscillating buzzer (`440Hz / 880Hz` alternating alarm).
5. **"יהוה צבאות" Click Sound:** High celestial chime (`1200Hz` bell) that suddenly halts with a comical dull buzz (`80Hz` sawtooth).
6. **October 7 Catastrophe Siren:** Deep resonant low brass drop and siren pulse.

---

## 9. Step-by-Step Implementation Plan

### Phase 1: Project Scaffolding & Setup
- Initialize Vite + React + TypeScript in `/home/jochman/dev/octGame`.
- Configure Tailwind CSS with RTL plugins and custom typography (`Rubik`, `Heebo`).
- Set up bilingual dictionary (`locales/he.ts`, `locales/en.ts`) and RTL/LTR context provider.
- Implement responsive mobile frame container (`<MobileFrame>`).

### Phase 2: Hex Map & Visual Presentation
- Construct isometric hex grid representing the geography of Israel and the West Bank.
- Distinguish the Green coastal region ("ישראל") and Yellow hill region ("הגדה המערבית") with the red border fence.
- Build SVG tokens for settlements (houses with dotted perimeter rings), soldiers (olive figurines), and alert markers.
- Implement click handlers on hex tiles to place settlements and deploy garrisons.

### Phase 3: Core Simulation & Mechanics Engine
- Implement state reducer managing:
  - Settlement count & locations.
  - Total troops, border troops, settlement garrisons.
  - Reserve mobilization counter (max 3 calls).
  - Defense Score calculation formula.
- Build the bottom clay-morphic action deck:
  - `בניית יישוב` (Build Settlement)
  - `פריסת כוחות` (Deploy Troops)
  - `מילואים` (Call Reserves)

### Phase 4: The "יהוה צבאות" Satirical Feature
- Implement the "יהוה צבאות" button in the action deck.
- Integrate moving goalpost counter ("10 יישובים", "15 יישובים + חללים", "הגאולה קרובה").
- Hook up audio & snarky pious toast notifications on tap.
- Enforce invariant: button permanently remains disabled and cannot avert defense failure.

### Phase 5: Threat System, News Ticker & "7 באוקטובר" Catastrophe
- Add real-time defense degradation as troops leave the border.
- Implement animated threat incursions: breach exclamation marks, white pickup trucks advancing across unguarded borders.
- Integrate the breaking news popup with real cabinet headlines ("הרמטכ״ל מזהיר בקבינט...").
- Implement the dramatic full-screen **"7 באוקטובר"** catastrophe modal with statistics breakdown and share card.

### Phase 6: Alternative Strategic Path ("פינוי מאחזים") & Victory State
- Allow clicking settlements to dismantle / evacuate isolated outposts.
- Restore troops to the sovereign border and return Defense Bar to 100%.
- Implement the **"ביטחון בר-קיימא"** victory/rational conclusion modal.

### Phase 7: Polish, Sound & Mobile Testing
- Synthesize all Web Audio sound effects.
- Test touch responsiveness and fluid layout across iOS Safari and Android Chrome resolutions.
- Final code verification, git commit, and readiness for deployment.
