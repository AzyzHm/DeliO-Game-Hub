# Déli'O — Hub de Jeux Pétillants
## Complete Codebase Documentation

### 📋 Project Overview

**Déli'O** is an interactive web-based mini-game hub themed around sparkling fruit flavors. It features 4 distinct games all accessible from a central hub interface. The project is built with vanilla HTML, CSS, and JavaScript—no external libraries required.

**Target Audience:** All ages  
**Language:** French  
**Theme:** Sparkling beverage flavors (Mint, Pear, Peach, Strawberry, Pineapple, Apple)  
**Browser Compatibility:** Modern browsers with Web Audio API support  

---

### 🎮 Game Collection

| Game | Description | Mechanics | Goal |
|------|-------------|-----------|------|
| **Attrape Pétillant** 🎯 | Fruit Catcher | Move basket to catch falling fruits | Maximize score before losing 3 lives |
| **Cascade de Saveurs** 🍇 | Match-3 Puzzle | Drag to swap adjacent fruits, match 3+ in a row | Score points within 30 moves |
| **Déli'O Pop** 💥 | Whack-a-Mole | Tap the correct target flavor | Complete as many hits as possible in 60 seconds |
| **Slid-e'O Mémoire** 🧠 | Memory Match | Flip cards to find 6 matching pairs | Minimize moves to win |

---

### 🏗️ Architecture & Structure

```
Project Root
├── index.html          # Main markup (home + 4 game screens)
├── style.css           # Complete styling & animations
├── script.js           # Game logic & Web Audio engine
└── Readme.md           # (Currently empty)
```

**Key Design Pattern:** Single-page application using screen visibility toggling. All games share common utilities and state management.

---

### 📄 File Breakdown

#### **index.html**
- **Purpose:** Define page structure, metadata, and game screen layouts
- **Key Sections:**
  - `<head>`: Fonts (Fredoka One, Nunito), meta tags for mobile responsiveness
  - Home screen: Logo, flavor chips, game card grid
  - Game 1-4 screens: Header, HUD (heads-up display), game canvas/board, overlay (end screen)
- **No inline JavaScript**—all logic in script.js

#### **style.css**
- **Purpose:** Visual styling and animations for all screens and games
- **Size:** ~750 lines
- **Key Systems:**
  - **CSS Variables:** 15 color tokens (--yellow, --mint, --green, --pink, --orange, --pear, --bg1, --bg2, --bg3, --card, --card-border, --glow, etc.)
  - **Animated Background:** Floating bubbles with subtle sparkles
  - **Screen Management:** Fixed-position full-screen overlays activated via `.active` class
  - **Game-Specific Styles:**
    - Game 1: Canvas styling
    - Game 2: 7-column grid with drag feedback
    - Game 3: 3×3 circular button grid
    - Game 4: 4-column flip card grid with 3D perspective
  - **Animations:** 12+ keyframes (popIn, fadeUp, fadeIn, scoreBump, shake, glow, bounce, chipPop, spin, etc.)
  - **Responsive Design:** Mobile-first with breakpoints at 480px and 360px, plus landscape mode (max-height: 500px)

