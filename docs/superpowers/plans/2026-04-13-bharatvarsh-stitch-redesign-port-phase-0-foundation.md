# Bharatvarsh Stitch Redesign Port — Phase 0: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the design system foundation (docs, semantic tokens, a handful of missing primitives, refreshed Header & Footer) so every subsequent per-screen port plan can import brand-faithful pieces without re-deriving them.

**Architecture:** The existing repo already ships most of what we need — `src/app/globals.css` defines every brand color, shadow, z-index, and font used in the Stitch designs; `src/shared/ui/` already contains `FilmGrainOverlay`, `ScanlineEffect`, `GlyphWatermark`, `StampAnimation`, `ParticleField`, and shadcn primitives. This phase therefore focuses on **documenting** the locked Stitch design system inside the repo, **adding semantic token aliases** that map to the Stitch naming (`mustard-dossier`, `navy-signal`, etc.), **creating three small missing primitives** (`EyebrowLabel`, `DossierDivider`, `DocumentStamp`), and **refreshing Header + Footer** to match the new classified-chronicle visual rhythm. No existing component is deleted. Every change is additive or a drop-in visual refresh.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4 (theme via `@theme inline` in globals.css), Framer Motion 12, lucide-react icons, ESLint flat config.

**Adapted TDD rhythm:** This repo has no unit-test runner (no vitest/jest). The verification gate for every task is: `npx tsc --noEmit` passes, `npm run lint` passes, and — for visual changes — a manual dev-server spot check. Where possible each task still defines an explicit "expected state" the verifier must see (e.g. a specific exported symbol, a specific CSS variable, a specific className). This is TDD in spirit: declare the observable state, then make it true.

**Canonical Stitch source:** The approved visual language lives in Stitch project `Bharatvarsh Narrative Experience` (`16732815330963606548`). Screen IDs are recorded in the repo at `.stitch/DESIGN.md` (created in Task 1) and in the user's memory file `project_bharatvarsh_stitch_redesign.md`. When deciding how a component should look, trust the Stitch screen first, then the docs, then this plan.

**Out of scope for Phase 0:** Every feature content file (`HomeContent`, `LoreContent`, `TimelineContent`, `DispatchesContent`, `NovelContent`, `BhoomiContent`, `ForumContent`) and every lore/dispatch modal. Those are their own phase plans.

---

## File structure for Phase 0

**Create:**
- `.stitch/DESIGN.md` — locked Bharatvarsh Classified Chronicle design system snapshot (doc)
- `.stitch/DEVANAGARI.md` — verified Devanagari glyph canon (doc)
- `src/shared/ui/EyebrowLabel.tsx` — `DOSSIER ▪ CASE #0042 ▪ INDRAPUR` pattern primitive
- `src/shared/ui/DossierDivider.tsx` — 1px Navy Signal border-top divider with optional Mustard dot
- `src/shared/ui/DocumentStamp.tsx` — classified `DOC ID: BVR-0001 ▪ REV 27` stamp used in footer + modal corners

**Modify:**
- `package.json` — add `typecheck` script
- `src/app/globals.css` — add semantic token aliases in `:root` + `@theme inline` blocks (Mustard Dossier, Navy Signal, Obsidian Void/Deep/Panel, Powder Signal, Bone, Steel, Shadow, Redaction, Confirm, Classified dashed border color). All are aliases pointing at existing numeric tokens — zero visual change until components adopt them.
- `src/shared/layout/header.tsx` — replace current "active item is mustard text" pattern with a 2px mustard underline + tight IBM Plex caps metadata styling, add a small `भा` Devanagari mark beside the wordmark logo
- `src/shared/layout/footer.tsx` — convert column headings to IBM Plex caps `+0.18em` tracking, add the Devanagari `भा` mark next to the brand wordmark, add a classified DOC ID stamp row beneath the bottom bar
- `src/shared/ui/index.ts` — export the three new primitives

**No files deleted.** No feature content files touched. No backend, routes, auth, Prisma, or deployment config touched.

---

## Task 1: Scaffold `.stitch/` design docs

**Files:**
- Create: `.stitch/DESIGN.md`
- Create: `.stitch/DEVANAGARI.md`

- [ ] **Step 1: Verify the target directory does not already exist**

Run: `ls .stitch 2>&1`
Expected: `ls: cannot access '.stitch': No such file or directory`

- [ ] **Step 2: Create `.stitch/DESIGN.md`**

File: `.stitch/DESIGN.md`

