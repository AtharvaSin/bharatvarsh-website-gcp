# Kahaan card + banner — Seedream 4.5 prompt package

**Prepared:** 2026-04-25
**Model:** OpenArt → Seedream 4.5 (faces/costume must match reference per `bharatvarsh-art-prompts` skill routing)
**Canon source:** `character_dna.json::kahaan` (patched 2026-04-25), `project_kahaan_monocle_detail.md` memory, Kahaan Character Report
**Style anchors:** `content-pipelines/bharatvarsh/prompts/style_anchors.json::cinematic_portrait` (card) and `epic_landscape` blended with `cinematic_portrait` (banner)

## Canon corrections applied (one-time, no longer drifting in the source data)

| Field | Pre-2026-04-25 (wrong) | Manuscript canon (now locked) |
|---|---|---|
| HUD monocle eye-side | "near right eye" | **LEFT eye** (DBZ-style apparatus-less hologram) |
| HUD color | "faint blue-white light" | **Electric cyan #17D0E3** |
| HUD apparatus | "floating tactical lens" | **No physical lens, no frame** — pure hologram |
| Skin tone | "warm brown" | **Fair-wheatish wheat-gold** |
| Scar position | (often unspecified) | **RIGHT side, 2", eyebrow → cheekbone bend** |
| HUD state in portraits | (always on) | **OFF in official, ON in battle/operational** |

The two new artworks exploit the OFF/ON distinction:
- **Card** = lore archive entry = official record = **HUD OFF**
- **Banner** = modal cover = operational moment = **HUD ON** + floating Mag-Holster pistols

This canon fits the "Brutalist Classified Briefing" UI exactly: cards read as personnel-file headshots; banners read as field-deployed dossier covers.

---

## A. CARD — `kahaan-card.webp` (3:4, 1080×1440 production)

**Live consumer:** `/lore` archive masonry, lore modal cover thumbnail, Path 02 thumb on home, `/timeline` operative rail.

**State lock:** HUD OFF · Official portrait · Solemn dossier framing.

### Positive prompt — copy verbatim into Seedream

```
Jim Lee modern American comic book art style, heroic dossier portrait with dense hatching and cross-hatching for depth and volume, heavy blacks balanced with sharp white highlights, bold ink outlines with varying line weight, heroic musculature and strong jawline, textured line-work surfaces with slight grit and pen-and-ink feel.

Subject: Indian man, early 30s, lean athletic 6'1" build, military bearing. Close-cropped black hair with clean fade and short textured quiff, light stubble. Sharp defined jaw, high cheekbones, fair-wheatish skin tone — medium warm wheat-gold, NEVER dark brown. Intense dark brown eyes conveying intelligence and controlled intensity, looking past the camera (contemplative — NOT direct stare).

HUD MONOCLE IS OFF: his LEFT eye is clean, no hologram, no projection, no glow, no cyan light source on his face. The dormant signature is implied but not visible. The 2-inch scar on the RIGHT side of his face runs vertically — eyebrow level dropping along the cheekbone angle — muted cyan tone at rest, NOT glowing.

Wearing Bharatsena dress uniform: powder-blue shirt under dark navy fitted officer's over-coat with structured shoulders, gold (mustard) piping on the collar and cuffs, rank insignia above the left chest pocket, ribbon rack of four ribbons on the right chest, large army emblem across the coat back, NORTHERN PLAINS COMMAND patch on the right shoulder. Twin shoulder holsters mostly hidden under the coat; Mag-Holster plates suggested at the rib line. No weapons drawn or floating — official mode.

Composition: 3:4 dossier hero portrait. Low-angle 50–85mm heroic close-up at chest level. Three-quarter angle facing camera-right. Both arms relaxed at sides. Head-to-mid-thigh framing. Shot like an army personnel-file portrait but with cinematic Jim Lee weight.

Environment: deep obsidian #0F1419 backdrop with a subtle Mughal jali screen pattern in shadow on the upper-left and upper-right thirds, so the silhouette of Kahaan reads cleanly against negative space. A faint mustard #F1C232 rim light from camera-right edge defines the silhouette of the over-coat shoulder and right cheekbone. Faint scanline overlay 0.06 opacity, 0.04 film grain across the full frame, classified-document paper-grain texture barely visible in extreme background. Atmosphere: solemn, official, dossier-stamp formal. NO cyan light, NO blue glow, NO holographic display anywhere in frame.
```

