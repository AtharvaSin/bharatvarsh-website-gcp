# Bharatvarsh — Classified Chronicle Design System

> **Locked snapshot, 2026-04-13.** This file is the single source of truth for the Bharatvarsh website's visual language. Every screen must resolve to the tokens and patterns described here. When a Stitch screen and this doc disagree, update whichever is wrong and re-sync both — never let them drift.

## Canonical Stitch source
- **Project:** Bharatvarsh Narrative Experience
- **Project ID:** `16732815330963606548`
- **Design system asset:** `17159041943685620603` (Bharatvarsh Classified Chronicle)
- **Screens (prefer v2 where available):**
  | Screen | v1 | v2 |
  |---|---|---|
  | Home | `ad430dca827149468d0810c46d8b94d3` | `4e132cb4dca04be3964270ea65b3e5ec` |
  | Lore Hub | `2dc6ff623f6d4c149368d179639a0a8f` | `43e6d405c31546dfb2814d94fe54883f` |
  | Kahaan Dossier / Lore Modal | `908576a3b18d48e8a9b3d898109f1a13` | `c794bcf08624497d807fad04ac123477` |
  | Interactive Timeline | `95ac198cb8a648eba4f44b205b93e67c` | `20278263c76847198513ef0d084a471c` |
  | Dispatches Feed | `f63d492fb6e44dc1935d35d43adc2d3f` | `24513eeb0ccb4089bb3e217297ea6c79` |
  | /novel Purchase | `3337a8f39d5c4edf96eb1afe4de711e3` | — |
  | Bhoomi Interrogation | `2d21299f4ec942398fb611f9ae1c6ea3` | — |
  | /forum Community | `8606a74401ea4bf5ada0ff625a72286e` | — |

## Atmosphere
Classified Military Chronicle — the visitor should feel they've intercepted a leaked intelligence dossier from a surveillance state. Dark, cinematic, tactile.
- Density: 6/10 (balanced)
- Variance: 7/10 (asymmetric)
- Motion: 8/10 (cinematic, perpetual micro-motion)

## Color tokens (existing CSS variables + new semantic aliases)
The existing numeric tokens in `src/app/globals.css` stay untouched. Task 3 of the Phase 0 plan adds these **semantic aliases** on top of them:

| Semantic name | CSS variable | Value | Role |
|---|---|---|---|
| Obsidian Void | `--color-obsidian-void` → `--obsidian-900` | `#0F1419` | Primary canvas |
| Obsidian Deep | `--color-obsidian-deep` → `--obsidian-800` | `#1A1F2E` | Secondary surface |
| Obsidian Panel | `--color-obsidian-panel` → `--obsidian-700` | `#252A3B` | Card / overlay container |
| Navy Core | `--color-navy-core` → `--navy-900` | `#0B2742` | Hero wash anchor |
| Navy Signal | `--color-navy-signal` → `--navy-600` | `#15506E` | Borders, ambient glow |
| Mustard Dossier | `--color-mustard-dossier` → `--mustard-500` | `#F1C232` | THE accent — CTAs, classified stamps, inline accent words |
| Mustard Hot | `--color-mustard-hot` → `--mustard-400` | `#F5D56A` | Mustard hover/active |
| Powder Signal | `--color-powder-signal` → `--powder-300` | `#C9DBEE` | Secondary text accent, Devanagari |
| Bone Text | `--color-bone-text` → `--text-primary` | `#F0F4F8` | Primary text |
| Steel Text | `--color-steel-text` → `--text-secondary` | `#A0AEC0` | Body text |
| Shadow Text | `--color-shadow-text` → `--text-muted` | `#718096` | Metadata labels |
| Redaction Red | `--color-redaction` → `--status-alert` | `#DC2626` | [REDACTED] bars, alerts only |
| Declassified Green | `--color-declassified` → `--status-success` | `#10B981` | Declassify / success — minimal |

**Banned:** pure `#000000`, purple/violet/cyan neon glows (no new hues outside the above). The palette is locked.

## Typography
Bharatvarsh ships its own font stack in `globals.css` lines 171–175. No change needed — the Stitch enum fonts (`Space Grotesk` / `IBM Plex Sans`) are only visual stand-ins for the enum limitation. The production port uses the real brand fonts:

- **Display:** Bebas Neue → Anton fallback → `var(--font-sans)` — all-caps, tight tracking, weight-driven hierarchy
- **Body:** Inter → Noto Sans — 1.65 leading, max 65ch
- **Serif italic (in-world quotes):** Crimson Pro → Noto Serif
- **Devanagari:** Noto Sans Devanagari → Tiro Devanagari Hindi — treat Devanagari as visual ornament at 10–15% opacity behind English display. Rendered via the `font-devanagari` class exposed in `src/app/globals.css`.
- **Metadata labels:** JetBrains Mono caps, letter-spacing `0.18em`, for classification codes and timestamps

## Layout principles
- Asymmetric splits only (55/45, 5/7, 4/8 — never 50/50, never 3-equal-col)
- 12-column CSS Grid, intentional span asymmetry
- Container max-width 1440px, hero breakouts full-bleed
- Devanagari ghost layer sits behind English display headlines at 10–15% opacity, 2–2.5x display size, breaking out of one edge
- `min-h-[100dvh]` for hero, `clamp(6rem, 14vh, 12rem)` for section padding
- Single-column collapse below 768px, no exceptions
- Touch targets 44px min

## Atmospheric overlays (always on)
Already in repo as `src/shared/ui/FilmGrainOverlay.tsx`, `ScanlineEffect.tsx`, `GlyphWatermark.tsx`, `StampAnimation.tsx`. Compose via `AtmosphericProvider` and `LayoutProvider`. The redesign does not replace these.

## Components
- **Primary CTA:** solid Mustard Dossier fill, Obsidian Void text, `--radius-sm` (4px) corners, tight letter-spaced label, no outer glow (inner glow on hover only)
- **Secondary CTA:** ghost outline in Powder Signal, transparent fill; converts to Obsidian Panel fill on hover
- **Classified Stamp:** rotated -4° diagonal label with dashed Mustard border (use existing `StampAnimation` — extend only if new props are needed)
- **Eyebrow label (new):** JetBrains Mono caps 11–13px (rendered via Tailwind's `font-mono` class which resolves to `var(--font-mono)`), `+0.18em` tracking, Shadow Text color, `▪` separators in Mustard — see `EyebrowLabel` primitive in Task 4
- **Dossier card:** border-top only (no full card box). Created via the new `DossierDivider` primitive in Task 5.
- **Document stamp (new):** footer corner classification sticker `DOC ID: BVR-0001 ▪ REV 27` — created in Task 6.
- **Navigation:** sticky top bar, Obsidian Void 85% backdrop blur, 2px Mustard underline for active item (replacing the current mustard-text pattern — see Task 7)

## Voice & copy
In-world intelligence briefing crossed with literary chapter epigraphs. Every CTA is an action verb: `ENTER THE DOSSIER`, `MEET THE OPERATIVES`, `UNSEAL THE CHRONICLE`. Never `Learn More`, `Click Here`, or `Explore`.

## Anti-patterns (NEVER)
Pure black, purple/violet/cyan neon, 3-equal-card rows, centered heroes, scroll arrows / "scroll to explore", fabricated statistics, Inter on display, lorem ipsum, emojis, stock photography, overlapping text zones.