```markdown
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
| Shadow Text | `--color-shadow` → `--text-muted` | `#718096` | Metadata labels |
| Redaction Red | `--color-redaction` → `--status-alert` | `#DC2626` | [REDACTED] bars, alerts only |
| Declassified Green | `--color-declassified` → `--status-success` | `#10B981` | Declassify / success — minimal |

**Banned:** pure `#000000`, purple/violet/cyan neon glows (no new hues outside the above). The palette is locked.

## Typography
Bharatvarsh ships its own font stack in `globals.css` lines 171–175. No change needed — the Stitch enum fonts (`Space Grotesk` / `IBM Plex Sans`) are only visual stand-ins for the enum limitation. The production port uses the real brand fonts:

- **Display:** Bebas Neue → Anton fallback → `var(--font-sans)` — all-caps, tight tracking, weight-driven hierarchy
- **Body:** Inter → Noto Sans — 1.65 leading, max 65ch
- **Serif italic (in-world quotes):** Crimson Pro → Noto Serif
- **Devanagari:** Noto Sans Devanagari → Tiro Devanagari Hindi — treat Devanagari as visual ornament at 10–25% opacity behind English display
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
- **Eyebrow label (new):** IBM Plex caps 11–13px, `+0.18em` tracking, Shadow Text color, `▪` separators in Mustard — see `EyebrowLabel` primitive in Task 4
- **Dossier card:** border-top only (no full card box). Created via the new `DossierDivider` primitive in Task 5.
- **Document stamp (new):** footer corner classification sticker `DOC ID: BVR-0001 ▪ REV 27` — created in Task 6.
- **Navigation:** sticky top bar, Obsidian Void 85% backdrop blur, 2px Mustard underline for active item (replacing the current mustard-text pattern — see Task 7)

## Voice & copy
In-world intelligence briefing crossed with literary chapter epigraphs. Every CTA is an action verb: `ENTER THE DOSSIER`, `MEET THE OPERATIVES`, `UNSEAL THE CHRONICLE`. Never `Learn More`, `Click Here`, or `Explore`.

## Anti-patterns (NEVER)
Pure black, purple/violet/cyan neon, 3-equal-card rows, centered heroes, scroll arrows / "scroll to explore", fabricated statistics, Inter on display, lorem ipsum, emojis, stock photography, overlapping text zones.
```

- [ ] **Step 3: Verify DESIGN.md wrote correctly**

Run: `head -5 .stitch/DESIGN.md && echo '---' && wc -l .stitch/DESIGN.md`
Expected: first 5 lines include `# Bharatvarsh — Classified Chronicle Design System`, total line count > 50.

- [ ] **Step 4: Create `.stitch/DEVANAGARI.md`**

File: `.stitch/DEVANAGARI.md`

```markdown
# Bharatvarsh — Devanagari Canon

> **Locked 2026-04-13.** Every Devanagari glyph used anywhere in the site MUST come from this list. Romanizations are included to make it easy for non-native speakers to verify what they're seeing. If a word is missing, add it here BEFORE using it in code.

## Places
| Name | Devanagari | Romanized | Meaning |
|---|---|---|---|
| Bharatvarsh (land) | `भारतवर्ष` | bhāratavarṣa | The alternate-history subcontinent |
| Indrapur | `इंद्रपुर` | indrapur | Capital city |
| Lakshmanpur | `लक्ष्मणपुर` | lakṣmaṇpur | Secondary city |
| Magna Carta Memorial | `महासनद स्मारक` | mahāsanad smārak | Historical monument |
| Border | `सीमा` | sīmā | Contested border |
| Magna Carta Day | `महासनद दिवस` | mahāsanad divas | Annual ceremony |

## Factions
| Name | Devanagari | Romanized | Meaning |
|---|---|---|---|
| Bharatsena | `भारतसेना` | bhāratsenā | The militarized state |
| Akakpen | `आकाकपेन` | ākākpen | Tribal resistance (transliteration of fictional name) |

## Operatives
| Name | Devanagari | Romanized | Notes |
|---|---|---|---|
| Kahaan | `कहान` | kahān | Protagonist; root of `कहानी` (story), fits "Storyteller" alias. NEVER use `काहान`. |
| Rudra | `रुद्र` | rudra | Ally / mentor |
| Arshi | `आर्शी` | ārśī | Romantic interest |
| Hana | `हाना` | hānā | Subordinate |
| Pratap | `प्रताप` | pratāp | Rival |
| Bhoomi (AI) | `भूमि` | bhūmi | Classified oracle (the name literally means "earth/land") |

## Concepts
| Concept | Devanagari | Romanized | Notes |
|---|---|---|---|
| Archive / record | `अभिलेख` | abhilekh | CORRECT word for archive. NEVER use `पुरालेख` (that means paleography) |
| Chronology / timeline | `कालक्रम` | kālakram | Literary register |
| Divergence / partition | `विभाजन` | vibhājan | Used for the 1850 fork |
| Relationships | `संबंध` | sambandh | |
| Broadcast / transmission | `प्रसारण` | prasāraṇ | Standard word for news broadcast |
| Mesh era (Net era) | `जाल युग` | jāl yug | NEVER use `मेश युग` — `मेश` is just a transliteration, `जाल` is the authentic Hindi |
| Novel / book | `ग्रंथ` | grantha | Used on `/novel` |
| Forum / stage | `मंच` | mañca | Used on `/forum` |
| Field | `क्षेत्र` | kṣetra | Reserved for forum sub-usage |
| Logo mark | `भा` | bhā | First syllable of `भारत`, used as compact logo mark |

## Rendering rules
1. Always render with `font-devanagari` (Noto Sans Devanagari → Tiro Devanagari Hindi fallback)
2. When used as a ghost layer behind English display, opacity 10–15%, size 2–2.5× the English display, color Powder Signal
3. When used as inline subscript beneath an English name, opacity 60–80%, size ~30% of the English display, color Powder Signal
4. Never interleave Devanagari with English on the same visual line (they occupy separate vertical zones)
5. Never use Devanagari for UI button labels — English only for interactive affordances

## Open verification items
The author is not a native Hindi speaker in the implementation session. If any of the above has a canonical spelling from the published manuscript that differs from this list, update this file and reapply via a single batch edit across all screens. As of 2026-04-13 the above is treated as verified by the Stitch redesign review.
```

