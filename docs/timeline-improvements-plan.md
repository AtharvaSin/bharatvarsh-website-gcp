# Timeline Page Improvements - Implementation Plan

## Executive Summary

This document outlines a comprehensive implementation plan for improving the Timeline page based on three key requirements:

1. **Enhanced Navigation UX** - Click-based workflow and drag-to-pan functionality
2. **Phase Background Artwork** - Custom panoramic artwork per historical phase
3. **Navigation Cohesion** - Restore site header and remove unnecessary filter bar

---

## Current State Analysis

### Visual Inspection Findings

Based on Playwright visual inspection and codebase review:

| Element | Current State | Issue |
|---------|---------------|-------|
| Site Header | Exists but hidden under timeline header | Timeline's `fixed top-0 z-50` covers site header |
| Progress Bar | Present at top | Starts at position 0, covering site nav |
| Phase Navigation | Clickable buttons working | Good - keep this |
| Filter Bar | Present below phase nav | User wants this removed |
| Event Markers | Small circular thumbnails (~24-40px) | Need larger, more prominent sizing |
| Phase Backgrounds | Subtle gradient patterns only | Need full panoramic artwork |
| Scroll Mechanism | Native horizontal scroll only | Need drag-to-pan capability |

### Key Files Involved

```
bharatvarsh-website/src/
├── app/
│   ├── layout.tsx                          # Root layout with Header/Footer
│   └── timeline/page.tsx                   # Timeline page entry
├── components/
│   ├── layout/
│   │   └── header.tsx                      # Site navigation header
│   └── features/timeline/
│       ├── horizontal/
│       │   ├── timeline-horizontal.tsx     # Main container (h-screen, own header)
│       │   ├── timeline-progress.tsx       # Top progress bar
│       │   ├── timeline-phase-nav.tsx      # Phase buttons
│       │   ├── timeline-phase.tsx          # Phase section with background
│       │   ├── timeline-phase-header.tsx   # Phase title/emblem
│       │   ├── timeline-event-marker.tsx   # Clickable markers
│       │   ├── timeline-track.tsx          # Year track line
│       │   └── timeline-onboarding.tsx     # First-visit hints
│       └── hooks/
│           └── use-horizontal-scroll.ts    # Scroll management
└── data/
    └── timeline-phases.ts                  # Phase configuration
```

---

## Implementation Plan

### Phase 1: Navigation Cohesion (Priority: HIGH)

#### Problem
The timeline component renders at `top: 0` with `h-screen` and its own `fixed` header elements, completely covering the site-wide navigation header.

#### Solution
Integrate with site header instead of replacing it.

#### Task 1.1: Restructure Timeline Layout

**File: `timeline-horizontal.tsx`**

Current structure:
```tsx
<div className="relative h-screen flex flex-col overflow-hidden">
  {/* Fixed Navigation Header - COVERS SITE HEADER */}
  <div className="fixed top-0 left-0 right-0 z-50">
    <TimelineProgress ... />
    <TimelinePhaseNav ... />
    <TimelineFilter ... />  {/* TO BE REMOVED */}
  </div>

  <main className="pt-32">  {/* Only accounts for timeline header */}
```

Proposed structure:
```tsx
<div className="relative min-h-screen flex flex-col">
  {/* Timeline Sub-Header - BELOW site header */}
  <div className="sticky top-16 md:top-20 left-0 right-0 z-40">
    <TimelineProgress ... />
    <TimelinePhaseNav ... />
    {/* REMOVED: TimelineFilter */}
  </div>

  <main className="pt-0">  {/* No extra padding needed - sticky handles it */}
```

