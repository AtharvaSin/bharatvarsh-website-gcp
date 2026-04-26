# Home page artwork audit — 2026-04-25

**Branch:** `redesign/stitch-2026-04-13` (HEAD `9ce12ac`, clean, synced with origin).
**Server:** `npm run dev` on `http://localhost:3000`. `bharatvarsh-db` on Docker port 5433 healthy.
**Scope:** `/` (home only). Other routes deferred.
**Method:** Playwright at 1440×900, scroll-triggered every `FadeInSection`, captured per-section PNG, scraped DOM for every `<img>` + inline `<svg>` + their slot. 14 imgs + 10 svgs counted.
**Rubric:** `.stitch/DESIGN.md` tokens × Jim Lee anchors × `negative_prompts.json` × per-section composition locks from `HomeContent.tsx` and `ASSETS.md`.

## TL;DR

| # | Section | Asset | File | Verdict |
|---|---|---|---|---|
| 1 | Hero (Section 1) | Kahaan banner (right, 555×630) | `public/images/characters/kahaan-banner.webp` | KEEP. Composition lock holds (left third neutral). Style is closer to digital-comic than Jim-Lee inked — minor hatching deficit. |
| 2 | Path 02 thumbs | Kahaan, Rudra, Hana cards (60×80 each) | `public/images/characters/{kahaan,rudra,hana}-card.webp` | KEEP. Thumbnails read as identifiers; resolution makes Jim-Lee fidelity moot. |
| 3 | Path 01 | Novel cover tilted -4° (218×272) | `public/images/novel-cover.png` | KEEP. Trident hero, mustard-cyan glow, sharp typography. Already on-brand. |
| 4 | Path 03 | "Bhoomi" home CTA (182×235) | `public/images/bhoomi/bhoomi-home-cta.webp` | **REPLACE**. At thumbnail size the rooftop frame reads as cityscape, not character. Bhoomi's identity is illegible — defeats the "MEET BHOOMI" purpose. |
| 5 | Section 3 spotlight | Kahaan banner reused (789×560) | `public/images/characters/kahaan-banner.webp` | KEEP. At larger size Kahaan reads cleanly. Same hatching gap as #1; acceptable. |
| 6 | Walk the Archive — Rudra | 275×367 card | `public/images/characters/rudra-card.webp` | **CONDITIONAL**. Likeness fine, palette wrong — beige/grey background breaks the obsidian/navy lock. Replace background with atmospheric mountain-refuge wash. |
| 7 | Walk the Archive — `[REDACTED]` | classified placeholder block | (CSS-rendered) | KEEP. Intentional in-universe device for Arshi. Reads correctly. |
| 8 | Walk the Archive — Hana | 275×367 card | `public/images/characters/hana-card.webp` | KEEP. Indrapur-night background, on-palette, on-canon. |
| 9 | Walk the Archive — Pratap | 275×367 card | `public/images/characters/pratap-card.webp` | KEEP. Command-room background, military bearing, palette aligned. |
| 10 | Walk the Archive — Indrapur HQ | 275×367 card | `public/images/locations/indrapur-hq-card.webp` | **REPLACE**. Generic glass-office building with regular cyan window grid. Zero brutalist-Mughal fusion, no Oxy Poles, no Directorate signature. Highest priority replacement. |
| 11 | Fracture timeline | inline crack SVG (160×120) + 8 timeline nodes | n/a (SVG) | KEEP. Best section on the page — pure typographic + SVG dystopia. |
| 12 | What the Mesh Is Watching | dispatches preview grid (3 cards expected) | `public/images/dispatches/bhv-*.webp` (data-driven) | **CODE BUG, not artwork**. 0 cards rendering. A1 visibility filter dropping every entry on home. Flag for separate fix; the dispatches images themselves were verified live on `/dispatches` route in earlier work. |
| 13 | Purchase funnel | Novel cover -6°, 461×639, mustard radial | `public/images/novel-cover.png` | KEEP. Strongest single composition on the page. |