- [ ] **Step 5: Verify DEVANAGARI.md wrote correctly**

Run: `head -5 .stitch/DEVANAGARI.md && echo '---' && wc -l .stitch/DEVANAGARI.md`
Expected: first 5 lines include `# Bharatvarsh — Devanagari Canon`, line count > 40.

- [ ] **Step 6: Commit the docs**

```bash
git add .stitch/DESIGN.md .stitch/DEVANAGARI.md
git commit -m "docs(stitch): add design system + devanagari canon snapshots

Locks the Bharatvarsh Classified Chronicle visual language and Devanagari
glyph canon into the repo so future ports reference the same source of
truth as the Stitch project."
```

Expected: one commit landing 2 files, no errors.

---

## Task 2: Add `typecheck` script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Confirm script is missing**

Run: `grep '"typecheck"' package.json`
Expected: no match (exit code 1).

- [ ] **Step 2: Add `typecheck` and `checks` scripts**

Edit `package.json` scripts section. Before:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
```

After:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "checks": "npm run typecheck && npm run lint && npm run build",
```

- [ ] **Step 3: Run the new typecheck script against the current clean baseline**

Run: `npm run typecheck 2>&1 | tail -20`
Expected: clean exit (no TS errors). If pre-existing errors appear, STOP and report — do not proceed until the baseline is clean.

- [ ] **Step 4: Run lint baseline**

Run: `npm run lint 2>&1 | tail -30`
Expected: passes (or same warning count as tracked in `lint_output.txt`). Record the exact warning count.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "chore: add typecheck + checks npm scripts

typecheck runs tsc --noEmit, checks chains typecheck + lint + build.
Used as the verification gate for every subsequent redesign-port task."
```

---

## Task 3: Add semantic token aliases to `globals.css`

**Files:**
- Modify: `src/app/globals.css` (insert after line 62 in `:root` and after line 168 in `@theme inline`)

- [ ] **Step 1: Baseline — confirm existing numeric tokens still compile**

Run: `grep -n 'mustard-500' src/app/globals.css`
Expected: the existing definition at line 25 and theme reference at line 143 are found.

- [ ] **Step 2: Add semantic alias variables in `:root`**

Insert after line 62 (right after the Faction Colors block, before the Gradients block) in `src/app/globals.css`:

```css
  /* Semantic aliases (Bharatvarsh Classified Chronicle — locked 2026-04-13) */
  --obsidian-void: var(--obsidian-900);
  --obsidian-deep: var(--obsidian-800);
  --obsidian-panel: var(--obsidian-700);
  --navy-core: var(--navy-900);
  --navy-signal: var(--navy-600);
  --mustard-dossier: var(--mustard-500);
  --mustard-hot: var(--mustard-400);
  --powder-signal: var(--powder-300);
  --bone-text: var(--text-primary);
  --steel-text: var(--text-secondary);
  --shadow-text: var(--text-muted);
  --redaction: var(--status-alert);
  --declassified: var(--status-success);
