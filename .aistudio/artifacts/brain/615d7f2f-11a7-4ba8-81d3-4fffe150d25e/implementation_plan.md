# ApexFit — Athlete Profile Hub, Luxury Themes & Iridescent Glow Enhancement

A major visual and functional upgrade to ApexFit, introducing a dedicated **Athlete Profile Hub**, a **Dynamic Luxury Theme Engine** with 4 curated high-end aesthetics, a **Manual PR & Bodyweight Manager**, and **Subtle Animated Rotating Rainbow Border Shimmers** on key action buttons.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product design choices have been confirmed based on your responses:
> - **Luxury Color Themes**: 4 switchable high-end palettes:
>   1. *Electric Lime* (`#CCFF00` accent on deep carbon black)
>   2. *Royal Obsidian Gold* (`#F59E0B` / `#FBBF24` warm metallic gold on rich obsidian)
>   3. *Crimson Velvet* (`#EF4444` / `#F43F5E` aggressive luxury carnelian ruby)
>   4. *Midnight Emerald* (`#10B981` / `#059669` deep racing green and metallic jade)
> - **Rainbow Glow Texture**: Subtle animated rotating conic-gradient rainbow shimmer border applied to hero action buttons (`Start Empty Workout`, `Chat with Coach`, `Finish Workout`).
> - **Athlete Profile Hub Features**: Custom athlete display name, avatar selector, bodyweight & target metrics logger, manual PR adjustment & history editor, and live theme switcher.

---

### 1. Overview & Core Concept

- **What It Does**: Enhances ApexFit with personal identity and visual luxury. Athletes can customize their appearance, adjust their PR records manually if they already know their maximum lifts from previous training, track bodyweight weigh-ins over time, and switch between four dark luxury palettes.
- **Visual Polish**: Replaces flat borders on key call-to-action buttons with a bespoke CSS conic-gradient rotating rainbow iridescent border that catches the eye without causing visual clutter.
- **Key Value**: Turns ApexFit into a bespoke luxury training companion tailored to each lifter's style and visual taste while maintaining offline local storage and Cloud Firestore sync.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Athlete Profile & Identity Management**:
   - Tap the new Profile tab in bottom navigation or header avatar.
   - Edit athlete display name, fitness bio, and select an athlete avatar glyph (Lion, Falcon, Bull, Wolf, Crown, Lightning).
   - Log bodyweight updates with date history and trend metrics.
2. **Dynamic Luxury Theme Switcher**:
   - Preview and switch between 4 luxury themes with instant CSS variable re-theming:
     - **Electric Lime** (High-energy athletic contrast)
     - **Royal Obsidian Gold** (Prestigious champagne and yellow-gold metallic accents)
     - **Crimson Velvet** (Intense racecar carnelian and crimson energy)
     - **Midnight Emerald** (Refined British racing green and emerald neon)
   - Persisted across reloads in `localStorage` and synced to Firebase user profile document.
3. **Manual Personal Records (PR) Editor**:
   - View all exercises with existing PRs.
   - Click "Add / Edit PR" on any exercise to manually record historic bests (e.g., if a lifter already benched 120kg prior to using the app).
   - Recalculates estimated 1RM and updates history instantly.
4. **Rotating Rainbow Shimmer Border Effect**:
   - Applied to `.rainbow-glow-btn`: A subtle 1.5px multi-hue rotating gradient (`#ff0055, #ff7700, #ffea00, #00ff66, #00eeff, #8800ff, #ff0055`) rotating at 4-6 seconds with a matching dark core background, keeping the button clean, legible, and luxurious.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: CSS Variable-Driven Theme Engine**:
  - *Chosen Approach*: Define standard CSS theme tokens in `src/index.css` (`--brand-accent`, `--brand-accent-hover`, `--brand-glow`, `--brand-subtle`) driven by data attribute `data-theme="lime | gold | crimson | emerald"`.
  - *Why*: Allows zero-rerender, instant aesthetic changes across all 90+ exercises, charts, timers, and buttons without modifying Tailwind utility classes individually.
- **Decision 2: Seamless Hybrid PR Storage (Auto-Detected + Manual)**:
  - *Chosen Approach*: Maintain an `isManual` flag on Personal Records so users can both manually enter benchmark lifts and still experience the real-time "WOW! New PR!" celebration during active training sessions.
  - *Why*: Ensures lifters who migrate from another app or notebook don't start from a blank slate.
- **Decision 3: GPU-Accelerated Conic-Gradient Rainbow Border**:
  - *Chosen Approach*: Use `@property --rainbow-angle` or pseudo-element conic rotation using `mask-composite` / layered backgrounds.
  - *Why*: Prevents layout thrashing and ensures smooth 60fps animations even on mobile devices.

---

### 4. Technical Architecture & Data Strategy

#### System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              ApexFit App                               │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: [Wordmark] · [Theme Badge] · [Active Timer] · [Profile]      │
├────────────────────────────────────────────────────────────────────────┤
│                      Active Selected Viewport                          │
│                                                                        │
│   • Dashboard (Home + Rainbow Glow Hero Buttons)                       │
│   • Active Workout Logger (Live Sets & Instant PR Modals)              │
│   • Master Splits & Bifurcated Routines                                │
│   • 90+ Exercise Catalog (Filterable by Modality & Muscle)             │
│   • Gym Tools Lab (Barbell Plate Calculator & 1RM Lab)                 │
│   • Gemini AI Strength Coach (Multi-turn Biomechanics Diagnostics)    │
│   • [NEW] Athlete Profile Hub (Theme Engine, Bio, PR Editor, Weight)   │
├────────────────────────────────────────────────────────────────────────┤
│  Mobile Bottom Dock: [Home] [Train] [Splits] [Coach] [Lab] [Profile]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Theme Engine & Profile State               │
       │   • Active Theme: 'lime' | 'gold' | 'crimson' | 'emerald│
       │   • Profile: { displayName, avatar, bio, bodyweight }  │
       │   • Manual & Auto PR Record Synchronization            │
       │   • LocalStorage + Cloud Firestore Sync                │
       └────────────────────────────────────────────────────────┘
```

#### New Data Interfaces
```typescript
export type LuxuryThemeId = 'lime' | 'gold' | 'crimson' | 'emerald';

export interface BodyweightEntry {
  id: string;
  weight: number;
  date: number; // timestamp
}

export interface AthleteProfile {
  displayName: string;
  avatarIcon: string;
  bio?: string;
  targetFocus: 'Hypertrophy' | 'Raw Strength' | 'Athletic Conditioning';
  theme: LuxuryThemeId;
  bodyweightLogs: BodyweightEntry[];
}
```