### Negative prompt — copy verbatim

```
low quality, blurry, deformed, disfigured, extra limbs, extra fingers, mutated hands, poorly drawn face, ugly, oversaturated, neon, white background, stock photo, generic, watermark, text, logo, signature, soft gradients, airbrush, smooth digital rendering, watercolor, anime, manga, chibi, flat colors, pastel palette, cel shading, vector art, minimalist, abstract, photorealistic, photograph, 3D render, CGI, Pixar style, oil painting, impressionist, bad hands, wrong number of fingers, asymmetric face, crossed eyes, monocle on right eye, scar on left side, scar on left cheek, dark brown skin, full visor, both eyes covered, holographic projection visible, cyan glow on face, blue light source, floating pistols, weapons in frame, drawn pistols, anachronistic clothing, modern street clothes, headphones, sunglasses, hat, beard, long hair, mustache
```

### IP-Adapter reference attachments

| File | Path | Role | Strength |
|---|---|---|---|
| `Kahaan Expressions.jpg` | `video-production/assets/bharatvarsh/references/Kahaan Expressions.jpg` | Face anchor (primary) | **0.55** |
| `Kahaan Front.png` | `video-production/assets/bharatvarsh/references/Kahaan Front.png` | Costume / uniform reference | **0.45** |

### Generation parameters

- Aspect ratio: **3:4** (1080×1440 native)
- Steps: **40**
- Guidance: **6.5**
- Seeds: run **4 different seeds**, pick the strongest
- Output: PNG → convert to WebP quality 85 (target 400–900 KB)
- Final filename: `kahaan-card.webp`
- Drop at: `public/images/characters/kahaan-card.webp` in the worktree (back up the existing file as `kahaan-card.webp.bak` first)

---

## B. BANNER — `kahaan-banner.webp` (16:9, 1600×900 production)

**Live consumer:** lore modal cover (Section 1), home hero right column, Section 3 Kahaan Spotlight.

**State lock:** HUD ON · Operational moment · Twin Mag-Holster pistols hovering · Left third reserved dark for headline overlay.

### Positive prompt — copy verbatim into Seedream

```
Jim Lee modern American comic book art style, cinematic establishing shot with dense hatching and cross-hatching for depth and volume, heavy blacks balanced with sharp white highlights, bold ink outlines, dynamic foreshortened low-angle composition, dramatic perspective, textured line-work surfaces with slight grit and pen-and-ink feel.

Subject: Indian man, early 30s, lean athletic 6'1" build, military bearing. Close-cropped black hair with clean fade. Stubble. Sharp defined jaw, high cheekbones, fair-wheatish skin tone — medium warm wheat-gold, NEVER dark brown. Intense dark brown eyes.

HUD MONOCLE IS ON: a DBZ-style apparatus-less translucent semi-rectangular hologram floats 3–5cm in front of his LEFT eye, electric cyan #17D0E3, thin tiny ticks and arcs visible on the surface, edges dissolving into micro-geometric shards. The cyan glow casts soft blue highlights on his left cheekbone, brow, and nose bridge. NO physical lens, NO frame, NO mounting — the projection is pure light, semi-transparent so his eye is visible through it.

The 2-inch scar on the RIGHT side of his face glows brighter cyan because the HUD is ON — eyebrow level dropping along the cheekbone angle, faint cyan luminescence tracing its line.

Combat field dress: navy officer's over-coat shed open, powder-blue shirt visible underneath, twin shoulder holsters fully exposed. Two service pistols hover at shoulder height beside him via magnetic telekinesis — not held, not on strings — with faint electric-blue control shimmer connecting them to him. Right-handed. Slight forward-lean operational stance.

Composition: 16:9 cinematic establishing wide. Kahaan positioned in the RIGHT TWO-THIRDS of the frame; the LEFT THIRD must remain dark and atmospheric — empty negative space for headline overlay, no character body, no bright environmental detail in the left third. Low-angle 24–35mm wide cinematic, hero level, three-quarter facing camera-right. The two floating pistols frame the upper-right region; the cyan HUD glow projects faintly into the camera-right negative space.

Environment: Bharatsena armored command vehicle interior at night — heavy steel walls and angular industrial geometry behind him, faint cyan HUD glass screens floating at mid-distance camera-right showing maps and case-data linework, mustard-amber emergency lights from below casting hard shadow bars across his over-coat. The open hatch behind him reveals a sliver of Indrapur night cityscape, Oxy Pole silhouettes, rain on the tarmac. Subtle Mughal jali screen patterns visible in the steel reliefs. Deep obsidian #0F1419 shadows dominate the entire LEFT THIRD of the frame. 0.04 film grain, 0.06 scanline drift, classified-vignette breathing on the edges.
```