```

- [ ] **Step 3: Add the same aliases in `@theme inline` for Tailwind class generation**

Insert after line 168 (right after the event color block, before the Fonts block) in `src/app/globals.css`:

```css
  /* Semantic aliases for Tailwind utilities */
  --color-obsidian-void: var(--obsidian-void);
  --color-obsidian-deep: var(--obsidian-deep);
  --color-obsidian-panel: var(--obsidian-panel);
  --color-navy-core: var(--navy-core);
  --color-navy-signal: var(--navy-signal);
  --color-mustard-dossier: var(--mustard-dossier);
  --color-mustard-hot: var(--mustard-hot);
  --color-powder-signal: var(--powder-signal);
  --color-bone-text: var(--bone-text);
  --color-steel-text: var(--steel-text);
  --color-shadow-text: var(--shadow-text);
  --color-redaction: var(--redaction);
  --color-declassified: var(--declassified);
```

- [ ] **Step 4: Verify the new variables are syntactically valid via build**

Run: `npm run typecheck 2>&1 | tail -5`
Expected: still passes (CSS is not type-checked but tsc should remain clean).

Run: `npm run build 2>&1 | tail -20`
Expected: build succeeds. Look for any CSS-related error; if Tailwind warns about unknown utilities, the variable name likely has a typo.

- [ ] **Step 5: Confirm classes are generated**

Run: `grep -o 'text-mustard-dossier\|bg-obsidian-void\|border-navy-signal' .next/static/css/*.css 2>&1 | head -5`
Expected: at least one match after build (meaning Tailwind is emitting the alias classes when consumed). If no consumer exists yet and nothing is emitted, that's fine — move on; Task 7/8 will consume them.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(tokens): add Bharatvarsh Classified Chronicle semantic aliases

Adds mustard-dossier, navy-signal, obsidian-void/deep/panel, powder-signal,
bone-text, steel-text, shadow-text, redaction, declassified as aliases pointing at the
existing numeric brand tokens. Pure additive change — no existing class is
broken. Future components will consume the semantic names so the visual
intent is self-documenting."
```

---

## Task 4: Create `EyebrowLabel` primitive

**Files:**
- Create: `src/shared/ui/EyebrowLabel.tsx`

- [ ] **Step 1: Verify the file does not exist**

Run: `ls src/shared/ui/EyebrowLabel.tsx 2>&1`
Expected: `No such file or directory`

- [ ] **Step 2: Write the component**

File: `src/shared/ui/EyebrowLabel.tsx`

```tsx
import { FC } from 'react';
import { cn } from '@/shared/utils';

export interface EyebrowLabelProps {
  /**
   * Segments to render, joined by a mustard `▪` separator.
   * Example: ['DOSSIER', 'CASE #0042', 'INDRAPUR HQ']
   */
  segments: ReadonlyArray<string>;
  /**
   * Render at a larger 13px size instead of the default 11px.
   */
  large?: boolean;
  className?: string;
}

/**
 * JetBrains Mono all-caps metadata label with mustard dot separators —
 * the signature Bharatvarsh Classified Chronicle eyebrow used above every
 * section headline, in hero meta rows, and on dossier stamps. Semantic text
 * is carried by the segment spans themselves; no `aria-label` is applied
 * since the native text content is already screen-reader friendly and the
 * `▪` separators are marked `aria-hidden`.
 */
export const EyebrowLabel: FC<EyebrowLabelProps> = ({
  segments,
  large = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'font-mono uppercase text-[var(--shadow-text)]',
        large ? 'text-[13px]' : 'text-[11px]',
        'tracking-[0.18em] leading-none flex items-center gap-2 flex-wrap',
        className
      )}
    >
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span
              aria-hidden="true"
              className="text-[var(--mustard-dossier)] text-[10px]"
            >
              ▪
            </span>
          )}
          <span>{segment}</span>
        </span>
      ))}
    </div>
  );
};
```

- [ ] **Step 3: Export from the shared UI barrel**

Edit `src/shared/ui/index.ts`. Append at end of file:

```ts
export { EyebrowLabel } from './EyebrowLabel';
```

- [ ] **Step 4: Typecheck the new component**

Run: `npm run typecheck 2>&1 | tail -10`
Expected: clean exit.

- [ ] **Step 5: Lint the new component**

Run: `npm run lint src/shared/ui/EyebrowLabel.tsx 2>&1 | tail -10`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/shared/ui/EyebrowLabel.tsx src/shared/ui/index.ts
git commit -m "feat(ui): add EyebrowLabel primitive

IBM Plex caps metadata label with mustard ▪ separators — the signature
Bharatvarsh eyebrow used above every section headline and in hero meta rows.
Takes a segments array, renders them joined by mustard dots, supports an
optional large variant."
```