**Scorecard:** 9 KEEP / 1 KEEP-AS-DESIGNED (redacted) / 2 REPLACE / 1 CONDITIONAL / 1 CODE-BUG.

## Replacement plan — 3 artworks

### A. Indrapur HQ card (P0)

**Why this matters most:** This is the only location card in the home rail. It is the only opportunity on the home page to show a visitor what *Bharatvarsh as a place* looks like. The current asset reads as a generic 2020s office building. Compare against the locked canon in `content-pipelines/bharatvarsh/prompts/environment_templates.json::indrapur_hq` — *"monolithic brutalist-Mughal fusion, Oxy Poles flanking the entry, Directorate insignia carved at scale, vertical gardens between brutalist towers, mustard signage discipline, no neon, low-key oppression."* None of that is in the current card.

**Source material already in repo:**
- `video-production/assets/bharatvarsh/content/environments/indrapur-skyline.jpg` — canonical Indrapur master shot
- `video-production/assets/bharatvarsh/content/environments/indrapur-night.jpg` — same city after dark, more dossier-mood
- `video-production/assets/bharatvarsh/content/environments/oxypole-array.jpg` — could be card hero with HQ as backdrop
- `video-production/assets/bharatvarsh/references/Bharatvarsh.webp` — master city aesthetic anchor
- `content-pipelines/bharatvarsh/assets/references/ENVIRONMENT_ART_PROMPTS.md::indrapur_skyline,indrapur_night` — locked Nano-Banana prompts

**Two candidate paths:**
1. **Re-crop existing canonical asset.** Take `indrapur-night.jpg` and crop to 3:4 (450×600 production), keeping a tower silhouette + Oxy-Pole sentinel + a sliver of the Directorate seal. Zero generation cost. Fastest.
2. **Generate a new card-specific composition.** Nano Banana, IP-Adapter on `indrapur-night.jpg` at strength 0.4, prompt anchored to `epic_landscape` style anchor, 3:4 portrait, low-angle hero of one HQ tower wall with a single Oxy Pole foregrounded and the Directorate insignia carved into the wall's mid-section. Banner version 16:9 with the same brief, wider establishing.

Recommend (1) first. It will probably be sufficient and lets us A/B against (2) only if needed.

**Composition lock to honour:** 3:4 portrait, name plate "INDRAPUR HQ" rendered by the component (we do not bake text into the asset), bottom 30% must remain low-detail so the gradient overlay + name chip read clearly.

### B. Bhoomi Path 03 card (P1)

