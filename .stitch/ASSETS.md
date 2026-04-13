# Bharatvarsh Stitch Port — Asset Map

> **Locked 2026-04-13.** Single source of truth for every image/SVG/texture path consumed by the redesigned pages. Companion to `MISSING_ASSETS.md` which lists everything still to be produced.

## Asset sources

| Source | Type | Count | Served from |
|---|---|---|---|
| `public/images/*` | Already-hosted webp/jpg/png | 82 files | direct path `/images/...` |
| `public/images/brand/*` | Brand SVGs (copied 2026-04-13 from content-pipelines brand pack) | 8 files | direct path `/images/brand/...` |
| `src/content/data/lore-items.json` | Character / faction / location / tech entity metadata with `media.card` + `media.banner` | 30+ entities | imported at build time |
| `src/content/data/timeline.json` | Alternate-history events with `media.image` | 9 events | imported at build time |
| `src/content/data/dispatches.json` | In-world news feed entries | 10+ items | imported at build time |
| `src/content/data/novel.json` | Book metadata, quotes, purchase links | 1 object | imported at build time |
| Picsum (`https://picsum.photos/seed/...`) | Placeholders only where a real asset is explicitly missing and logged in `MISSING_ASSETS.md` | — | runtime |

## Brand SVGs copied into `public/images/brand/`

Sourced from `video-production/assets/bharatvarsh/brand/` in the AI OS project.

| File | Source | Use |
|---|---|---|
| `bharatvarsh-trident.svg` | `master-logo/svg/bharatvarsh-logo.svg` | Primary brand mark (optional header/footer upgrade from the current raster `logo.png`) |
| `bharatvarsh-trident-dark.svg` | `master-logo/svg/bharatvarsh-logo-dark.svg` | Light-background fallback |
| `bharatvarsh-trident-white.svg` | `master-logo/svg/bharatvarsh-logo-white.svg` | Dark-background (use on hero watermark) |
| `factions/bharatsena.svg` | `factions/bharatsena/svg/bharatsena-logo.svg` | Bharatsena sigil for faction cards / character faction badges |
| `factions/akakpen.svg` | `factions/akakpen/svg/akakpen-logo.svg` | Akakpen sigil |
| `factions/tribhuj.svg` | `factions/tribhuj/svg/tribhuj-trident.svg` | Tribhuj sigil (neutral third faction) |
| `bvn-masthead.svg` | `bvn-masthead/svg/bvn-masthead.svg` | BVN news masthead for Dispatches page hero |
| `bvn-masthead-compact.svg` | `bvn-masthead/svg/bvn-masthead-compact.svg` | Compact BVN badge (mobile / sidebar) |

## Asset bindings by page

### Home (`/`)

| Section | Asset | Path |
|---|---|---|
| Hero character portrait (right column) | Kahaan banner (from lore-items) | `media.banner` on `lore-items[id=kahaan]` → `/images/characters/kahaan-banner.webp` |
| Hero Devanagari ghost layer `भारतवर्ष` | CSS text, no image | — |
| Featured Dossier Kahaan spotlight | Kahaan banner | same |
| Archive rail card 1 (Kahaan) | Kahaan card | `lore-items[id=kahaan].media.card` → `/images/characters/kahaan-card.webp` |
| Archive rail card 2 (Rudra) | Rudra card | `/images/characters/rudra-card.webp` |
| Archive rail card 3 (Arshi) | Arshi card | `/images/characters/arshi-card.webp` |
| Archive rail card 4 (Hana) | Hana card | `/images/characters/hana-card.webp` |
| Archive rail card 5 (Pratap) | Pratap card | `/images/characters/pratap-card.webp` |
| Archive rail card 6 (Indrapur) | Indrapur HQ card | `/images/locations/indrapur-hq-card.webp` |
| Dispatches preview 1 | Latest dispatch | `/images/dispatches/bhv-20260515-001.webp` |
| Dispatches preview 2 | Earlier dispatch | `/images/dispatches/bhv-20260512-001.webp` |
| Dispatches preview 3 | Earlier dispatch | `/images/dispatches/bhv-20260509-001.webp` |
| Purchase funnel book cover | Novel cover | `/images/novel-cover.png` |
| Page body | Event tracking + existing `useSession()` | preserved |

### Lore Hub (`/lore`)