---

## Task 5: Create `DossierDivider` primitive

**Files:**
- Create: `src/shared/ui/DossierDivider.tsx`

- [ ] **Step 1: Verify the file does not exist**

Run: `ls src/shared/ui/DossierDivider.tsx 2>&1`
Expected: `No such file or directory`

- [ ] **Step 2: Write the component**

File: `src/shared/ui/DossierDivider.tsx`

```tsx
import { FC } from 'react';
import { cn } from '@/shared/utils';

interface DossierDividerProps {
  /**
   * Include a small mustard square indicator at the start of the divider.
   */
  withIndicator?: boolean;
  /**
   * Render as dashed instead of solid.
   */
  dashed?: boolean;
  className?: string;
}

/**
 * A 1px Navy Signal border-top divider used in place of full card boxes in
 * high-density layouts — the "border-top only" pattern that defines dossier
 * cards and list rows across the Bharatvarsh redesign.
 */
export const DossierDivider: FC<DossierDividerProps> = ({
  withIndicator = false,
  dashed = false,
  className,
}) => {
  return (
    <div
      role="separator"
      className={cn(
        'w-full flex items-center gap-3',
        className
      )}
    >
      {withIndicator && (
        <span
          aria-hidden="true"
          className="inline-block w-2 h-2 bg-[var(--mustard-dossier)] flex-shrink-0"
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          'flex-1 border-t',
          dashed ? 'border-dashed' : 'border-solid',
          'border-[var(--navy-signal)]'
        )}
      />
    </div>
  );
};
```

- [ ] **Step 3: Export from the shared UI barrel**

Edit `src/shared/ui/index.ts`. Append:

```ts
export { DossierDivider } from './DossierDivider';
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck 2>&1 | tail -5`
Expected: clean.

Run: `npm run lint src/shared/ui/DossierDivider.tsx 2>&1 | tail -5`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/DossierDivider.tsx src/shared/ui/index.ts
git commit -m "feat(ui): add DossierDivider primitive

Thin Navy Signal border-top divider used instead of full card boxes. Supports
an optional mustard square indicator and a dashed variant for the classified
evidence look."
```

---

## Task 6: Create `DocumentStamp` primitive

**Files:**
- Create: `src/shared/ui/DocumentStamp.tsx`

- [ ] **Step 1: Verify the file does not exist**

Run: `ls src/shared/ui/DocumentStamp.tsx 2>&1`
Expected: `No such file or directory`

- [ ] **Step 2: Write the component**

File: `src/shared/ui/DocumentStamp.tsx`

```tsx
import { FC } from 'react';
import { cn } from '@/shared/utils';

interface DocumentStampProps {
  /**
   * Document ID displayed in the stamp, e.g. 'BVR-0001'.
   */
  docId: string;
  /**
   * Revision tag, e.g. 'REV 27' or 'v27'.
   */
  revision: string;
  /**
   * Clearance level, shown as a trailing segment. Omit if not needed.
   */
  clearance?: string;
  /**
   * Optional small rotation in degrees for the "stuck on" look.
   * Defaults to -4.
   */
  rotate?: number;
  className?: string;
}

/**
 * A classified document stamp rendered as a compact, rotated dashed-border
 * sticker. Used in the footer bottom-bar and in the corners of lore/novel
 * modals to reinforce the "leaked dossier" mood.
 *
 * Example:
 *   <DocumentStamp docId="BVR-0001" revision="REV 27" clearance="LVL 4" />
 */
export const DocumentStamp: FC<DocumentStampProps> = ({
  docId,
  revision,
  clearance,
  rotate = -4,
  className,
}) => {
  const segments = clearance ? [docId, revision, clearance] : [docId, revision];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1',
        'border border-dashed border-[var(--mustard-dossier)]',
        'font-mono uppercase text-[10px] tracking-[0.18em]',
        'text-[var(--mustard-dossier)]',
        'select-none pointer-events-none',
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-label={`Document ${segments.join(' revision ')}`}
    >
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-[10px]">
              ▪
            </span>
          )}
          <span>{segment}</span>
        </span>
      ))}
    </div>
  );
};
```

- [ ] **Step 3: Export from the shared UI barrel**

Edit `src/shared/ui/index.ts`. Append:

```ts
export { DocumentStamp } from './DocumentStamp';
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck 2>&1 | tail -5`
Expected: clean.

Run: `npm run lint src/shared/ui/DocumentStamp.tsx 2>&1 | tail -5`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/DocumentStamp.tsx src/shared/ui/index.ts
git commit -m "feat(ui): add DocumentStamp primitive

Small rotated dashed-border classified doc stamp used in the footer bottom
bar and in the top-right corners of lore/novel modals. Takes docId,
revision, optional clearance, renders mustard IBM Plex caps inside a -4°
rotated dashed mustard frame."
```