Key changes:
1. Change `fixed top-0` to `sticky top-16 md:top-20` (below 64/80px site header)
2. Change `z-50` to `z-40` (below site header's z-50)
3. Remove `h-screen` constraint for better layout flow
4. Remove the entire `TimelineFilter` section

#### Task 1.2: Remove Filter Bar

**File: `timeline-horizontal.tsx`**

Remove this block entirely:
```tsx
{/* Event Type Filter */}
<div className="bg-[var(--obsidian-900)]/90 backdrop-blur-sm border-b border-[var(--obsidian-700)] px-6 py-2">
  <TimelineFilter
    activeFilter={activeFilter}
    onFilterChange={setActiveFilter}
  />
</div>
```

Also remove:
- `activeFilter` state declaration
- `TimelineFilter` import
- `activeFilter` prop from `TimelinePhaseSection`

#### Task 1.3: Update Phase Section Props

**File: `timeline-phase.tsx`**

Remove `activeFilter` from interface and filter logic in `eventPositions.map()`.

---

### Phase 2: Drag-to-Pan Navigation (Priority: HIGH)

#### Problem
Currently only native scroll works. Users expect click-and-drag (grab cursor) behavior.

#### Solution
Implement custom drag-to-scroll with Framer Motion's `onPan` handlers.

#### Task 2.1: Create Drag-to-Scroll Hook

**New File: `hooks/use-drag-to-scroll.ts`**

```typescript
'use client';

import { RefObject, useCallback, useRef, useState } from 'react';
import { PanInfo } from 'framer-motion';

interface UseDragToScrollOptions {
  containerRef: RefObject<HTMLElement | null>;
  decayRate?: number;      // Momentum decay (0.95 default)
  minVelocity?: number;    // Threshold for momentum (50 default)
  enabled?: boolean;
}

interface UseDragToScrollReturn {
  isDragging: boolean;
  onPanStart: (event: PointerEvent, info: PanInfo) => void;
  onPan: (event: PointerEvent, info: PanInfo) => void;
  onPanEnd: (event: PointerEvent, info: PanInfo) => void;
  cursorClass: string;
}

export function useDragToScroll(options: UseDragToScrollOptions): UseDragToScrollReturn;
```

Features:
- Track `isDragging` state for cursor changes
- `onPanStart`: Cancel momentum, store initial scroll position
- `onPan`: Update `scrollLeft` based on drag offset (inverted for natural grab feel)
- `onPanEnd`: Apply momentum animation with `requestAnimationFrame`
- Return `cursorClass` for `cursor-grab` / `cursor-grabbing`

#### Task 2.2: Integrate into Timeline Container

**File: `timeline-horizontal.tsx`**

```tsx
import { motion } from 'framer-motion';
import { useDragToScroll } from '../hooks/use-drag-to-scroll';

// Inside component:
const {
  isDragging,
  onPanStart,
  onPan,
  onPanEnd,
  cursorClass,
} = useDragToScroll({ containerRef });

// Update <main> to <motion.main>:
<motion.main
  ref={containerRef}
  onPanStart={onPanStart}
  onPan={onPan}
  onPanEnd={onPanEnd}
  className={cn(
    'flex-1 overflow-x-auto overflow-y-hidden',
    'scroll-smooth scrollbar-hide',
    cursorClass,
    isDragging && 'select-none'
  )}
  style={{
    touchAction: 'pan-y',  // Allow vertical scroll on touch devices
  }}
>
```

#### Task 2.3: Add Navigation Controls

**New File: `timeline-navigation-controls.tsx`**

Create floating navigation buttons for explicit next/previous phase navigation:

```tsx
interface TimelineNavigationControlsProps {
  currentPhaseIndex: number;
  totalPhases: number;
  onPrevious: () => void;
  onNext: () => void;
}
```

Features:
- Left arrow: Previous phase (disabled at start)
- Right arrow: Next phase (disabled at end)
- Position: Fixed at bottom-right or centered bottom
- Visual: Prominent buttons with chevron icons
- Animation: Subtle pulse to draw attention

---

### Phase 3: Phase Background Artwork (Priority: HIGH)

#### Problem
Current backgrounds are subtle CSS gradient patterns. User wants full panoramic artwork.

#### Solution
Add background image layer behind each phase with dark overlay for legibility.

#### Task 3.1: Update Phase Data Structure

**File: `timeline-phases.ts`**

Add `backgroundImage` property to each phase:

```typescript
export interface TimelinePhase {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  yearRange: { start: number; end: number };
  themeColor: string;
  backgroundGradient: string;
  backgroundImage: string;  // NEW: Path to phase artwork
  eventIds: number[];
}

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'colonial-resistance',
    // ...existing
    backgroundImage: '/images/timeline/phases/phase-1-colonial-resistance.jpg',
  },
  // ... etc for all 5 phases
];
```

#### Task 3.2: Implement Background Layer

**File: `timeline-phase.tsx`**

Add background image layer before existing background elements:

```tsx
import Image from 'next/image';

// Inside TimelinePhaseSection:
<section className="relative w-screen h-full flex-shrink-0">
  {/* NEW: Phase Background Artwork */}
  <div className="absolute inset-0 z-0">
    {/* Artwork Image */}
    <Image
      src={phase.backgroundImage}
      alt=""
      fill
      className="object-cover"
      sizes="100vw"
      priority={phaseIndex <= 1}  // Preload first 2 phases
    />

    {/* Dark Overlay for Legibility */}
    <div
      className="absolute inset-0 bg-gradient-to-b from-[var(--obsidian-900)]/70 via-[var(--obsidian-900)]/50 to-[var(--obsidian-900)]/70"
    />

    {/* Stronger overlay in timeline track area (center) */}
    <div
      className="absolute left-0 right-0 top-1/3 bottom-1/3 bg-[var(--obsidian-900)]/60"
    />
  </div>

  {/* Existing content with z-10 */}
  <motion.div className="relative z-10 ...">
```

#### Task 3.3: Create Placeholder Images

**Location: `public/images/timeline/phases/`**

Create 5 placeholder images with descriptive overlays:

| File | Phase | Color |
|------|-------|-------|
| `phase-1-colonial-resistance.jpg` | Colonial Resistance (1717-1789) | Saffron gold/Burgundy |
| `phase-2-rise-of-polities.jpg` | Rise of Polities (1790-1904) | Amber/Teal |
| `phase-3-unification-democracy.jpg` | Unification & Democracy (1905-1974) | Navy/Powder blue |
| `phase-4-civil-collapse.jpg` | Civil Collapse (1975-1984) | Crimson/Gray |
| `phase-5-military-control.jpg` | Military Control (1985-2025) | Navy/Cyan |

Placeholder specifications:
- Dimensions: 1920x1080 (16:9) minimum
- Content: Solid gradient matching phase colors with text overlay "Phase X - [Name]"
- Purpose: Allow development to proceed while final artwork is created

---

### Phase 4: Responsive Marker Sizing (Priority: MEDIUM)

#### Problem
Event markers are small (24-40px) and hard to see on larger screens.

#### Solution
Scale markers based on viewport width and significance.

#### Task 4.1: Update Marker Size System

**File: `timeline-event-marker.tsx`**

Current:
```tsx
const sizeClasses = {
  sm: 'w-6 h-6',   // 24px
  md: 'w-8 h-8',   // 32px
  lg: 'w-10 h-10', // 40px
};
```

Proposed - responsive sizing:
```tsx
const sizeClasses = {
  sm: 'w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12',    // 32-48px
  md: 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14',  // 40-56px
  lg: 'w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16',  // 48-64px
};

const ringSizeClasses = {
  sm: 'w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20',
  md: 'w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24',
  lg: 'w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28',
};
```

#### Task 4.2: Update Label Positioning

Scale the year/title labels proportionally:

```tsx
<motion.div
  className={cn(
    'absolute top-full left-1/2 -translate-x-1/2',
    'mt-4 md:mt-5 lg:mt-6',  // Increase gap with marker size
    'text-center whitespace-nowrap'
  )}
>
  <span className="font-mono text-xs md:text-sm text-[var(--text-secondary)]">
    {/* year */}
  </span>
  <p className={cn(
    'text-xs md:text-sm lg:text-base font-medium mt-1',
    'max-w-[120px] md:max-w-[150px] lg:max-w-[180px]',
  )}>
    {event.title}
  </p>
</motion.div>
```

---

### Phase 5: Update Onboarding (Priority: LOW)

#### Task 5.1: Update Onboarding Text

**File: `timeline-onboarding.tsx`**

Update to mention drag navigation:

```tsx
<p className="text-[var(--text-primary)] font-medium text-sm">
  Drag or scroll horizontally to explore 308 years of history
</p>
<div className="flex items-center gap-3 mt-1.5 text-[var(--text-muted)] text-xs">
  <span className="flex items-center gap-1">
    <GripHorizontal className="w-3 h-3" />  {/* Change icon */}
    Click & drag
  </span>
  <span>•</span>
  <span className="flex items-center gap-1">
    <Keyboard className="w-3 h-3" />
    Arrow keys
  </span>
  <span>•</span>
  <span>Click events for details</span>
</div>
```

---

## Artwork Specifications

### Phase 1: Colonial Resistance (1717-1789)
**Theme**: "A single decision that changed history"

**Scene**: Grand Mughal durbar hall with a pivotal moment - European traders being diplomatically refused while indigenous merchants look on.

**Visual Elements**:
- Mughal architectural details (jali screens, arched doorways)
- Rolled parchments with wax seals (denied charter)
- Oil lamps creating warm chiaroscuro lighting
- European merchant dress contrasting with indigenous attire

**Color Palette**:
- Primary: Deep saffron gold (#C9A227)
- Secondary: Burgundy red (#722F37)
- Shadow: Rich umber (#3D2914)

**Mood**: Decisive, dignified, historical weight

---

### Phase 2: Rise of Polities (1790-1904)
**Theme**: "Enlightenment and divergence shape new powers"

**Scene**: Grand learning hall or technical guild workshop with scholars, engineers, and printing presses.

**Visual Elements**:
- Printing presses with vernacular script
- Astronomical instruments and mathematical charts
- Mechanized looms and irrigation diagrams
- Diverse regional dress showing three polity cultures

**Color Palette**:
- Primary: Warm amber (#D4A84B)
- Secondary: Deep teal (#1D5B5B)
- Accent: Burnished copper (#B87333)

**Mood**: Progressive, optimistic, intellectual vibrancy

---

### Phase 3: Unification & Democracy (1905-1974)
**Theme**: "The great experiment of collective governance"

**Scene**: Grand parliament or assembly hall with democratic proceedings, citizens participating.

**Visual Elements**:
- Circular/semicircular assembly chamber
- Constitutional documents and voting urns
- Rail maps and industrial schematics on walls
- Mid-century modernist architecture with Indian motifs

**Color Palette**:
- Primary: Civic navy (#0B2742)
- Secondary: Powder blue (#C9DBEE)
- Accent: Mustard gold (#F1C232)

**Mood**: Confident, aspirational, orderly progress

---

### Phase 4: Civil Collapse (1975-1984)
**Theme**: "A decade of blood and chaos"

**Scene**: Urban chaos - burning buildings, barricades, abandoned streets at twilight/night.

**Visual Elements**:
- Smoke columns against disturbed sky
- Overturned vehicles, scattered belongings
- Emergency barricades (makeshift, not military)
- Silhouettes of fleeing civilians

**Color Palette**:
- Primary: Blood crimson (#8B0000)
- Secondary: Ash gray (#5F5F5F)
- Accent: Burning orange (#D84315)

**Mood**: Dangerous, abandoned normalcy, order collapsing

---

### Phase 5: Military Control (1985-2025)
**Theme**: "Order through surveillance, stability through power"

**Scene**: Hyper-modern city boulevard under surveillance - "polite inevitability" aesthetic.

**Visual Elements**:
- OxyPoles (air-scrub towers, 60-80m spacing)
- Hovercams at 12-20m altitude with LED halos
- Wrist-scan gates at pedestrian lanes
- Vertical garden facades on buildings
- Tri-script signage (EN/Hindi/State language)

**Color Palette**:
- Primary: Deep navy (#0B1D2A)
- Secondary: Obsidian (#0F1419)
- Accent: Hologram cyan (#17D0E3)

**Mood**: Calm, efficient, subtly unsettling

---

## Implementation Order

| # | Task | Priority | Est. Effort | Dependencies | Status |
|---|------|----------|-------------|--------------|--------|
| 1 | Task 1.2: Remove Filter Bar | HIGH | 15 min | None | ✅ DONE |
| 2 | Task 1.1: Restructure Layout | HIGH | 45 min | Task 1.2 | ✅ DONE |
| 3 | Task 1.3: Update Phase Props | HIGH | 15 min | Task 1.2 | ✅ DONE |
| 4 | Task 2.1: Create Drag Hook | HIGH | 60 min | None | ✅ DONE |
| 5 | Task 2.2: Integrate Drag | HIGH | 30 min | Task 2.1 | ✅ DONE |
| 6 | Task 2.3: Navigation Controls | MEDIUM | 45 min | Task 1.1 | ✅ DONE |
| 7 | Task 3.1: Update Phase Data | HIGH | 15 min | None | ✅ DONE |
| 8 | Task 3.3: Create Placeholders | HIGH | 30 min | None | ✅ DONE |
| 9 | Task 3.2: Implement Background | HIGH | 45 min | Task 3.1, 3.3 | ✅ DONE |
| 10 | Task 4.1: Responsive Markers | MEDIUM | 30 min | None | ✅ DONE |
| 11 | Task 4.2: Update Labels | MEDIUM | 20 min | Task 4.1 | ✅ DONE |
| 12 | Task 5.1: Update Onboarding | LOW | 15 min | Task 2.2 | ✅ DONE |

**Total Estimated Effort**: ~6 hours
**Implementation Completed**: January 1, 2026

---

## Implementation Summary

All tasks have been successfully completed:

### Phase 1: Navigation Cohesion ✅
- Removed filter bar from timeline header
- Changed fixed positioning to sticky (below site header at top-16/top-20)
- Lowered z-index from z-50 to z-40 to respect site header
- Removed activeFilter state and props from all components

### Phase 2: Drag-to-Pan Navigation ✅
- Created `use-drag-to-scroll.ts` hook with momentum support
- Integrated Framer Motion pan handlers into timeline container
- Added cursor-grab/cursor-grabbing states
- Created floating navigation controls component with Previous/Next buttons

### Phase 3: Phase Background Artwork ✅
- Added `backgroundImage` property to TimelinePhase interface
- Created 5 SVG placeholder images with phase-appropriate styling
- Implemented background image layer with dark overlays for legibility

### Phase 4: Responsive Marker Sizing ✅
- Updated marker sizes: sm (32-48px), md (40-56px), lg (48-64px)
- Updated ring glow sizes proportionally
- Enhanced label positioning with responsive margins and font sizes

### Phase 5: Onboarding Update ✅
- Changed icon from MousePointer2 to GripHorizontal
- Updated text to mention "Drag or scroll"
- Added "Click & drag" instruction to hints

### Build Verification ✅
- TypeScript compilation: PASSED
- Next.js build: PASSED (all 7 pages generated)

---

## Files Created

| File | Purpose | Status |
|------|---------|--------|
| `src/components/features/timeline/hooks/use-drag-to-scroll.ts` | Drag-to-pan scroll functionality | ✅ Created |
| `src/components/features/timeline/horizontal/timeline-navigation-controls.tsx` | Previous/Next phase buttons | ✅ Created |
| `public/images/timeline/phases/phase-1-colonial-resistance.svg` | Phase 1 placeholder | ✅ Created |
| `public/images/timeline/phases/phase-2-rise-of-polities.svg` | Phase 2 placeholder | ✅ Created |
| `public/images/timeline/phases/phase-3-unification-democracy.svg` | Phase 3 placeholder | ✅ Created |
| `public/images/timeline/phases/phase-4-civil-collapse.svg` | Phase 4 placeholder | ✅ Created |
| `public/images/timeline/phases/phase-5-military-control.svg` | Phase 5 placeholder | ✅ Created |

> Note: SVG format was used for placeholders instead of JPG as they can be programmatically generated and work well with Next.js Image component.

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/components/features/timeline/horizontal/timeline-horizontal.tsx` | Remove filter, restructure layout, add drag | ✅ Modified |
| `src/components/features/timeline/horizontal/timeline-phase.tsx` | Remove filter props, add background artwork | ✅ Modified |
| `src/data/timeline-phases.ts` | Add `backgroundImage` property | ✅ Modified |
| `src/components/features/timeline/horizontal/timeline-event-marker.tsx` | Responsive sizing, remove isFiltered prop | ✅ Modified |
| `src/components/features/timeline/horizontal/timeline-onboarding.tsx` | Update copy for drag | ✅ Modified |

## Files to Delete (Cleanup)

| File | Reason | Status |
|------|--------|--------|
| `timeline-filter.tsx` | Unused after filter removal | 🔶 Pending cleanup |

> The filter component is no longer imported or used. Consider deleting in a future cleanup pass.

---

## Technical Considerations

### Performance

1. **Image Optimization**: Use Next.js Image with:
   - `priority` for first 2 phases
   - `sizes="100vw"` for viewport-width images
   - WebP format with JPEG fallback

2. **Scroll Performance**:
   - Native scroll with JS augmentation (not transform-based)
   - `requestAnimationFrame` for momentum
   - `will-change: scroll-position` during drag only

3. **Lazy Loading**:
   - Consider lazy rendering phases > 2 away from current
   - Use Intersection Observer for phase visibility

### Accessibility

1. **Keyboard Navigation**:
   - Maintain arrow key support for phase navigation
   - Add focus management for navigation controls

2. **Screen Readers**:
   - Update aria-labels to reflect new navigation options
   - Ensure background images have empty alt (decorative)

3. **Reduced Motion**:
   - Disable momentum scrolling for `prefers-reduced-motion`
   - Keep instant navigation available

### Mobile Considerations

1. **Touch Support**:
   - `touch-action: pan-y` allows vertical scroll while capturing horizontal
   - Existing mobile vertical fallback still works

2. **Breakpoint Testing**:
   - Test at 768px (md), 1024px (lg), 1280px (xl) for marker sizing

---

## Visual Reference

Screenshots captured during analysis are available at:
- `.playwright-mcp/timeline-current-state.png` - Initial state
- `.playwright-mcp/timeline-control-phase.png` - Phase 5 view
- `.playwright-mcp/homepage-with-header.png` - Homepage showing proper header

---

## Success Criteria

1. **Navigation Cohesion**: Site header visible on timeline page with proper z-index stacking
2. **Filter Removed**: No filter bar in timeline UI
3. **Drag-to-Pan**: Click and drag horizontally works with momentum
4. **Background Artwork**: Each phase has a placeholder image with proper overlay
5. **Marker Visibility**: Markers are visibly larger on desktop (48-64px for significant events)
6. **Navigation Controls**: Clear next/previous buttons for explicit navigation

---

*Plan Version: 1.0*
*Created: January 2026*
*Author: Claude Code Assistant*
