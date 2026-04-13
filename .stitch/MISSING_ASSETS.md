# Bharatvarsh Port — Missing Assets & Artwork Checklist

> **Locked 2026-04-13. Port complete.** All 8 pages (`/`, `/lore`, `/timeline`, `/dispatches`, `/novel`, `/bhoomi`, `/forum` + Lore Modal) now render the Classified Chronicle redesign. The items below are the artwork deliverables still needed to reach production quality. **Drop the files at the exact paths listed and the redesigned components will pick them up automatically** — the paths are already wired into `src/content/data/lore-items.json` and the JSX consumers.

**Owner:** Atharva Singh (self-produced via the Bharatvarsh art pipeline)
**Reference docs in the worktree:**
- `.stitch/DESIGN.md` — locked brand tokens, color palette, typography
- `.stitch/DEVANAGARI.md` — verified glyph canon
- `.stitch/ASSETS.md` — per-page, per-section asset binding map

## Summary

| Priority | Count | Category | Status |
|---|---|---|---|
| **P0** — critical (entities exist in lore data, currently rendering broken `<img>`) | 3 pairs | Chars: Surya, Kaali ☒ · Tech: HUD Monocle ☒ | 2/3 |
| **P1** — important (placeholder rendering, breaks layout density) | 4 pairs | Locations: Treaty Zone, Mysuru · Faction: Tribhuj · Tech: The Mesh | ☐ |
| **P2** — low (optional or edge cases) | 2 pairs | Char: Bhoomi AI · Tech: Neural Diodes | ☐ |
| **P3** — nice-to-have upgrades | 4 items | Animated hero · Kahaan dossier banner · Dispatch gap-fill · Richer operative art | ☐ |

**Total required pairs (P0–P2): 9 pairs = 18 `.webp` files**

## File-format expectations

| Aspect | Dimensions | Typical size | Used by |
|---|---|---|---|
| `-card.webp` | 3:4 portrait, 450×600 production | 400–900 KB | Lore grid cards, operatives rails, character selectors |
| `-banner.webp` | 16:9 landscape, 1600×900 production | 500–1200 KB | Lore modal covers, feature splash sections |

Match the format/quality of existing production assets (e.g. `public/images/characters/kahaan-card.webp`).

**Art-style negative prompts (per `video-production/projects/bharatvarsh/project.yaml`):** no anime, chibi, 3D render, photorealistic, cartoon, watercolor, pastel. Target is Jim Lee modern American comic book illustration.

---

## P0 — Critical (required to stop rendering broken images)

### ☐ 1. Surya — character
- **Paths:**
  - `public/images/characters/surya-card.webp`
  - `public/images/characters/surya-banner.webp`