---

## Task 7: Refresh `Header` — active underline + Devanagari logo mark

**Files:**
- Modify: `src/shared/layout/header.tsx` (lines 66–70 and lines 78–91)

- [ ] **Step 1: Confirm the current active-state uses mustard text**

Run: `sed -n '82,91p' src/shared/layout/header.tsx`
Expected: output shows the block
```
  pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(item.href))
    ? 'text-[var(--mustard-500)]'
    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-800)]'
```

- [ ] **Step 2: Edit the active-state classes — replace mustard text with a 2px mustard underline + IBM Plex mono caps**

In `src/shared/layout/header.tsx`, find this block (inside the `{navItems.map(...)}` loop starting around line 77):

```tsx
<Link
  key={item.href}
  href={item.href}
  className={cn(
    'px-4 py-2 text-sm font-medium transition-colors rounded-lg',
    pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(item.href))
      ? 'text-[var(--mustard-500)]'
      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--obsidian-800)]'
  )}
>
  {item.label}
</Link>
```

Replace with:

```tsx
<Link
  key={item.href}
  href={item.href}
  className={cn(
    'relative px-4 py-2 font-mono uppercase text-[12px] tracking-[0.18em] transition-colors',
    pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(item.href))
      ? 'text-[var(--bone-text)]'
      : 'text-[var(--shadow-text)] hover:text-[var(--bone-text)]'
  )}
>
  {item.label.toUpperCase()}
  {(pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(item.href))) && (
    <span
      aria-hidden="true"
      className="absolute left-4 right-4 bottom-0 h-[2px] bg-[var(--mustard-dossier)]"
    />
  )}
</Link>
```

- [ ] **Step 3: Edit the logo block — add `भा` Devanagari mark**

Still in `src/shared/layout/header.tsx`, find (around line 65–69):

```tsx
<Link href="/" className="flex items-center gap-2 group">
  <span className="font-display text-2xl md:text-3xl tracking-wide text-[var(--powder-300)] group-hover:text-[var(--mustard-500)] transition-colors">
    BHARATVARSH
  </span>
</Link>
```

Replace with:

```tsx
<Link href="/" className="flex items-center gap-2 group" aria-label="Bharatvarsh home">
  <span
    aria-hidden="true"
    className="font-[var(--font-devanagari)] text-2xl md:text-3xl text-[var(--mustard-dossier)] opacity-90 group-hover:opacity-100 transition-opacity"
  >
    भा
  </span>
  <span className="font-display text-2xl md:text-3xl tracking-wide text-[var(--bone-text)] group-hover:text-[var(--mustard-dossier)] transition-colors">
    BHARATVARSH
  </span>
</Link>
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck 2>&1 | tail -10`
Expected: clean.

Run: `npm run lint src/shared/layout/header.tsx 2>&1 | tail -20`
Expected: no errors. If a warning fires about the Devanagari character encoding, verify the file was saved as UTF-8.

- [ ] **Step 5: Visual spot check — start dev server and confirm the header**

Run (foreground): `npm run dev` — open `http://localhost:3000`, visually confirm:
- The logo reads `भा  BHARATVARSH` with the `भा` in mustard
- Nav items render ALL CAPS in monospace, muted shadow color by default
- Active item (e.g. `HOME` on `/`) is bone-white with a 2px mustard underline
- Hovering inactive items lifts them to bone-white with no underline

Kill the dev server with Ctrl+C once verified.

- [ ] **Step 6: Commit**

```bash
git add src/shared/layout/header.tsx
git commit -m "feat(header): adopt Classified Chronicle nav pattern

Nav items render in JetBrains Mono all-caps with 0.18em tracking. Active
state is now a 2px mustard-dossier underline instead of a mustard text
color — matches the Stitch redesign's 'muted rail, single bright cue'
pattern. Adds the Devanagari भा mark beside the BHARATVARSH wordmark
in mustard."
```

