# Architecture Decision Records

## ADR-001: Screaming Architecture with Feature Modules

**Status:** Accepted
**Date:** 2025-06-XX (refactor branch)

### Context
The original codebase grouped files by technical role (`components/ui/`, `components/layout/`, `components/features/`, `hooks/`, `lib/`). As the feature set grew (home, novel, lore, timeline, newsletter), navigating related files required jumping across multiple top-level directories.

### Decision
Adopt a "screaming architecture" where top-level folders announce the domain (`features/home/`, `features/lore/`, etc.). Each feature module co-locates its components, hooks, utilities, and types. Shared, truly reusable code lives in `src/shared/`.

### Consequences
- **Positive:** Adding a feature (e.g., forum) means creating one new folder, not scattering files across 5+ directories.
- **Positive:** Deleting a feature means removing one folder.
- **Positive:** Import boundary rules are enforceable by convention (and eventually by linting).
- **Trade-off:** Re-export shims are needed at old import paths during migration.

---

## ADR-002: Barrel Exports as Public API Boundary

**Status:** Accepted
**Date:** 2025-06-XX

### Context
Deep imports (`@/features/lore/components/lore-card`) couple consumers to internal file structure, making renames and restructuring risky.

### Decision
Every feature module and shared directory exposes an `index.ts` barrel. Consumers import from the barrel only:

```typescript
import { LoreCard } from '@/features/lore';
```

### Consequences
- **Positive:** Internal file structure can change without updating consumers.
- **Positive:** Explicit public API per module.
- **Trade-off:** Barrel files must be maintained when components are added/removed.

---

## ADR-003: Server-Only Guards for Backend Modules

**Status:** Accepted
**Date:** 2025-06-XX

### Context
`airtable.ts` and `email.ts` contain API keys and server-side SDK calls. Accidentally importing them in a client component would leak secrets into the browser bundle.

### Decision
All modules in `src/server/` import `'server-only'` at the top. Next.js will throw a build error if any client component transitively imports these files.

### Consequences
- **Positive:** Impossible to accidentally ship server secrets to the client.
- **Positive:** Clear visual signal that a file is server-only.
- **Trade-off:** Requires the `server-only` npm package.

---

## ADR-004: Lazy Initialization for External SDK Clients

**Status:** Accepted
**Date:** 2025-06-XX

### Context
The original `email.ts` created a `new Resend(process.env.RESEND_API_KEY)` at module scope. During `next build`, static generation imports the module but environment variables may not be set, causing the build to fail.

### Decision
External SDK clients are lazy-initialized on first use via a getter function:

```typescript
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(getServerEnv().resend.apiKey);
  }
  return _resend;
}
```

