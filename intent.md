# Intent: "October 7" / "לא מצביעים בלי שיודעים" — The Security Dilemma Simulation

> **Document Type:** Intent Specification ("What we want to get")  
> **Source Inspirations:**
> - Core Game Concept & Mechanics: [Yoni Haimovich on X (Tweet 2101197799173873977)](https://x.com/YoniHaimovich/status/2101197799173873977)
> - Messianic Button Concept: [Ziv Yekutieli on X (Tweet 2101312767055565175)](https://x.com/ZivYekutieli/status/2101312767055565175)
> - The Empty Promise Modification: [Jochman on X (Tweet 2101404643268190506)](https://x.com/jochman/status/2101404643268190506)
>
> **Target Platform:** Client-side Web Browser (Mobile-First responsive, Desktop-compatible).  
> **Languages:** Bilingual (Hebrew / עברית — RTL primary, English / EN — LTR secondary).

---

## 1. High-Level Vision & Purpose

### 1.1 The Premise
The project is an interactive, satirical strategy-simulation browser game that puts the player in the seat of Israel's national defense and settlement planning leadership.

On the surface, it presents itself with the bubbly, tactile, addictive aesthetics of modern mobile casual games (reminiscent of idle builders or mini strategy games). However, beneath this playful veneer lies an unyielding simulation of real strategic mathematics: **the zero-sum trade-off between securing sovereign borders and dispersing military manpower to guard endless isolated settlements deep across the Green Line**.

### 1.2 The Core Dilemma
In public political discourse, the assertion is often made that civilian settlements in the West Bank bolster national security ("ההתיישבות תורמת לביטחון"). 

The game subjects this assertion to an interactive stress test:
1. Every settlement built in the West Bank is isolated and encircled by hostile territory.
2. Every settlement demands military protection (infantry garrisons, security perimeters, patrol routes).
3. The military's manpower pool is strictly finite.
4. Diverting soldiers deep into the West Bank dilutes the garrisons guarding the sovereign international borders.
5. As border checkpoints are abandoned, holes ("חורים בהגנה") appear along the fence.
6. Calling up reserves ("מילואים") can plug the gaps temporarily, but reserve forces inevitably burn out and run dry ("אנשי המילואים נגמרים").
7. When the sovereign border defense collapses to zero, hostile forces breach into sovereign Israeli territory, culminating in the horrific historical catastrophe of **October 7th ("7 באוקטובר")**.

### 1.3 The "יהוה צבאות" (Lord of Hosts) Satirical Button
A central modification to the game incorporates the discourse between Ziv Yekutieli and Jochman regarding messianic logic:

* **The Messianic Fantasy (Ziv's Post):**  
  Messianic ideology rationalizes unsustainable tactical risk with the supernatural promise that when things get dire enough — after enough outposts are built and enough blood is spilled ("מספיק ישובים, ומספיק חללים") — God / "Lord of Hosts" (יהוה צבאות) will intervene, fiery chariots will descend from the heavens, purify the land of enemies, and achieve total apocalyptic victory ("גוג ומגוג").
  
* **The Authentic Reality (Jochman's Modification):**  
  The game includes the prominent, glowing button labeled **"יהוה צבאות" (Lord of Hosts)**. It tantalizes the player with the illusion of an ultimate bail-out, teasing escalating milestones ("Need 10 settlements...", "Need 15 settlements & casualties...", "Almost there! Have faith!").  
  **However, the button NEVER turns green. It never unlocks. It is purely an empty promise without any empirical basis.**  
  When tapped, it produces pious excuses ("עוד קצת אמונה", "נסתרות דרכי האל", "הגאולה מתעכבת עקב חולשת הרוח"). When the catastrophe strikes, divine intervention does not arrive; only the catastrophic consequences of real-world neglect remain.

### 1.4 The Strategic Awakening & Educational Resolution
The game is not merely an exercise in inevitable doom; it is an exercise in accountability. As Yoni Haimovich highlights in his conclusion:
> *"אתם תצטרכו לשאול את עצמכם אם היישובים האלה באמת תורמים לביטחון או שהם דווקא פוגעים בו, ואולי תהיו יצירתיים ותצליחו למצוא פתרון אחר. זה שאם לא תעשו כלום — זה יתפוצץ לכולנו בפנים: 7 באוקטובר. לא מצביעים בלי שיודעים."*

Players can discover that if they choose a different strategy — declining to sprawl into isolated deep outposts, or actively consolidating/evacuating vulnerable outposts — the defensive perimeter shrinks, border defense stabilizes at 100%, reserves are relieved, and catastrophic breaches are avoided.

The overarching takeaway embodies the civic movement slogan:  
**"לא מצביעים בלי שיודעים" ("Do not vote without knowing the cost").**

---

## 2. Emotional Arc & Player Experience

```
[Phase 1: Euphoric Sprawl]
   │  Player taps "בניית יישוב". Settlements pop up with cheery chimes.
   │  The board expands. Numbers go up.
   ▼
[Phase 2: The Resource Squeeze]
   │  Settlements demand protection. Tap "פריסת כוחות".
   │  Soldiers leave the border to guard outposts.
   │  "הגנה" (Defense Bar) drops from Green to Orange.
   │  Exclamation marks (!) appear on unmanned border sections.
   ▼
[Phase 3: Reserve Burnout & Cabinet Alarms]
   │  Player panic-taps "מילואים" to patch the border.
   │  Headlines flash: "הרמטכ״ל מזהיר: צה״ל יקרוס".
   │  The reserve pool runs out. Border breaches appear.
   │  Hostile pickup trucks ("טנדרים") approach the fence.
   ▼
[Phase 4: The False Hope — "יהוה צבאות"]
   │  Player looks desperately at the shiny "יהוה צבאות" button.
   │  It promises salvation if they just hold on and build more.
   │  Player clicks it: "עוד קצת אמונה...", but the button stays dead.
   ▼
[Phase 5: The Reckoning]
   │  Defense hits 0%. Infiltration ensues.
   │  Massive Red Headline: "7 באוקטובר".
   │  A sobering debrief detailing the exact cost in soldiers, outposts, and borders.
   │  Closing motto: "לא מצביעים בלי שיודעים."
   │  Option to explore alternative strategic choices (Consolidation / Rational Defense).
```

---

## 3. Scope & Operational Constraints

| Dimension | Target Specification |
|---|---|
| **Platform** | Any modern mobile & desktop web browser (iOS Safari, Android Chrome, desktop browsers). |
| **Form Factor** | **Mobile-First portrait** (9:16 aspect container, centered with a clean backdrop on wide desktop screens). |
| **Backend** | **Frontend-only (Zero Server)**. Static HTML5 / CSS / JavaScript (bundleable via Vite). Deployable anywhere (Vercel, Cloudflare Pages, GitHub Pages). |
| **Languages** | Full bilingual support: **Hebrew (עברית)** as the primary native voice with RTL layout, **English (EN)** with LTR layout. Dynamic single-tap toggle. |
| **Load Time** | Sub-second load time, zero heavyweight 3D engines. Lightweight 2D/2.5D SVG/Canvas isometric hex presentation that mimics the 3D clay aesthetic. |
| **Sound & Haptics** | Web Audio API synthesized tactile sounds and mobile vibration feedback (can be muted at any time). |

---

## 4. Key Deliverables Required for Success

1. **Crisp, Faithful Visual Identity:**  
   Recreate the exact look and feel of Yoni's video:
   - Pastel green western coastal plain ("ישראל").
   - Ochre/sand eastern hill terrain ("הגדה המערבית").
   - Red undulating Green Line / border barrier.
   - Distinctive 3D-effect clay buttons at the bottom.
   - Top status pill with soldier icon, house icon, and shield defense meter.
2. **Transparent Mathematical Simulation:**  
   Clear relationship between outposts, soldier requirements, border coverage, and threat generation.
3. **The "יהוה צבאות" Satirical Mechanism:**  
   Visually enticing, continuously moving goalposts, definitively unclickable/ineffective, reinforcing the narrative critique.
4. **Replayability & Strategic Alternatives:**  
   Allowing players to experience both the blind messianic path to disaster and the rational strategic alternative that secures sovereign borders.
5. **Debrief & Social Sharing Card:**  
   Generates a shareable graphic / stat card ("I tried to guard 18 outposts with 12 soldiers... result: 7 באוקטובר. לא מצביעים בלי שיודעים").