---

## Task 8: Refresh `Footer` — IBM Plex caps headings, Devanagari mark, DOC ID stamp

**Files:**
- Modify: `src/shared/layout/footer.tsx`

- [ ] **Step 1: Confirm the current footer uses font-semibold uppercase headings**

Run: `grep -n 'font-semibold.*uppercase' src/shared/layout/footer.tsx`
Expected: 3 matches around lines 64, 83, 102.

- [ ] **Step 2: Update the imports**

In `src/shared/layout/footer.tsx`, replace the imports block (lines 1–6):

```tsx
'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Facebook, Mail } from 'lucide-react';
import { cn } from '@/shared/utils';
```

with:

```tsx
'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Facebook, Mail } from 'lucide-react';
import { cn } from '@/shared/utils';
import { DocumentStamp } from '@/shared/ui/DocumentStamp';
```

- [ ] **Step 3: Update the Brand block — add Devanagari mark**

Find (around lines 46–60):

```tsx
<div className="md:col-span-1">
  <Link href="/" className="inline-block">
    <span className="font-display text-2xl tracking-wide text-[var(--powder-300)]">
      BHARATVARSH
    </span>
  </Link>
  <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed">
    An alternate reality thriller where truth is more dangerous than
    any weapon.
  </p>
  <p className="mt-4 text-sm text-[var(--text-muted)] font-serif italic">
    &ldquo;What would you sacrifice for the truth?&rdquo;
  </p>
</div>
```

Replace with:

```tsx
<div className="md:col-span-1">
  <Link
    href="/"
    className="inline-flex items-center gap-2 group"
    aria-label="Bharatvarsh home"
  >
    <span
      aria-hidden="true"
      className="font-[var(--font-devanagari)] text-2xl text-[var(--mustard-dossier)] opacity-90 group-hover:opacity-100 transition-opacity"
    >
      भा
    </span>
    <span className="font-display text-2xl tracking-wide text-[var(--bone-text)]">
      BHARATVARSH
    </span>
  </Link>
  <p className="mt-4 text-sm text-[var(--steel-text)] leading-relaxed">
    A dystopian chronicle of the subcontinent that wasn&rsquo;t.
  </p>
  <p className="mt-4 text-sm text-[var(--powder-signal)] font-serif italic">
    &ldquo;What would you sacrifice for the truth?&rdquo;
  </p>
</div>
```

- [ ] **Step 4: Update the 3 column headings (Explore / About / Connect) to IBM Plex caps**

Find each of the 3 headings (lines 64, 83, 102). They currently look like:

```tsx
<h4 className="text-sm font-semibold text-[var(--powder-400)] uppercase tracking-wider mb-4">
  Explore
</h4>
```

Replace each with (for Explore):

```tsx
<h4 className="font-mono uppercase text-[11px] tracking-[0.18em] text-[var(--mustard-dossier)] mb-4">
  EXPLORE
</h4>
```

For About:

```tsx
<h4 className="font-mono uppercase text-[11px] tracking-[0.18em] text-[var(--mustard-dossier)] mb-4">
  ABOUT
</h4>
```

For Connect:

```tsx
<h4 className="font-mono uppercase text-[11px] tracking-[0.18em] text-[var(--mustard-dossier)] mb-4">
  CONNECT
</h4>
```

- [ ] **Step 5: Update the bottom bar — replace copyright block with classified DOC stamp layout**

Find the existing bottom bar block (lines 127–145):

```tsx
{/* Bottom Bar */}
<div className="border-t border-[var(--obsidian-700)] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
  <p className="text-xs text-[var(--text-muted)]">
    &copy; {new Date().getFullYear()} Bharatvarsh. All rights reserved.
  </p>
  <div className="flex items-center gap-6">
    <Link
      href="#privacy"
      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
    >
      Privacy Policy
    </Link>
    <Link
      href="#terms"
      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
    >
      Terms of Use
    </Link>
  </div>
</div>
```

Replace with:

```tsx
{/* Bottom Bar */}
<div className="border-t border-[var(--navy-signal)] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
  <p className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--shadow-text)]">
    &copy; {new Date().getFullYear()} BHARATVARSH &nbsp;▪&nbsp; ALL DOSSIERS RESERVED
  </p>
  <div className="flex items-center gap-6">
    <Link
      href="#privacy"
      className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--shadow-text)] hover:text-[var(--bone-text)] transition-colors"
    >
      PRIVACY
    </Link>
    <Link
      href="#terms"
      className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--shadow-text)] hover:text-[var(--bone-text)] transition-colors"
    >
      TERMS
    </Link>
    <DocumentStamp docId="BVR-0001" revision="REV 27" />
  </div>
</div>
```

