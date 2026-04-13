# Bharatvarsh Stitch Port — Missing Assets Log

> **Locked 2026-04-13.** These assets are missing as of the Phase 1-8 port. The redesigned components render placeholders where these would go. **Once you supply real files at the exact paths listed below, the components will pick them up automatically** — no code changes needed.

## Character portraits (card + banner pairs)

The redesign expects `media.card` (3:4 portrait, ~450×600) and `media.banner` (16:9 or 21:9 landscape, ~1600×900+) for each operative shown on Home, Lore Hub, Lore Modal, Timeline operatives rail, Novel operatives highlights, and Bhoomi "Bhoomi Knows" rail.

### 1. Surya (character)
- `public/images/characters/surya-card.webp`
- `public/images/characters/surya-banner.webp`
- **Art direction:** Jim Lee modern American comic book art. Suppressed carbine, dark brace-comm. Faction: see `lore-items.json` entry for Surya to confirm allegiance and visual notes.

### 2. Kaali (character)
- `public/images/characters/kaali-card.webp`
- `public/images/characters/kaali-banner.webp`
- **Art direction (per `project_kaali_character_design.md` memory):** Michelle Yeoh-inspired face, emerald command eyes, gold hair-ring with 3 mountain peaks, burn scars from the ICU scene. Faction: Military Intelligence / Bharatsena command.

### 3. Bhoomi (AI — optional card)
- `public/images/characters/bhoomi-card.webp`
- `public/images/characters/bhoomi-banner.webp`
- **Art direction:** NOT a humanoid portrait. An abstract living glyph — the Devanagari `भूमि` rendered as a cinematic element. Mustard Dossier `#F1C232` core with Navy Core `#0B2742` inner gradient glow, surrounded by 3 concentric pulsing ring outlines. Dark dystopian background.
- Needed for: Lore grid card, Lore Modal relationship graph node, Bhoomi page avatar panel (though the Bhoomi page currently uses CSS-rendered text — this is only for thumbnails).

## Location imagery (card + banner pairs)

### 4. Treaty Zone
- `public/images/locations/treaty-zone-card.webp`
- `public/images/locations/treaty-zone-banner.webp`
- **Art direction:** The contested neutral border between Bharatsena and Akakpen territories. Gritty, dust, scattered evidence of past skirmishes. Dystopian checkpoint aesthetic.

### 5. Mysuru
- `public/images/locations/mysuru-card.webp`
- `public/images/locations/mysuru-banner.webp`
- **Art direction:** A historical city with surviving pre-mesh architecture. Heritage but compromised.

## Faction imagery

### 6. Tribhuj faction (card + banner)
- `public/images/factions/tribhuj-card.webp`
- `public/images/factions/tribhuj-banner.webp`
- **Note:** The Tribhuj SVG sigil is already in place at `/images/brand/factions/tribhuj.svg` (copied from the brand pack). Only the illustrated card + banner are missing.
- **Art direction (per `project_tribhuj_impostor_visual_identity.md` memory):** Cyberpunk aesthetic — charcoal + maroon, Borderlands/Blade Runner crossover. No cyan, no religious iconography.

## Tech item imagery (card + banner pairs)

### 7. HUD Monocle
- `public/images/misc/hud-monocle-card.webp`
- `public/images/misc/hud-monocle-banner.webp`
- **Art direction:** Bharatsena standard-issue optical implant. Cyan glow on the visor ring. Should match Kahaan's monocle detail (from `project_kahaan_monocle_detail.md` memory — floating visor over LEFT eye).
- **Upgrade option:** the content-pipelines video-production repo already has `hud-monocle-active.jpg` — that can be converted to webp and used directly if card/banner crops are acceptable.

### 8. The Mesh (network topology)
- `public/images/misc/the-mesh-card.webp`
- `public/images/misc/the-mesh-banner.webp`
- **Art direction:** The surveillance network itself visualized. Satellite constellation + mesh grid + biometric checkpoints. Dense technical diagram.

### 9. Neural Diodes
- `public/images/misc/neural-diodes-card.webp`
- `public/images/misc/neural-diodes-banner.webp`
- **Art direction:** Biometric implant device, surgical. Clinical white surfaces paired with dark mustard LEDs.

## Optional upgrades (nice-to-haves, low priority)

### 10. Animated landing hero background
- Current `/images/landing-hero.jpg` is static.
- Upgrade option: Remotion-rendered short loop of the Indrapur skyline at night with subtle parallax motion. The content-pipelines already has `indrapur-skyline.jpg` + `indrapur-night.jpg` that could be used as source plates.

### 11. Dedicated Kahaan dossier banner
- Current `/images/characters/kahaan-banner.webp` works but is cropped for a general 16:9 layout.
- A dedicated 2400×1000 cinematic banner specifically framed for the modal dossier cover (with Kahaan positioned in the right third, left third reserved for the tight-tracked display name) would elevate the Lore Modal.

### 12. Dispatch imagery gap fill (earlier dates)
- 13 dispatches exist in `/images/dispatches/` dated `2026-04-06` through `2026-05-15`.
- The Dispatches masonry layout benefits from more visual variety. Additional renders for `2026-03-15` through `2026-04-05` would fill historical gaps.

### 13. Additional character art (existing operatives)
- Kahaan, Rudra, Pratap, Hana, Arshi all have usable card + banner pairs already.
- **But** the content-pipelines video-production repo has MUCH richer asset libraries for each (30 Kahaan assets, 28 Rudra, 15 Hana, 10 Arshi, plus expression sets) that could be pulled into the web at a later optimization pass. Not blocking for the Phase 1-8 port.

## What's already in place (no action needed)

| Category | Count | Status |
|---|---|---|
| Character cards + banners | 5 of 7 (Kahaan, Rudra, Pratap, Hana, Arshi) | ✅ |
| Faction cards + banners | 2 of 3 (Bharatsena, Akakpen) | ✅ |
| Location cards + banners | 2 of 4 (Indrapur HQ, Lakshmanpur) | ✅ |
| Tech item cards + banners | 4 of 7 (Pulse Gun, Bracecomm, Oxy Pole, Akakpen Dart) | ✅ |
| Dispatches webps | 13 | ✅ |
| Timeline era images | 9 | ✅ |
| Timeline phase webps | 5 desktop + 5 mobile | ✅ |
| Landing section webps | 6 desktop + 6 mobile | ✅ |
| Novel cover | 1 | ✅ |
| Author avatar | 1 | ✅ |
| Brand SVGs (trident, 3 faction sigils, BVN masthead) | 8 | ✅ (copied 2026-04-13) |

## How placeholders are rendered

For any missing asset above, the port uses a **deterministic picsum placeholder** so the layout is visually coherent:

```
https://picsum.photos/seed/{stable-id}/{width}/{height}
```

where `{stable-id}` is the entity slug (e.g. `surya-card`, `treaty-zone-banner`). These placeholders are:
- Stable across page reloads (same seed → same image)
- Visually neutral enough that the surrounding layout reads correctly during review
- Easy to find and replace — grep the codebase for `picsum.photos/seed/` to see every placeholder

**When you supply a real file at the expected path, the data-driven components will automatically pick it up** because the paths in `lore-items.json` / `timeline.json` / etc. are already correct — the file just doesn't exist yet.