#### **script.js**
- **Purpose:** Game engine, state management, Web Audio synthesis
- **Size:** ~1400 lines
- **Major Components:**

  **1. Flavor System**
  ```javascript
  FLAVORS = [
    { name, emoji, color, bg, imgKey }
  ] × 6 flavors
  ```

  **2. Sound Engine (Web Audio API)**
  - No audio files—all sounds procedurally generated using oscillators
  - Menu music: 8-bar loop (96 BPM) with marimba melody, bass ostinato, pad chords, hi-hat shimmer
  - SFX effects: catch, miss, bonus, match, swap, pop, wrong, flip, pairFound, win, gameover, speedup, click

  **3. Navigation System**
  - `goHome()`: Return to home screen, restart music
  - `startGame(n)`: Switch to game screen, initialize game state
  - Screen toggling via `.active` class

  **4. Game Implementations**

  **Game 1: Catcher** (`initGame1()`)
  - Canvas-based physics with mouse/touch tracking
  - Spawns falling fruits (random flavor)
  - Player must catch matching flavor with moving basket
  - Lives: 3 | Infinite rounds
  - Score system: +points for catch, -1 life for miss
  - Star rating: Based on score thresholds

  **Game 2: Match-3** (`initGame2()`)
  - Grid-based puzzle (7 columns × 8 rows)
  - Drag-swap mechanic with visual feedback
  - Match detection (horizontal/vertical 3+)
  - Gravity: Pieces fall after matches
  - Cascade detection: Bonuses for chain reactions
  - Moves: 30 | Score-based game loop

  **Game 3: Whack** (`initGame3()`)
  - 3×3 circular button grid
  - Target displays random flavor emoji + name
  - Spawned items disappear after 0.8-2.0s (speeds up over time)
  - Scoring: +10 base + streak bonus
  - Time-based: 60 seconds
  - Progressive difficulty: Every 15s, spawn rate & visibility duration decrease
  - Streak system: Bonus multiplier for consecutive correct hits

  **Game 4: Memory** (`initGame4()`)
  - 4×4 grid of flip cards (6 pairs + 4 duplicates = 12 cards... wait, actually 12 items total for 6 pairs)
  - 3D flip animation on click
  - Matched pairs stay flipped
  - Scoring: (matched × 50) - (moves × 5)
  - Move counter: Tracks total flips
  - Best score tracking: Minimum moves to win
  - Win condition: All 6 pairs matched

  **5. Utility Functions**
  - `spawnParticle(x, y, emoji)`: Floating emoji animation
  - `showCombo(text, color)`: Centered flash message
  - `bumpScore(id, val)`: Score pill animation
  - `makeStars(score, max)`: Star rating generation (0-3 stars)
  - `playTone()`, `playChord()`: Low-level tone generation
  - `clearActiveTimers()`: Cleanup on screen change

  **6. Persistent State**
  - `bestScores`: localStorage object storing best game performances
  - Loaded on init, updated after each game completion

---

### 🎨 Design System