- [ ] **Step 6: Typecheck + lint**

Run: `npm run typecheck 2>&1 | tail -10`
Expected: clean.

Run: `npm run lint src/shared/layout/footer.tsx 2>&1 | tail -10`
Expected: no errors.

- [ ] **Step 7: Visual spot check**

Run: `npm run dev`
Open any page and scroll to the footer. Verify:
- Brand block shows `भा  BHARATVARSH` with mustard `भा`
- Tagline reads "A dystopian chronicle of the subcontinent that wasn't."
- Three column headings (EXPLORE / ABOUT / CONNECT) render in mustard IBM Plex caps with generous tracking
- Bottom bar shows `© 2026 BHARATVARSH ▪ ALL DOSSIERS RESERVED` on the left and on the right shows PRIVACY, TERMS, and a rotated dashed mustard `BVR-0001 ▪ REV 27` stamp

Kill dev server.

- [ ] **Step 8: Commit**

```bash
git add src/shared/layout/footer.tsx
git commit -m "feat(footer): adopt Classified Chronicle footer layout

Column headings render as IBM Plex caps in mustard-dossier. Brand block
gains the Devanagari भा mark. Bottom bar replaces mixed-case copyright
with monospace 'ALL DOSSIERS RESERVED' and adds the rotated dashed
DocumentStamp (BVR-0001 ▪ REV 27) as a classified marker."
```

---

## Task 9: Final Phase 0 verification

**Files:** (no file changes — verification only)

- [ ] **Step 1: Run the full checks pipeline**

Run: `npm run checks 2>&1 | tail -30`
Expected: typecheck passes, lint passes, build succeeds. Full pipeline clean.

- [ ] **Step 2: Confirm all Phase 0 commits exist**

Run: `git log --oneline main..HEAD`
Expected: at least 8 commits on the `redesign/stitch-2026-04-13` branch:
1. `docs(stitch): add design system + devanagari canon snapshots`
2. `chore: add typecheck + checks npm scripts`
3. `feat(tokens): add Bharatvarsh Classified Chronicle semantic aliases`
4. `feat(ui): add EyebrowLabel primitive`
5. `feat(ui): add DossierDivider primitive`
6. `feat(ui): add DocumentStamp primitive`
7. `feat(header): adopt Classified Chronicle nav pattern`
8. `feat(footer): adopt Classified Chronicle footer layout`

- [ ] **Step 3: Confirm backend files are untouched**

Run: `git diff --name-only main..HEAD`
Expected: only the files listed in "File structure for Phase 0" above. If ANY `prisma/`, `src/app/api/`, `src/server/`, `src/features/auth/`, `src/components/bhoomi/`, `cloudbuild.yaml`, `Dockerfile`, or `next.config.ts` file appears, STOP and investigate before continuing.

- [ ] **Step 4: Spot check the site end-to-end**

Run: `npm run dev` and manually walk through:
- `/` — new header, new footer, page content untouched
- `/novel` — header active state shows `THE NOVEL` underlined
- `/lore` — header active state shows `LORE` underlined
- `/timeline` — header active state shows `TIMELINE` underlined
- `/dispatches` — header active state shows `DISPATCHES` underlined
- `/forum` — header active state shows `FORUM` underlined
- `/bhoomi` — header shows no active item, breadcrumb still usable

Kill dev server.

- [ ] **Step 5: Final branch status report**

Run: `git status -s && echo '---' && git log --oneline main..HEAD | head -15`
Expected: working tree clean, 8+ commits on the branch.

Phase 0 complete — ready to cascade to Phase 1 (Home page port). Write the Phase 1 plan in a separate file under `docs/superpowers/plans/` before starting.

---

## Self-review notes

- **Spec coverage:** Every element of the Stitch design system (tokens, Devanagari, classified stamps, border-top dividers, mustard-underline nav, footer layout) has a task.
- **No placeholders:** Every step contains exact code, exact commands, exact expected output.
- **Type consistency:** `EyebrowLabel` takes `segments: ReadonlyArray<string>`. `DossierDivider` takes `withIndicator`/`dashed`. `DocumentStamp` takes `docId`/`revision`/`clearance`/`rotate`. All consistent across the file.
- **Backend discipline:** Explicit guard in Task 9 Step 3 — stops if any backend/infra file drifts.
- **Out of scope:** Feature content, lore modal, per-page ports are deferred to Phase 1–8 plans.