- **Art direction:** Jim Lee modern American comic book style. Suppressed carbine visible, dark brace-comm worn on the forearm. **Confirm faction from your manuscript** before production — the memory doesn't have a locked allegiance.
- **Consumers (where it auto-plugs in):**
  - `/lore` operatives masonry (filter = all or characters — currently shows 7 characters including Surya with a picsum placeholder)
  - `/lore` dossier modal when Surya is clicked (cover image + gallery)
  - `/timeline` "Files from this era" connected operatives rail
  - `/bhoomi` "Bhoomi Knows" operatives rail
  - `/novel` operatives highlights 2×2 grid (right of Kahaan's featured card)

### ☒ 2. Kaali — character (DELIVERED 2026-04-14)
- **Paths:**
  - `public/images/characters/kaali-card.webp`
  - `public/images/characters/kaali-banner.webp`
- **Art direction (locked per `project_kaali_character_design.md` memory):**
  - Michelle Yeoh-inspired face
  - Emerald command eyes
  - Gold hair-ring with 3 mountain peaks
  - Burn scars from the ICU scene
  - Faction: Military Intelligence / Bharatsena command
- **Consumers:** Same 5 routes as Surya.

### ☒ 3. HUD Monocle — tech (DELIVERED 2026-04-14)
- **Paths:**
  - `public/images/misc/hud-monocle-card.webp`
  - `public/images/misc/hud-monocle-banner.webp`
- **Art direction:** Bharatsena standard-issue optical implant. Cyan glow on the visor ring. Floating visor style matching Kahaan's monocle detail (per `project_kahaan_monocle_detail.md` — the visor floats over the LEFT eye, cyan glow, small scar on RIGHT cheek).
- **SHORTCUT:** `video-production/assets/bharatvarsh/tech/hud-monocle-active.jpg` already exists in the content-pipelines repo. If the crop works, convert JPG → WebP (e.g., `cwebp -q 85 hud-monocle-active.jpg -o hud-monocle-card.webp`) and drop directly.
- **Consumers:**
  - `/lore` tech grid (6 tech items rendered as a tossed-evidence rotated spread)
  - `/lore` dossier modal
  - Home page featured Kahaan spotlight (trait chip reads `HUD MONOCLE — LEFT EYE` — production will be more credible once a real image exists to hover-link to)

---

## P1 — Important (placeholder rendering, breaks visual density)

### ☐ 4. Treaty Zone — location
- **Paths:**
  - `public/images/locations/treaty-zone-card.webp`
  - `public/images/locations/treaty-zone-banner.webp`
- **Art direction:** The contested neutral border between Bharatsena and Akakpen territories. Gritty, windblown dust, scattered evidence of past skirmishes. Dystopian checkpoint aesthetic.
- **Consumers:** `/lore` Locations Rail, `/lore` dossier modal, `/timeline` 1850 Point of Divergence callout.

### ☐ 5. Mysuru — location
- **Paths:**
  - `public/images/locations/mysuru-card.webp`
  - `public/images/locations/mysuru-banner.webp`
- **Art direction:** Historical city with surviving pre-mesh architecture. Heritage but compromised — layer modern surveillance infrastructure subtly over a traditional cityscape.
- **Consumers:** Same as Treaty Zone.

### ☐ 6. Tribhuj — faction illustrated art
- **Paths:**
  - `public/images/factions/tribhuj-card.webp`
  - `public/images/factions/tribhuj-banner.webp`
- **Note:** The Tribhuj **sigil SVG** is already at `/public/images/brand/factions/tribhuj.svg` (copied from the content-pipelines brand pack 2026-04-13). Only the illustrated card + banner are missing.
- **Art direction (locked per `project_tribhuj_impostor_visual_identity.md` memory):**
  - Cyberpunk aesthetic
  - Charcoal + maroon palette
  - Borderlands × Blade Runner crossover
  - **NO cyan, NO religious iconography**
- **Consumers:** `/lore` factions section (currently only Bharatsena + Akakpen are fully visible; Tribhuj renders in the all-filter view with a placeholder), `/lore` dossier modal.

### ☐ 7. The Mesh — tech
- **Paths:**
  - `public/images/misc/the-mesh-card.webp`
  - `public/images/misc/the-mesh-banner.webp`
- **Art direction:** The surveillance network visualized. Satellite constellation + mesh grid + biometric checkpoints + data tendrils. Dense technical diagram with a cinematic sky/city framing so it works as both card and banner.
- **Consumers:**
  - `/lore` tech grid
  - `/lore` dossier modal
  - `/timeline` Mesh Era content (currently falls back to the timeline era image `mesh-era-1985-2022.jpg` — a dedicated The Mesh visual would improve hierarchy here)

---

## P2 — Low priority (optional or edge cases)

### ☐ 8. Bhoomi AI — character card (OPTIONAL)
- **Paths:**
  - `public/images/characters/bhoomi-card.webp`
  - `public/images/characters/bhoomi-banner.webp`
- **Art direction:** **NOT humanoid.** An abstract living `भूमि` glyph rendered cinematically:
  - Mustard Dossier `#F1C232` glyph core
  - Navy Core `#0B2742` inner gradient glow
  - 3 concentric pulsing ring outlines at 10–20% opacity
  - Dark dystopian ambient background
- **Why optional:** The `/bhoomi` page renders the avatar via CSS-rendered text (giant `भूमि` glyph in `font-[var(--font-devanagari)]`) which looks great. A card/banner is only needed if you want Bhoomi to appear as a selectable lore entity in the Lore grid — which currently does NOT have a bhoomi entry in `lore-items.json`. If you want Bhoomi listed with the other operatives, you'd also need to add a lore-items entry.
- **Consumers:** `/lore` grid (after data entry), `/lore` modal, `/bhoomi` Bhoomi Knows rail (currently shows the other 6 operatives only).

### ☐ 9. Neural Diodes — tech
- **Paths:**
  - `public/images/misc/neural-diodes-card.webp`
  - `public/images/misc/neural-diodes-banner.webp`
- **Art direction:** Biometric implant device, surgical precision. Clinical white surfaces paired with dark mustard LEDs. Lab-style product photography aesthetic (not action).
- **Consumers:** `/lore` tech grid, `/lore` dossier modal.

---

## P3 — Nice-to-have upgrades

### ☐ 10. Animated landing hero background (Remotion loop)
- **Current:** Static `/public/images/landing-hero.jpg` (used as fallback; the new home hero uses the Kahaan banner as its visual anchor so this isn't critical).
- **Upgrade:** A short Remotion-rendered loop of the Indrapur skyline at night with subtle parallax. Source plates already available: `video-production/assets/bharatvarsh/locations/indrapur-skyline.jpg` + `indrapur-night.jpg`.
- **Where it would land:** Optional behind-the-hero layer in `src/features/home/HomeContent.tsx` hero section. Not currently wired.

### ☐ 11. Dedicated Kahaan cinematic dossier banner
- **Current:** `/public/images/characters/kahaan-banner.webp` (generic 16:9) works but isn't optimized for the Lore Modal cover layout.
- **Upgrade:** A **2400×1000** cinematic banner specifically framed so Kahaan sits in the RIGHT third of the composition. The left third needs to stay visually neutral because the modal cover renders a massive `KAHAAN` display headline in that zone.
- **Where it would land:** Just replace the existing file at the same path — no code change needed. The Lore Modal will pick it up automatically.

### ☐ 12. Dispatch gap-fill renders
- **Current:** 13 dispatches in `/public/images/dispatches/` for dates `2026-04-06` through `2026-05-15`.
- **Upgrade:** Additional renders for `2026-03-15` through `2026-04-05` (~10 more) to fill the `/dispatches` masonry with more visual variety. The masonry currently feels a bit repetitive in the upper rows.
- **Target path format:** `public/images/dispatches/bhv-YYYYMMDD-NNN.webp`
- **Also:** add corresponding entries to `src/content/data/dispatches.json` so the new files are actually consumed.

### ☐ 13. Richer operative art library integration
- **Current:** 5 character cards + banners in the website (Kahaan, Rudra, Pratap, Hana, Arshi).
- **What the content-pipelines has:** 95+ character assets — 30 Kahaan (including a 9-variant expression set), 28 Rudra, 15 Hana, 10 Arshi, 12 Pratap/Kaali combined.
- **Upgrade:** Pull a curated selection into web-optimized formats for gallery sections + expression-selector UI in the Lore Modal "Visual Dossier" section (currently uses `item.media.banner` repurposed with picsum fillers).
- **Target paths:** `public/images/characters/<id>-gallery/<n>.webp` (new directory convention — add to `lore-items.json` `media.gallery: string[]` field if you want the components to consume them).

---

## Assets already in place (no action needed)

| Category | Items | Count |
|---|---|---|
| Character cards + banners | Kahaan, Rudra, Pratap, Hana, Arshi | 5 of 7 ✅ |
| Faction cards + banners | Bharatsena, Akakpen | 2 of 3 ✅ |
| **Faction sigil SVGs (copied 2026-04-13)** | Bharatsena, Akakpen, Tribhuj | 3 of 3 ✅ |
| Location cards + banners | Indrapur HQ, Lakshmanpur | 2 of 4 ✅ |
| Tech cards + banners | Pulse Gun, Bracecomm, Oxy Pole, Akakpen Dart | 4 of 7 ✅ |
| Dispatches | bhv-20260406 through bhv-20260515 | 13 ✅ |
| Timeline era images | 9 main + 5 phase + 5 mobile phase | 19 ✅ |
| Landing section webps | 6 desktop + 6 mobile | 12 ✅ |
| Novel cover / Author avatar / Logo | Each | 3 ✅ |
| Bharatvarsh master logo (copied 2026-04-13) | SVG + dark/white variants | 3 ✅ |
| BVN masthead (copied 2026-04-13) | Full SVG + compact SVG | 2 ✅ |

**Total assets already live: 95+ files across `public/images/`**

---

## How to verify each asset after producing it

1. Drop the `.webp` file at the exact path listed above
2. From the worktree `.worktrees/redesign-stitch-2026-04-13`, ensure dev server is running: `npm run dev -- -p 3002` (already running in the Claude session background)
3. Navigate to the consumer page (e.g. `http://localhost:3002/lore` for a character/faction/location/tech card)
4. The asset should render in place of the picsum placeholder on next hot reload
5. Check off the item in this file (`- [x]`) and commit the doc update
6. When all P0 items are done, update the session task status

## Commit convention

When updating this file as items land, use:

```
chore(assets): mark P0 item 1 (Surya character) as delivered

Added:
- public/images/characters/surya-card.webp (Jim Lee, 450x600, 645 KB)
- public/images/characters/surya-banner.webp (Jim Lee, 1600x900, 980 KB)

Verified rendering on /lore operatives masonry and /lore dossier modal.
```

## Quick-start: produce and drop a single asset

Using the Bharatvarsh art pipeline in `content-pipelines/bharatvarsh/`:

1. Reference the prompt library at `content-pipelines/bharatvarsh/prompts/` — it already has canonical Kahaan/Rudra/Arshi/Hana/Pratap prompt templates that encode the Jim Lee style + Bharatvarsh brand negative prompts.
2. Create a new prompt file for the missing character (e.g. `tribhuj-operatives-surya.md`) adapting the existing templates.
3. Generate the card (3:4 450×600) + banner (16:9 1600×900) via the Bharatvarsh content pipeline.
4. Optimize with `cwebp -q 85` or equivalent to target 400–900 KB.
5. Drop the two files at the exact paths above.
6. Check the redesigned page renders them correctly.