### Negative prompt — copy verbatim

```
low quality, blurry, deformed, disfigured, extra limbs, extra fingers, mutated hands, poorly drawn face, ugly, oversaturated, neon, white background, stock photo, generic, watermark, text, logo, signature, soft gradients, airbrush, smooth digital rendering, watercolor, anime, manga, chibi, flat colors, pastel palette, cel shading, vector art, minimalist, abstract, photorealistic, photograph, 3D render, CGI, Pixar style, oil painting, impressionist, bad hands, wrong number of fingers, asymmetric face, crossed eyes, monocle on right eye, full visor across both eyes, scar on left side, dark brown skin, character on left side of frame, headline-blocking elements in left third, bright light in left third, character centered, no monocle, no scar, generic ribbon rack, modern street clothes, headphones, sunglasses, hat, long hair, mustache, day light, sunny background, blue sky
```

### IP-Adapter reference attachments

| File | Path | Role | Strength |
|---|---|---|---|
| `Kahaan Expressions.jpg` | `video-production/assets/bharatvarsh/references/Kahaan Expressions.jpg` | Face anchor (primary) | **0.55** |
| `Kahaan Front.png` | `video-production/assets/bharatvarsh/references/Kahaan Front.png` | Costume / uniform reference | **0.40** |
| `Kahaan angle.jpg` | `video-production/assets/bharatvarsh/references/Kahaan angle.jpg` | Action-pose reference | **0.35** |
| `Kahaan Monocle.jpg` | `video-production/assets/bharatvarsh/references/Kahaan Monocle.jpg` | HUD geometry pin (added 2026-04-25 brainstorm) | **0.30** |

### Generation parameters

- Aspect ratio: **16:9** (1600×900 native)
- Steps: **45**
- Guidance: **6.5**
- Seeds: run **4 different seeds**, pick the strongest
- Output: PNG → convert to WebP quality 85 (target 500–1200 KB)
- Final filename: `kahaan-banner.webp`
- Drop at: `public/images/characters/kahaan-banner.webp` in the worktree (back up the existing file as `kahaan-banner.webp.bak` first)

---

## C. Quality gate (apply per output before keeping)

1. Face matches `Kahaan Expressions.jpg` reference identity
2. Skin tone is fair-wheatish wheat-gold, NOT dark brown
3. **Card:** HUD is OFF (left eye clean, no projection, no cyan glow on face)
4. **Banner:** HUD is ON (DBZ-style hologram on LEFT eye, cyan only — never right eye, never full visor)
5. Scar on RIGHT cheek, eyebrow→cheekbone bend, dormant on card / glowing on banner
6. Bharatsena uniform: powder-blue shirt + navy over-coat + mustard piping
7. Jim Lee dense hatching texture present (NOT smooth digital paint)
8. **Card:** dossier-portrait composition, no weapons visible
9. **Banner:** left-third neutral for headline, two floating pistols upper-right
10. Brand palette held: obsidian + navy + mustard + (banner only) minimal cyan from HUD — no neon, no oversaturation

---

## D. After delivery

1. Drop the two new files at the paths above (back up the existing `.webp` first).
2. Hot-reload `http://localhost:3000` and visually diff against the previous audit screenshots:
   - Hero (Section 1) — banner reused
   - Section 3 Kahaan Spotlight — banner reused
   - Walk the Archive Kahaan card slot
3. If the home dossier modal opens cleanly with the new cover, mark MISSING_ASSETS.md P3 #11 (Kahaan cinematic dossier banner) as DELIVERED.
4. Optionally: while you're in there, generate the visual-dossier roster items per `HOME_ARTWORK_AUDIT_2026-04-25.md` § Visual dossier roster (deferred per user instruction).