| Section | Asset | Path |
|---|---|---|
| Archive hero overlapping portrait cluster (4 cards) | 4 character cards rotated | Kahaan, Rudra, Arshi, Hana cards |
| Hero Devanagari ghost `अभिलेख` | CSS text | — |
| Featured Operative spotlight (Kahaan) | Kahaan banner | `/images/characters/kahaan-banner.webp` |
| Operatives masonry — 5 real + 1 classified redaction | 5 character cards + redaction placeholder | card paths from lore-items |
| Operatives masonry: Surya | placeholder | MISSING (log) |
| Operatives masonry: Kaali | placeholder | MISSING (log) |
| Faction split: Bharatsena | banner + sigil SVG | `/images/factions/bharatsena-banner.webp` + `/images/brand/factions/bharatsena.svg` |
| Faction split: Akakpen | banner + sigil SVG | `/images/akakpen-tribe.jpg` + `/images/brand/factions/akakpen.svg` |
| Locations rail: Indrapur | `/images/locations/indrapur-hq-card.webp` |
| Locations rail: Lakshmanpur | `/images/locations/lakshmanpur-card.webp` |
| Locations rail: Treaty Zone | placeholder | MISSING (log) |
| Locations rail: Mysuru | placeholder | MISSING (log) |
| Tech grid: Pulse Gun | `/images/misc/pulse-gun-card.webp` |
| Tech grid: Bracecomm | `/images/misc/bracecomm-card.webp` |
| Tech grid: Oxy Pole | `/images/misc/oxy-pole-card.webp` |
| Tech grid: Akakpen Dart | `/images/misc/akakpen-dart-card.webp` |
| Tech grid: HUD Monocle | placeholder | MISSING (log) |
| Tech grid: The Mesh | placeholder | MISSING (log) |

### Lore Modal — Kahaan dossier overlay

| Section | Asset | Path |
|---|---|---|
| Modal cover portrait | Kahaan banner | `/images/characters/kahaan-banner.webp` |
| Relationship graph center (Kahaan) | Kahaan card (circle cropped) | `/images/characters/kahaan-card.webp` |
| Relationship node — Rudra | `/images/characters/rudra-card.webp` |
| Relationship node — Arshi | `/images/characters/arshi-card.webp` |
| Relationship node — Hana | `/images/characters/hana-card.webp` |
| Relationship node — Pratap | `/images/characters/pratap-card.webp` |
| Relationship node — Bhoomi | placeholder | MISSING (log — Bhoomi AI card) |
| Gallery masonry (6 slots) | Mix of Kahaan banner crops + picsum | 2 real + 4 picsum |

### Timeline (`/timeline`)

| Section | Asset | Path |
|---|---|---|
| Mesh Era active content image | Mesh Era timeline image | `/images/timeline/mesh-era-1985-2022.jpg` |
| Era tab background (MESH active) | Phase 5 military control | `/images/timeline/phases/phase-5-military-control.webp` |
| 1985 MESH GRID event | `/images/timeline/mesh-era-1985-2022.jpg` |
| 1991 FIRST REDACTION event | `/images/timeline/divergence-1850-1895.jpg` (repurposed) |
| 2004 CLEAN CITY PROGRAM event | `/images/timeline/civil-war-1975-1985.jpg` (repurposed) |
| 2015 BHOOMI DEPLOYED event | `/images/timeline/year-turn-decree-1985.jpg` (repurposed) |
| 2022 THE BOMBINGS event | `/images/timeline/bombings-2022.jpg` |
| Point of Divergence 1850 callout | `/images/timeline/divergence-1850-1895.jpg` |
| Connected operatives rail | Same 5 character cards as Lore |

### Dispatches (`/dispatches`)

| Section | Asset | Path |
|---|---|---|
| Hero BVN masthead accent | BVN compact SVG | `/images/brand/bvn-masthead-compact.svg` |
| Featured intercept image | Most recent dispatch | `/images/dispatches/bhv-20260515-001.webp` |
| Masonry stream (10 of 13) | All dispatch webps | `/images/dispatches/bhv-*.webp` |

### Novel (`/novel`)

| Section | Asset | Path |
|---|---|---|
| Book hero tilted cover | Novel cover | `/images/novel-cover.png` |
| Author portrait | Author avatar | `/images/author-avatar.jpg` |
| Operatives highlights (1 tall Kahaan + 4 small grid) | Character banners + cards | Kahaan banner + 4 other cards |
| Final purchase CTA cover | Novel cover | `/images/novel-cover.png` |

### Bhoomi Interrogation (`/bhoomi`)

| Section | Asset | Path |
|---|---|---|
| Living glyph avatar | CSS-rendered `भूमि` text, no image | — |
| Bhoomi Knows operatives rail | Character cards | `/images/characters/*.webp` |
| Chapter 14 tie-in book cover | Novel cover | `/images/novel-cover.png` |

### Forum (`/forum`)

| Section | Asset | Path |
|---|---|---|
| Network pulse hero | CSS/SVG network graph, no image | — |
| Featured community post image | Kahaan banner (fan art placeholder) | `/images/characters/kahaan-banner.webp` |
| Active operatives rail avatars | picsum per user (community members, not lore) | placeholder |