**Why this matters:** Path 03 is the Bhoomi entry point. The CTA reads "MEET BHOOMI". The current image at 182×235 (after -3° rotation, after the section's flex-row card chrome) reads as cityscape — Bhoomi's face and pose disappear at this size. The full hero version of the same image (`bhoomi-avatar-hero.webp`, 800×1200, used on `/bhoomi`) is excellent — *that* is the canonical Bhoomi. The home CTA needs a different crop, not a different image.

**Source material:** `public/images/bhoomi/bhoomi-avatar-hero.webp` (already in repo, 250 KB) and the higher-res reference at `content-pipelines/bharatvarsh/assets/brand/bhoomi/reference/bhoomi-portrait-hero.png`.

**Action:** Re-crop the avatar-hero to a 3:4 close-up where Bhoomi's face + the parapet edge + one of the four uncanny beats (the engraved `भूमि` glyph in stone, OR the not-moving braid against wind) are inside the visible frame. Drop at the same path. No code change needed — Path 03 hot-reloads.

**Watch-outs:** keep the kajal + earring detail in frame (face anchor); ensure shadow doesn't go fully black against the navy card surface; keep the slight back-of-head turn (the "Inquiry" pose) since that's the locked persona signature.

### C. Rudra card (P2 — conditional)

**Why this matters:** Rudra's likeness is correct. The wrong is the *background* — beige/cream wall reads warm and pastoral; everything else on this page is obsidian + navy + mustard. The card breaks rhythm.

**Source material:**
- `video-production/assets/bharatvarsh/content/environments/wilds-rudra-refuge.jpg` — Rudra's canonical mountain refuge environment
- `video-production/assets/bharatvarsh/content/characters/rudra/portraits/` — 30 deployed Rudra assets, several already on darker backgrounds

**Two candidate paths:**
1. **Pick a darker portrait from the existing 30-asset library** for the card slot. Likely the fastest fix.
2. **Composite Rudra figure over the wilds-rudra-refuge plate.** Slightly more work; gives him environmental ground.

Recommend (1). This is a conditional, not a critical.

## What we are NOT recreating

- **Kahaan banner.** Two consumers (hero + spotlight). Style is digital-comic-adjacent rather than fully Jim-Lee inked, but the framing (right-third character anchor, left-third neutral for headline overlay) is exactly what the layout needs. The HUD-monocle visual + the armored vehicle background do real world-building work. A pure Jim-Lee re-render is high risk — could destabilize composition. **If** we ever re-render: must obey the left-third neutrality lock and keep the HUD glow + crew compartment anchor.
- **The fracture timeline / crack SVG / dot system.** Strongest single section. No artwork to replace.
- **Novel cover.** Working as designed. The trident + electric-blue glow + mustard radial in the purchase funnel is the page's strongest closer.
- **Hana, Pratap, Arshi (redacted).** All on-canon and on-palette.

## Code follow-ups discovered during the audit

- **Hydration mismatch warning** on first paint. `HomeDossierModal` SSR/CSR drift — non-fatal, but should be patched. Likely an `aria-hidden`/`style.display` mismatch when the modal is closed. Out of scope for this audit but worth a quick fix.
- **Dispatches preview empty.** The "WHAT THE MESH IS WATCHING" section renders the heading + CTA only — 0 cards. Likely the recent A1 visibility filter (`feat(dispatches): A1 visibility filter + primary-URL wiring`, commit `1889dcd`) is excluding all entries on the home preview view. Either the data is missing a `visibility: "public"` flag for the home subset, or the filter predicate is wrong. Out of scope for this audit but flagging because a section heading without content reads as a half-finished page on first scroll.

## Suggested order of operations

1. **Approve this audit.** No artwork generated until you sign off.
2. **Fast wins first:** re-crop existing canonical files for Indrapur HQ (A.1) and Bhoomi Path 03 (B). These are seconds of work, zero AI cost, and fix the two most visible breaks.
3. **A/B if needed.** If the re-crops don't carry, we move to Nano-Banana generation for Indrapur HQ (A.2) using the locked environment-art prompt + IP-Adapter at strength 0.4–0.5 on the existing canonical plate.
4. **Rudra background swap (C.1).** Pick a darker portrait variant from `video-production/assets/bharatvarsh/content/characters/rudra/portraits/`.
5. **Separate ticket: dispatches A1 filter fix + hydration warning.** Not artwork — flag to the user as code follow-ups.

## Files referenced in this audit

- `.stitch/DESIGN.md` — locked tokens
- `.stitch/ASSETS.md` — per-section binding map
- `.stitch/MISSING_ASSETS.md` — pre-audit asset checklist
- `src/features/home/HomeContent.tsx` — render structure
- `src/app/globals.css` — implemented design tokens
- `content-pipelines/bharatvarsh/prompts/environment_templates.json` — Indrapur HQ canon
- `content-pipelines/bharatvarsh/prompts/style_anchors.json` — 5 Jim Lee anchors
- `video-production/assets/bharatvarsh/content/environments/` — 13 canonical environment plates
- `video-production/assets/bharatvarsh/content/characters/{rudra,kahaan}/` — 60+ character assets
- `content-pipelines/bharatvarsh/assets/brand/bhoomi/reference/` — Bhoomi hi-res reference