#### Color Palette
- **Primary:** #f5c200 (Yellow) - Main accent, glow effects
- **Secondary:** #26c6da (Mint), #8bc34a (Pear), #ffb300 (Peach), #ec407a (Pink/Strawberry), #f59300 (Orange/Pineapple), #43a047 (Apple/Green)
- **Background:** Deep ocean gradient (#0d1b4b → #122366)
- **Glass:** Semi-transparent white with blur effect

#### Typography
- **Headings:** Fredoka One (bold, playful, 52-88px clamp)
- **Body:** Nunito (sans-serif, 13-15px)
- **Weights:** 400, 600, 700, 800, 900

#### Motion & Animation
- **Duration:** 0.2s-0.8s (snappy interaction feedback)
- **Easing:** cubic-bezier(0.34, 1.56, 0.64, 1) (bouncy overshoot)
- **Effects:** Glow halos, scale bumps, fade in/out, floating particles

---

### 🔊 Sound Design

**Music Engine (Procedural Generation)**
- Warm tropical/bubbly melody in C major
- Tempo: 96 BPM
- Structure: 8-bar loop with:
  - **Marimba melody** (upper voice, playful)
  - **Bass ostinato** (C3/G3 alternation)
  - **Pad chords** (C maj, F maj, G maj, A min)
  - **Hi-hat shimmer** (high-frequency noise)

**Sound Effects (SFX Dictionary)**
- Each event (catch, match, win, error) has a unique tone signature
- Frequencies range 160 Hz (low error) to 1319 Hz (high success)
- Waveforms: sine, triangle, sawtooth, square

**Audio Context Management**
- Single Web Audio API context per session
- Separate gain nodes for music vs. SFX
- Fade-in/fade-out for music transitions
- Browser autoplay policy: Music triggered on first user interaction

---

### 📱 Mobile Responsiveness

**Breakpoints:**
1. **480px and below:** Compact game cards, smaller fonts, vertical layout adjustments
2. **360px and below:** Extra-small adjustments, 2-column game grid
3. **Landscape ≤500px height:** Horizontal home layout, 4-column game grid, hidden flavor chips

**Touch Support:**
- All games use touch event listeners (touchstart, touchmove, touchend)
- Game 2: Drag-swap with visual highlight of drag target
- Game 3 & 4: Tap-based interaction

---

### 🔄 State Management Flow

```
User Opens App
    ↓
Home Screen Loads → Music Starts
    ↓
User Clicks Game Card
    ↓
Music Stops → Game Screen Activates → Game Initializes
    ↓
Game Loop (Canvas/DOM updates, input handling)
    ↓
Game Ends → Overlay Shows (Score, Stars, Replay Button)
    ↓
User Clicks Replay or Back → Cleanup Timers → return to Home
```

---

### 🎯 Key Technical Features

1. **Procedurally Generated Audio**
   - No audio files needed
   - Dynamic sound synthesis with frequency modulation
   - Musical structure (notes, rhythm, harmony)

2. **Canvas Rendering (Game 1)**
   - Real-time physics for falling objects
   - Collision detection against moving basket
   - Custom cursor hiding for immersion

3. **DOM-Based Games (Games 2, 3, 4)**
   - No canvas—pure CSS + event listeners
   - CSS Grid for board layouts
   - CSS transforms for animations
   - 3D flip effect using perspective + transform-style: preserve-3d (Game 4)

4. **Input Handling**
   - Mouse (Game 1, 2): Canvas position tracking, mousedown/mousemove/mouseup
   - Touch (All): touchstart/touchmove/touchend with preventDefault
   - Keyboard: None (mobile-first design)

5. **Data Persistence**
   - localStorage for best scores
   - JSON serialization of score objects
   - Per-game score tracking

6. **Browser APIs Used**
   - Web Audio API (AudioContext, OscillatorNode, GainNode)
   - Canvas 2D API (CanvasRenderingContext2D)
   - localStorage API
   - requestAnimationFrame for smooth animations
   - classList API for screen/element management

---

### 📊 Game Progression Design

**Difficulty Curves:**
- **Game 1:** Infinite with lives system (exponential difficulty via speed increase)
- **Game 2:** Fixed 30 moves | Matches required to progress
- **Game 3:** Time pressure (60s) | Progressive speedup every 15s | Score multiplier via streak
- **Game 4:** Fixed target (6 pairs) | Move penalty system

**Scoring Systems:**
| Game | Base Points | Modifiers | Star Threshold |
|------|------------|-----------|-----------------|
| G1 | +points/catch | +2× multiplier | >40% of max |
| G2 | +10/match | Combo chains | >40% of 1000 |
| G3 | 10 + streak×2 | Time bonus | >20% of 200 |
| G4 | (pairs×50)-(moves×5) | Speed bonus | Moves ≤10 = ⭐⭐⭐ |

---

### 🚀 Performance Optimizations

1. **Minimal Repaints:** CSS transforms/opacity for animations (GPU accelerated)
2. **Timer Management:** Centralized `clearActiveTimers()` to prevent memory leaks
3. **No External Dependencies:** ~50KB total (HTML + CSS + JS)
4. **Lazy Audio Context:** Created on first sound, resumed on user interaction
5. **Debounced Resize:** Window resize listener updates canvas dimensions

---

### 🔐 Known Limitations & Future Improvements

**Current Limitations:**
1. No fullscreen mode
2. No settings (difficulty levels, theme toggle)
3. No multiplayer/leaderboard
4. No offline PWA support
5. Limited accessibility (no ARIA labels for games)

**Potential Enhancements:**
1. Add difficulty mode selection at home screen
2. Export high scores as JSON
3. Add vibration feedback (Haptics API)
4. Add difficulty-based music themes
5. Implement pause mechanic for all games
6. Add combo/achievement system with badges
7. Tutorial screens for first-time players
8. Dark/light theme toggle

---

### 📋 File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| index.html | ~240 | Structure & markup |
| style.css | ~750 | Styling & animations |
| script.js | ~1400 | Game logic & audio |
| **Total** | **~2390** | **Lightweight SPA** |

---

### 🎓 Code Quality Notes

**Strengths:**
- Clean separation of concerns (HTML structure, CSS styling, JS logic)
- Consistent naming conventions (camelCase for variables, g1/g2/g3/g4 prefixes for game-specific)
- Comprehensive comments for complex sections (music theory, game mechanics)
- Procedural audio demonstrates deep Web Audio API knowledge
- Responsive design handles 360px → ultrawide screens

**Areas for Refactoring:**
1. Game initialization functions could be consolidated into a class structure
2. Sound effects could be organized in a dedicated module
3. Constants (timeouts, dimensions) could be extracted to a config object
4. Duplicate code in game overlays could be templated