# Architecture

## High-Level Overview

```
src/
├── app/              Route shell (Next.js App Router)
├── features/         Domain modules (screaming architecture)
├── shared/           Reusable UI, hooks, utilities
├── server/           Server-only integrations (Airtable, Resend)
├── content/          Static data + loaders
├── lib/              Third-party wrappers (metadata)
├── config/           Environment validation
└── types/            Global TypeScript types
```

### Request Flow

```
Browser → app/page.tsx (metadata + layout)
              ↓
         features/*/Content.tsx (page composition)
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
shared/ui  shared/hooks  content/loaders
    ↓
(render)

API Routes → app/api/* → server/{airtable,email} → config/env
```

## Folder Responsibilities

### `src/app/`
Next.js App Router. Each `page.tsx` is a thin shell:
- Exports metadata (SEO)
- Imports and renders a `<*Content />` component from the corresponding feature module
- No business logic, no component definitions

### `src/features/`
Domain-grouped modules. Each feature owns its components, hooks, utilities, and types:

| Feature | Contents | Route |
|---------|----------|-------|
| `home/` | Hero, scroll sections, CTA, HomeContent | `/` |
| `novel/` | Novel page composition, NovelContent | `/novel` |
| `lore/` | Cards, filters, hero, modal, LoreContent | `/lore` |
| `timeline/` | Horizontal/vertical timelines, hooks, calculations | `/timeline` |
| `newsletter/` | Dossier lead-magnet form, cards, download | Used on `/novel` |

Each feature has:
- `components/` — React components scoped to this feature
- `hooks/` — Feature-specific hooks (optional)
- `utils/` — Feature-specific utilities (optional)
- `index.ts` — Barrel export (public API for the feature)

### `src/shared/`
Truly reusable code. **Must never import from `features/`.**

| Subdirectory | Contents |
|---|---|
| `ui/` | Button, Badge, Card, ResponsiveImage, ErrorBoundary, atmospheric effects (ParticleField, FilmGrain, etc.) |
| `layout/` | Header, Footer, LayoutProvider, AtmosphericProvider, TransitionProvider |
| `hooks/` | useMediaQuery, useDeviceCapability, useAdaptiveAnimations |
| `utils/` | `cn()`, formatters, slugify, debounce |

### `src/server/`
Server-only modules. Import `'server-only'` at top of each file to prevent client-side bundling.

- `airtable.ts` — Airtable CRUD for lead management
- `email.ts` — Resend email client (lazy-initialized)

### `src/content/`
Static data layer:
- `data/` — JSON files (timeline, lore-items, novel, characters, factions, locations, scrollytelling) + timeline-phases.ts
- `loaders.ts` — Async/sync data access functions (designed for future DB swap)
- `index.ts` — Barrel export

### `src/config/`
- `env.ts` — Centralized environment variable validation via `getServerEnv()`

### `src/lib/`
Thin wrappers around third-party concerns:
- `metadata.ts` — SEO metadata generator (`createPageMetadata()`)

### `src/types/`
Global TypeScript type definitions shared across the entire application.

## Import Boundary Rules

```
shared/    → NEVER imports from features/, server/, or app/
features/  → MAY import from shared/, content/, types/
           → NEVER imports from other features/
server/    → MAY import from config/
           → NEVER imports from shared/, features/, or app/
app/       → MAY import from features/, shared/, lib/
content/   → MAY import from types/
config/    → Standalone, no intra-project imports
```

## Key Conventions

### Barrel Exports
Every feature module and shared directory has an `index.ts` that defines its public API. Consumers import from the barrel, not from internal files:

```typescript
// Good
import { LoreCard } from '@/features/lore';

// Avoid
import { LoreCard } from '@/features/lore/components/lore-card';
```

### Server-Only Guard
All server modules use `import 'server-only'` to prevent accidental client-side imports.

### Lazy Initialization
External SDK clients (Resend) are lazy-initialized on first use, not at module scope. This prevents build failures when env vars are absent during static generation.

### Path Aliases
```json
{
  "@/*":         "./src/*",
  "@/features/*": "./src/features/*",
  "@/shared/*":  "./src/shared/*",
  "@/server/*":  "./src/server/*",
  "@/content/*": "./src/content/*",
  "@/config/*":  "./src/config/*"
}
```

## Future Forum Readiness Notes

The modular structure is designed to accommodate a forum feature with Postgres:

1. **New feature module**: Create `src/features/forum/` with its own components, hooks, types
2. **Database layer**: Add `src/server/db.ts` (Prisma/Drizzle client) alongside existing airtable/email modules
3. **Content migration**: The `src/content/loaders.ts` abstraction means swapping JSON → DB queries is localized to one file per data type
4. **API routes**: Add `src/app/api/forum/` routes that import from `src/server/`
5. **Auth**: Add `src/server/auth.ts` and `src/features/auth/` when user accounts are needed
6. **Shared types**: Forum-specific types go in `src/features/forum/types.ts`; shared types (like User) go in `src/types/`

No structural changes are needed — the current architecture directly supports adding these modules.