### Consequences
- **Positive:** Build succeeds without env vars (static pages don't call the getter).
- **Positive:** Singleton pattern — client is created once, reused across requests.
- **Trade-off:** Runtime errors are deferred to first API call instead of module load.

---

## ADR-005: Centralized Environment Validation

**Status:** Accepted
**Date:** 2025-06-XX

### Context
Environment variables were accessed via `process.env.X` in multiple files with no validation, leading to cryptic runtime errors when a variable was missing.

### Decision
Create `src/config/env.ts` with a `getServerEnv()` function that validates and returns all required env vars. All server modules import from this single source.

### Consequences
- **Positive:** Missing env vars produce a clear error message with the variable name.
- **Positive:** Single place to add new env vars.
- **Positive:** Type-safe access (returned object has known shape).
- **Trade-off:** Adding a new env var requires updating `env.ts`.

---

## ADR-006: Re-Export Shims for Backward Compatibility

**Status:** Accepted (temporary)
**Date:** 2025-06-XX

### Context
Moving files to new locations breaks all existing imports. Updating every import simultaneously is error-prone, especially if external tools or generated code reference old paths.

### Decision
After moving files, create re-export shims at the old locations that forward to the new paths:

```typescript
// src/components/ui/index.ts (old location)
export * from '@/shared/ui';
```

### Consequences
- **Positive:** Zero-downtime migration — old and new imports both work.
- **Positive:** Can incrementally update consumers.
- **Future:** Remove shims once all imports use new paths (tracked for future cleanup).

---

## ADR-007: Content Layer Abstraction

**Status:** Accepted
**Date:** 2025-06-XX

### Context
Data access was mixed — some components imported JSON directly, others used loader functions from `lib/data.ts`.

### Decision
Centralize all data access in `src/content/loaders.ts`. Raw JSON files live in `src/content/data/`. The loader functions (`getTimelineData()`, `getLoreItems()`, etc.) are the only public API for accessing content.

### Consequences
- **Positive:** Swapping from JSON to a database (Postgres) only requires changing loader implementations.
- **Positive:** Components are decoupled from data storage format.
- **Trade-off:** Adding new content types requires a new loader function.

---

## ADR-008: Import Boundary Rules

**Status:** Accepted
**Date:** 2025-06-XX

### Context
Without clear dependency rules, circular dependencies and tightly coupled modules emerge over time.

### Decision
Enforce the following import boundaries:

| Module | May Import | Must Not Import |
|--------|-----------|----------------|
| `shared/` | `types/` | `features/`, `server/`, `app/` |
| `features/` | `shared/`, `content/`, `types/` | other `features/`, `server/`, `app/` |
| `server/` | `config/` | `shared/`, `features/`, `app/` |
| `app/` | `features/`, `shared/`, `lib/` | `server/` (except in API routes) |
| `content/` | `types/` | everything else |
| `config/` | nothing | everything |

### Consequences
- **Positive:** Prevents circular dependencies and accidental coupling.
- **Positive:** Each layer has a clear responsibility.
- **Future:** Can be enforced with ESLint `import/no-restricted-paths` or `eslint-plugin-boundaries`.

---

## ADR-009: Path Aliases

**Status:** Accepted
**Date:** 2025-06-XX

### Context
Relative imports like `../../../shared/ui/button` are fragile and hard to read.

### Decision
Configure TypeScript path aliases in `tsconfig.json`:

```json
{
  "@/*": ["./src/*"],
  "@/features/*": ["./src/features/*"],
  "@/shared/*": ["./src/shared/*"],
  "@/server/*": ["./src/server/*"],
  "@/content/*": ["./src/content/*"],
  "@/config/*": ["./src/config/*"]
}
```

### Consequences
- **Positive:** Clean, self-documenting imports (`@/features/lore`).
- **Positive:** Moving files within a module doesn't break external imports (via barrels).
- **Trade-off:** IDE/tooling must support `tsconfig.json` paths (all modern editors do).

---

## ADR-010: Prisma as Forum ORM

**Status:** Accepted
**Date:** 2026-02-13

### Context
The Bharatvarsh website needs a database layer for the forum feature. The project currently has no database — all data is static JSON or external (Airtable). Two primary ORM options were evaluated: Prisma and Drizzle.

### Decision
Use Prisma ORM for database access.

### Justification
- Declarative schema with migration system provides safe incremental schema evolution.
- Type-safe client generation (auto-complete, zero `any`) aligns with the repo's strict TypeScript mode.
- Best-documented ORM for Next.js + Cloud SQL; mature Auth.js adapter (`@auth/prisma-adapter`).
- Migration workflow and adapter ecosystem reduce Phase 1 risk for a repo that has never had a DB.

### Consequences
- **Positive:** Auto-generated types from schema — no manual type sync.
- **Positive:** Built-in migration system with dev/deploy workflows.
- **Positive:** First-class Auth.js adapter for session management.
- **Trade-off:** Prisma client adds ~2MB to bundle (mitigated by server-only usage).
- **Trade-off:** Slightly less SQL control than Drizzle for complex queries.

---

## ADR-011: Auth.js v5 with DB Sessions

**Status:** Accepted
**Date:** 2026-02-13

### Context
The forum requires user authentication with role-based access control (visitor/member/moderator/admin). No auth system currently exists in the project.

### Decision
Use Auth.js v5 (NextAuth) with database-backed sessions stored in Postgres via the Prisma adapter.

### Justification
- De facto standard for Next.js authentication with deep App Router integration.
- DB-backed sessions (not JWT) allow instant session revocation for moderation (banning).
- Email magic-link auth reuses the existing Resend integration.
- OAuth providers (Google, GitHub) can be added incrementally.

### Consequences
- **Positive:** Session revocation enables real-time ban enforcement.
- **Positive:** CSRF protection built-in.
- **Positive:** Reuses existing Resend email infrastructure for magic links.
- **Trade-off:** Requires Node.js runtime (not Edge) for all forum routes due to Prisma/pg dependency.
- **Trade-off:** DB session lookup on every request adds ~5ms latency.

---

## ADR-012: Cloud SQL Built-in Connector for Demo

**Status:** Accepted
**Date:** 2026-02-13

### Context
Cloud Run needs to connect to Cloud SQL (Postgres). Options: (1) built-in Cloud Run connector via Unix socket, (2) Cloud SQL Auth Proxy sidecar, (3) VPC Connector + private IP.

### Decision
Use Cloud Run's built-in Cloud SQL connection (Unix socket proxy) for the demo phase.

### Justification
- Simplest setup: single checkbox in Cloud Run configuration.
- No additional infrastructure (no VPC connector, no sidecar container).
- Works with Prisma out of the box via `?host=/cloudsql/PROJECT:REGION:INSTANCE` in DATABASE_URL.

### Consequences
- **Positive:** Zero additional infra to manage.
- **Positive:** Automatic TLS encryption on the proxy connection.
- **Trade-off:** Public IP on Cloud SQL instance (acceptable for demo).
- **Future:** Phase 7 hardens with Private IP + Serverless VPC Connector.

---

## ADR-013: Gemini 1.5 Flash for Content Moderation

**Status:** Accepted
**Date:** 2026-02-13

### Context
Forum content needs pre-publication screening for spam, hate speech, harassment, and PII. Options evaluated: (1) Vertex AI Gemini, (2) Perspective API, (3) OpenAI moderation endpoint.

### Decision
Use Gemini 1.5 Flash via Vertex AI for AI content moderation.

### Justification
- Runs on GCP (same cloud as deployment) — no cross-cloud latency or egress costs.
- Flash model is fast (~500ms) and cheap for moderation tasks.
- Customisable system prompt allows forum-specific context (literary discussion of violence is OK).
- Single vendor for infra + AI simplifies billing and access management.

### Consequences
- **Positive:** Low latency from same-cloud deployment.
- **Positive:** Customisable moderation rules via system prompt.
- **Positive:** Structured JSON output for programmatic decisions.
- **Trade-off:** Requires GCP credentials and Vertex AI API enablement.
- **Trade-off:** AI decisions need human-in-the-loop override (Phase 5).

---

## ADR-014: Zod for API Validation

**Status:** Accepted
**Date:** 2026-02-13

### Context
Current API routes use manual `if (!field)` validation checks. The forum will have many endpoints with complex payloads that need consistent validation.

### Decision
Use Zod for schema-based validation on all forum API endpoints.

### Justification
- Type-safe schemas that infer TypeScript types — single source of truth.
- Composable schemas (e.g., `threadCreateSchema.extend(...)` for edit).
- Rich error messages with field-level detail.
- Zero dependencies, small bundle size.

### Consequences
- **Positive:** Consistent error format across all endpoints.
- **Positive:** TypeScript types derived from schemas — no type/validation drift.
- **Positive:** Reusable schemas for client-side validation.
- **Trade-off:** New dependency (though very lightweight at ~13KB).

---

## ADR-015: Soft-Delete Strategy for Forum Content

**Status:** Accepted
**Date:** 2026-02-13

### Context
Forum content (threads, posts) needs a deletion strategy that supports moderation review, undo, and audit trails.

### Decision
Use soft-delete (`deletedAt` timestamp column) for threads and posts. Hard-delete is deferred to a scheduled cleanup job that runs after a 90-day retention period.

### Justification
- Moderators can review deleted content for abuse pattern detection.
- Authors can potentially recover accidentally deleted content (future feature).
- Audit logs reference content that may have been deleted — soft-delete preserves referential integrity.
- GDPR hard-delete can be triggered manually when needed.

### Consequences
- **Positive:** Complete audit trail preserved.
- **Positive:** Moderation can review deleted content.
- **Positive:** No orphaned references in audit logs or reports.
- **Trade-off:** All queries must filter `WHERE deletedAt IS NULL` (handled by Prisma middleware or default scope).
- **Trade-off:** Storage grows until cleanup job runs.
