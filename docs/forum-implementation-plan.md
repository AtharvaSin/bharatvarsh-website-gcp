# Forum Service — Phase-Wise Implementation Plan

> **Document type:** Implementation plan (no code changes)
> **Target:** Bharatvarsh Next.js website — `bharatvarsh-website-main-gcp`
> **Deployment:** Cloud Run + Cloud SQL (Postgres) on GCP
> **AI Services:** Vertex AI (Gemini)
> **Date:** 2026-02-13

---

## Table of Contents

1. [Alignment Summary (Repo Analysis)](#1-alignment-summary)
2. [Target Forum Architecture](#2-target-forum-architecture)
   - [A — Authentication](#a-authentication)
   - [B — Database + ORM](#b-database--orm)
   - [C — API Surface](#c-api-surface)
   - [D — UI/UX Scope](#d-uiux-scope)
   - [E — AI Capabilities (Vertex AI)](#e-ai-capabilities-vertex-ai)
   - [F — Metrics & Observability](#f-metrics--observability)
3. [GCP Deployment Plan](#3-gcp-deployment-plan)
4. [Phase-Wise Implementation Roadmap](#4-phase-wise-implementation-roadmap)
   - [Phase 0 — Design Spikes + Decision Locks](#phase-0--design-spikes--decision-locks)
   - [Phase 1 — DB + ORM Scaffolding](#phase-1--db--orm-scaffolding--migrations--local-dev-postgres)
   - [Phase 2 — Auth + RBAC](#phase-2--auth--rbac--protected-routes)
   - [Phase 3 — Core Forum](#phase-3--core-forum-threadsposts--basic-ui--pagination)
   - [Phase 4 — Moderation](#phase-4--moderation-reporting--admin-queue--audit-logs)
   - [Phase 5 — AI Moderation/Enrichment](#phase-5--ai-moderationenrichment-vertex-ai--hil-controls)
   - [Phase 6 — Metrics + Observability](#phase-6--metrics--observability--rate-limiting--caching)
   - [Phase 7 — Hardening](#phase-7--hardening-for-business-grade)

---

## 1. Alignment Summary

### Current Architecture Map

- **Framework:** Next.js 16.1.1 with **App Router** (`src/app/`), React 19.2.3, TypeScript 5 (strict mode). Package manager: **npm** (package-lock.json present).
- **Feature modularity:** Screaming architecture — `src/features/{home,novel,lore,timeline,newsletter}/` each co-locating components, hooks, utils, and barrel `index.ts`. Shared code in `src/shared/{ui,layout,hooks,utils}/`. Server code in `src/server/`. Content (static JSON) in `src/content/`.
- **API patterns:** Next.js Route Handlers in `src/app/api/leads/route.ts` (POST) and `src/app/api/leads/verify/route.ts` (GET). Server modules import `'server-only'` and are isolated in `src/server/`. Env validation centralised in `src/config/env.ts` via `getServerEnv()`.
- **Existing integrations:** Lead capture (Airtable), email verification (Resend), Toaster (Sonner), framer-motion animations, Radix UI primitives, Tailwind v4 + `@tailwindcss/postcss`, lucide-react icons. Metadata via `src/lib/metadata.ts`.
- **Import boundaries (ADR-008):** `shared → never features/server/app`, `features → shared/content/types`, `server → config only`, `app → features/shared/lib`. Legacy re-export shims in `src/components/` and `src/hooks/` forward to new locations.
- **Path aliases:** `@/*`, `@/features/*`, `@/shared/*`, `@/server/*`, `@/content/*`, `@/config/*` defined in `tsconfig.json`.

### Conventions the Forum Must Follow

| Convention | How forum adopts it |
|---|---|
| Feature module pattern | New `src/features/forum/` with `components/`, `hooks/`, `types.ts`, `index.ts` barrel |
| Server-only guard | All DB/auth/AI modules in `src/server/` with `import 'server-only'` |
| Lazy initialization | DB client and Vertex AI client use getter-function singletons (ADR-004) |
| Centralised env validation | Extend `src/config/env.ts` with `database`, `auth`, `vertexAi` sections |
| Barrel exports | Consumers import from `@/features/forum`, not deep paths |
| Import boundaries | Forum feature imports from `@/shared/*`, `@/types`, never from other features |
| `cn()` utility | All conditional Tailwind classes use `cn()` from `@/shared/utils` |
| Thin page shells | `src/app/forum/page.tsx` exports metadata + renders `<ForumContent />` |
| Metadata pattern | Add `forum` entry to `pageMetadata` in `src/lib/metadata.ts` via `createPageMetadata()` |
| Design system | Use existing CSS custom properties (`--obsidian-*`, `--navy-*`, `--mustard-*`, `--powder-*`, etc.) from `globals.css` |

### Gaps That Affect Forum Design

| Gap | Impact | Resolution |
|---|---|---|
| **No authentication** | No user accounts, sessions, or roles exist. Forum requires auth. | Add Auth.js (NextAuth v5) with email magic-link + optional OAuth providers. DB-backed sessions in Postgres. |
| **No database** | All data is static JSON or external (Airtable). No Postgres, no ORM. | Add Prisma ORM + Cloud SQL Postgres. Content loaders abstraction (ADR-007) already designed for this swap. |
| **No validation library** | API routes use manual `if (!field)` checks. | Add `zod` for schema-based validation on all forum endpoints. |
| **No rate limiting** | API routes have no rate limiting or abuse prevention. | Add middleware-based rate limiting (e.g., `@upstash/ratelimit` or in-memory token bucket for demo, Redis for prod). |
| **No test setup** | No test framework configured (no vitest/jest in deps or scripts). | Add Vitest + @testing-library/react for unit/integration; Playwright for e2e. |
| **No CI/CD** | No Dockerfile, no Cloud Build config, no GitHub Actions. | Add as part of GCP deployment plan (Phase 0/1). |
| **No middleware** | No `middleware.ts` for route-level auth guards. | Add Next.js middleware for session checks on `/forum/*` protected routes. |

---

## 2. Target Forum Architecture

### Module Layout

```
src/
├── app/
│   ├── forum/                          # Forum route group
│   │   ├── layout.tsx                  # Forum layout (sidebar nav, auth gate)
│   │   ├── page.tsx                    # /forum — Home (topic listing)
│   │   ├── topic/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # /forum/topic/[slug] — Thread listing
│   │   ├── thread/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # /forum/thread/[id] — Thread detail + comments
│   │   ├── new/
│   │   │   └── page.tsx                # /forum/new — Create thread
│   │   ├── me/
│   │   │   └── page.tsx                # /forum/me — User profile + activity
│   │   └── moderation/
│   │       └── page.tsx                # /forum/moderation — Mod queue (role-gated)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts            # Auth.js catch-all handler
│   │   └── forum/
│   │       ├── threads/
│   │       │   └── route.ts            # GET (list), POST (create)
│   │       ├── threads/[id]/
│   │       │   └── route.ts            # GET (detail), PATCH (edit), DELETE
│   │       ├── threads/[id]/posts/
│   │       │   └── route.ts            # GET (list posts), POST (reply)
│   │       ├── threads/[id]/reactions/
│   │       │   └── route.ts            # POST (react), DELETE (un-react)
│   │       ├── posts/[id]/
│   │       │   └── route.ts            # PATCH (edit), DELETE
│   │       ├── topics/
│   │       │   └── route.ts            # GET (list), POST (create — admin)
│   │       ├── reports/
│   │       │   └── route.ts            # GET (mod queue), POST (report content)
│   │       ├── reports/[id]/
│   │       │   └── route.ts            # PATCH (resolve)
│   │       ├── moderation/
│   │       │   └── route.ts            # GET (audit log), POST (action)
│   │       └── users/
│   │           └── [id]/
│   │               └── route.ts        # GET (profile), PATCH (role — admin)
├── features/
│   ├── forum/                          # Forum domain module
│   │   ├── components/
│   │   │   ├── thread-list.tsx
│   │   │   ├── thread-card.tsx
│   │   │   ├── thread-detail.tsx
│   │   │   ├── thread-form.tsx
│   │   │   ├── post-list.tsx
│   │   │   ├── post-card.tsx
│   │   │   ├── post-editor.tsx
│   │   │   ├── topic-nav.tsx
│   │   │   ├── topic-badge.tsx
│   │   │   ├── reaction-bar.tsx
│   │   │   ├── report-dialog.tsx
│   │   │   ├── user-avatar.tsx
│   │   │   ├── user-badge.tsx
│   │   │   ├── pagination-controls.tsx
│   │   │   └── mod-queue.tsx
│   │   ├── hooks/
│   │   │   ├── use-threads.ts
│   │   │   ├── use-thread.ts
│   │   │   ├── use-posts.ts
│   │   │   ├── use-topics.ts
│   │   │   ├── use-reactions.ts
│   │   │   └── use-forum-auth.ts
│   │   ├── types.ts                    # Forum-specific types
│   │   ├── constants.ts                # Limits, pagination defaults, topic slugs
│   │   ├── ForumContent.tsx            # Forum home composition
│   │   ├── TopicContent.tsx            # Topic page composition
│   │   ├── ThreadContent.tsx           # Thread detail composition
│   │   ├── NewThreadContent.tsx        # Create thread composition
│   │   ├── ProfileContent.tsx          # User profile composition
│   │   ├── ModerationContent.tsx       # Mod queue composition
│   │   └── index.ts                    # Barrel export
│   └── auth/                           # Auth domain module
│       ├── components/
│       │   ├── sign-in-button.tsx
│       │   ├── sign-out-button.tsx
│       │   ├── auth-guard.tsx
│       │   └── role-gate.tsx
│       ├── hooks/
│       │   └── use-session.ts
│       ├── types.ts
│       └── index.ts
├── server/
│   ├── db.ts                           # Prisma client (lazy-init, server-only)
│   ├── auth.ts                         # Auth.js config (providers, callbacks, session strategy)
│   ├── moderation.ts                   # Content moderation business logic
│   ├── ai/
│   │   ├── vertex-client.ts            # Vertex AI Gemini client (lazy-init)
│   │   ├── content-check.ts            # Pre-publication content analysis
│   │   ├── auto-tagger.ts              # Auto-tagging + summarisation
│   │   └── toxicity.ts                 # Toxicity/spam detection
│   └── jobs/
│       └── cleanup.ts                  # Scheduled: soft-delete expiry, session cleanup
├── shared/
│   └── ui/
│       ├── textarea.tsx                # New: rich text area for forum posts
│       ├── avatar.tsx                  # New: user avatar component
│       ├── dropdown-menu.tsx           # New: action menus
│       ├── tabs.tsx                    # New: topic tabs
│       ├── skeleton.tsx                # New: loading skeletons
│       └── dialog.tsx                  # Existing: Radix dialog (already present)
├── config/
│   └── env.ts                          # Extended with database, auth, vertexAi sections
│   └── feature-flags.ts               # New: forum feature flags + limits
└── types/
    └── index.ts                        # Extended with User, Session shared types
```

---

### A. Authentication

#### Approach: Auth.js v5 (NextAuth) with DB Sessions

**Justification:**
- Auth.js is the de facto standard for Next.js auth; deep integration with App Router.
- DB-backed sessions (not JWT) allow instant session revocation (mod/admin banning).
- Magic-link email auth reuses the existing Resend integration for sending.
- OAuth (Google, GitHub) can be added incrementally for convenience.

**Runtime constraint:** Auth.js session + Prisma/pg queries require **Node.js runtime**. All `src/app/forum/` routes and `src/app/api/auth/` must set:
```typescript
export const runtime = 'nodejs'; // explicit, not 'edge'
```
This prevents Next.js from attempting Edge Runtime for DB-backed pages.

**RBAC Model:**

| Role | Capabilities |
|---|---|
| `visitor` | Browse threads/topics (read-only). No posting or reacting. |
| `member` | Everything visitor can + create threads, reply, react, edit/delete own content, report. |
| `moderator` | Everything member can + view mod queue, approve/remove content, issue warnings, temp-ban. |
| `admin` | Everything moderator can + role assignment, topic management, system settings, permanent ban, audit log. |

**Session shape (stored in Postgres):**
```
sessions table:
  id, sessionToken, userId, expiresAt

users table:
  id, name, email, emailVerified, image, role (enum: visitor/member/moderator/admin),
  bannedAt, bannedUntil, bannedReason, createdAt, updatedAt
```

**Implementation notes:**
- Default role on sign-up: `member` (auto-promotes from `visitor` on email verification).
- Session expiry: 30 days (configurable).
- CSRF protection: Auth.js built-in.
- Middleware: `src/middleware.ts` protects `/forum/new`, `/forum/me`, `/forum/moderation` routes; allows read-only access to `/forum`, `/forum/topic/*`, `/forum/thread/*` for visitors.

---

### B. Database + ORM

#### Choice: Prisma ORM

**Justification:**
- Prisma's declarative schema + migration system provides the safest path for incremental schema evolution.
- Type-safe client generation (auto-complete, zero `any`) aligns with the repo's strict TypeScript mode.
- Prisma is the most documented ORM for Next.js + Cloud SQL; extensive Auth.js adapter exists (`@auth/prisma-adapter`).
- Drizzle would be equally valid technically, but Prisma's migration workflow and adapter ecosystem reduce Phase 1 risk for a team that has never had a DB in this repo.

#### Proposed Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AUTH.JS MODELS ──────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(MEMBER)
  bio           String?
  bannedAt      DateTime?
  bannedUntil   DateTime?
  bannedReason  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Auth relations
  accounts Account[]
  sessions Session[]

  // Forum relations
  threads          Thread[]
  posts            Post[]
  reactions        Reaction[]
  reportsFiled     Report[]          @relation("ReportFiler")
  reportsResolved  Report[]          @relation("ReportResolver")
  moderationActions ModerationAction[] @relation("ModeratorActions")
  auditLogs        AuditLog[]

  @@index([email])
  @@index([role])
}

enum UserRole {
  VISITOR
  MEMBER
  MODERATOR
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── FORUM MODELS ────────────────────────────────────────────

model Topic {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?  // lucide-react icon name
  color       String?  // CSS custom property name (e.g., "--mustard-500")
  sortOrder   Int      @default(0)
  isLocked    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  threads     Thread[]
  threadTags  ThreadTag[]

  @@index([slug])
}

model Thread {
  id          String       @id @default(cuid())
  title       String
  slug        String       @unique
  body        String       @db.Text
  bodyHtml    String?      @db.Text  // Pre-rendered HTML for SSR
  excerpt     String?      // AI-generated summary (≤200 chars)
  isPinned    Boolean      @default(false)
  isLocked    Boolean      @default(false)
  viewCount   Int          @default(0)
  status      ContentStatus @default(PUBLISHED)
  aiCheckResult AiCheckResult? @default(PASS)

  authorId    String
  author      User         @relation(fields: [authorId], references: [id])

  posts       Post[]
  reactions   Reaction[]
  reports     Report[]
  tags        ThreadTag[]

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?    // Soft delete

  @@index([authorId])
  @@index([status, createdAt(sort: Desc)])
  @@index([slug])
  @@index([deletedAt])
}

model ThreadTag {
  threadId String
  topicId  String

  thread   Thread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  topic    Topic  @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@id([threadId, topicId])
}

model Post {
  id          String       @id @default(cuid())
  body        String       @db.Text
  bodyHtml    String?      @db.Text
  status      ContentStatus @default(PUBLISHED)
  aiCheckResult AiCheckResult? @default(PASS)

  authorId    String
  author      User         @relation(fields: [authorId], references: [id])

  threadId    String
  thread      Thread       @relation(fields: [threadId], references: [id], onDelete: Cascade)

  parentId    String?      // For nested replies
  parent      Post?        @relation("PostReplies", fields: [parentId], references: [id])
  replies     Post[]       @relation("PostReplies")

  reactions   Reaction[]
  reports     Report[]

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?    // Soft delete

  @@index([threadId, createdAt])
  @@index([authorId])
  @@index([parentId])
  @@index([deletedAt])
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  QUARANTINED  // AI flagged — awaiting human review
  REMOVED      // Moderator removed
  DELETED      // Author deleted (soft delete)
}

enum AiCheckResult {
  PASS
  FLAGGED
  BLOCKED
  SKIPPED
}

model Reaction {
  id       String       @id @default(cuid())
  type     ReactionType
  userId   String
  user     User         @relation(fields: [userId], references: [id])

  threadId String?
  thread   Thread?      @relation(fields: [threadId], references: [id], onDelete: Cascade)
  postId   String?
  post     Post?        @relation(fields: [postId], references: [id], onDelete: Cascade)

  createdAt DateTime    @default(now())

  @@unique([userId, threadId, type])
  @@unique([userId, postId, type])
  @@index([threadId])
  @@index([postId])
}

enum ReactionType {
  UPVOTE
  DOWNVOTE
  INSIGHTFUL
  FLAME       // Thematic — "This is fire" 🔥
}

model Report {
  id          String       @id @default(cuid())
  reason      ReportReason
  description String?      @db.Text
  status      ReportStatus @default(OPEN)

  filerId     String
  filer       User         @relation("ReportFiler", fields: [filerId], references: [id])

  resolverId  String?
  resolver    User?        @relation("ReportResolver", fields: [resolverId], references: [id])
  resolution  String?      @db.Text

  threadId    String?
  thread      Thread?      @relation(fields: [threadId], references: [id])
  postId      String?
  post        Post?        @relation(fields: [postId], references: [id])

  createdAt   DateTime     @default(now())
  resolvedAt  DateTime?

  @@index([status, createdAt])
  @@index([filerId])
  @@index([threadId])
  @@index([postId])
}

enum ReportReason {
  SPAM
  HARASSMENT
  HATE_SPEECH
  MISINFORMATION
  OFF_TOPIC
  SPOILERS
  OTHER
}

enum ReportStatus {
  OPEN
  IN_REVIEW
  RESOLVED_REMOVED
  RESOLVED_DISMISSED
  RESOLVED_WARNED
}

model ModerationAction {
  id          String           @id @default(cuid())
  action      ModActionType
  reason      String           @db.Text
  metadata    Json?            // Flexible data (ban duration, AI scores, etc.)

  moderatorId String
  moderator   User             @relation("ModeratorActions", fields: [moderatorId], references: [id])

  targetUserId String?
  targetThreadId String?
  targetPostId   String?

  createdAt   DateTime         @default(now())

  @@index([moderatorId])
  @@index([targetUserId])
  @@index([createdAt(sort: Desc)])
}

enum ModActionType {
  REMOVE_CONTENT
  APPROVE_CONTENT
  WARN_USER
  TEMP_BAN
  PERM_BAN
  UNBAN
  LOCK_THREAD
  UNLOCK_THREAD
  PIN_THREAD
  UNPIN_THREAD
  ROLE_CHANGE
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String   // e.g., "thread.create", "post.edit", "user.ban"
  entityType String  // "thread", "post", "user", "report"
  entityId  String
  changes   Json?    // { before: {...}, after: {...} }
  ipAddress String?
  userAgent String?

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([userId, createdAt(sort: Desc)])
  @@index([entityType, entityId])
  @@index([action, createdAt(sort: Desc)])
}
```

#### Data Retention & Soft-Delete Strategy

| Entity | Soft-delete? | Retention | Hard-delete policy |
|---|---|---|---|
| Threads | Yes (`deletedAt`) | 90 days after soft-delete | Scheduled cleanup job purges after 90d |
| Posts | Yes (`deletedAt`) | 90 days | Same |
| Users | No (account deactivation via `bannedAt`) | Indefinite | Manual GDPR request → hard delete with cascade |
| Reports | No | 1 year | Archive to cold storage after 1y |
| Audit logs | No | 2 years minimum | Never auto-deleted; archive after 2y |
| Sessions | No | Auto-expire (30d) | Prisma adapter handles cleanup |

---

### C. API Surface

All endpoints live under `src/app/api/forum/`. Every mutation requires authentication. Admin/moderator endpoints require role checks.

#### Validation Strategy
- All request bodies validated with **zod** schemas defined in `src/features/forum/types.ts` and imported by route handlers.
- Consistent error model across all endpoints.

#### Error Model
```typescript
interface ApiError {
  error: string;          // Human-readable message
  code: string;           // Machine-readable code (e.g., "FORBIDDEN", "VALIDATION_ERROR")
  details?: ZodIssue[];   // Validation errors (optional)
}
```

#### Rate Limiting Strategy
| Endpoint type | Limit (per user) |
|---|---|
| Read (GET) | 60 req/min |
| Create (POST thread/post) | 10 req/min |
| React | 30 req/min |
| Report | 5 req/min |
| AI endpoints | 5 req/min |
| Admin/mod | 30 req/min |

#### Endpoint Definitions

##### Threads

**`GET /api/forum/threads`** — List threads
- Query: `?topicSlug=&page=1&limit=20&sort=latest|popular|unanswered`
- Auth: None (public read)
- Response: `{ data: Thread[], pagination: { page, limit, total, totalPages } }`
- Notes: Excludes soft-deleted and QUARANTINED threads for non-moderators.

**`POST /api/forum/threads`** — Create thread
- Auth: `member+`
- Body: `{ title: string (3-200 chars), body: string (10-50000 chars), topicSlugs: string[] (1-3) }`
- Validation: zod schema; title profanity check; body length.
- Pre-publish: AI content check (pass → publish; flagged → quarantine; blocked → reject).
- Response: `{ data: Thread }` (201)
- Audit: `thread.create`

**`GET /api/forum/threads/[id]`** — Thread detail
- Auth: None (public)
- Response: `{ data: Thread & { author: UserPublic, tags: Topic[], reactionCounts: {...}, postCount: number } }`
- Side effect: Increment `viewCount`.

**`PATCH /api/forum/threads/[id]`** — Edit thread
- Auth: Author only (or `moderator+` for title edits)
- Body: `{ title?: string, body?: string }`
- Validation: Same as create.
- Re-runs AI check on body change.
- Response: `{ data: Thread }`
- Audit: `thread.edit` with before/after diff.

**`DELETE /api/forum/threads/[id]`** — Soft-delete thread
- Auth: Author or `moderator+`
- Response: `{ success: true }`
- Sets `deletedAt` and `status = DELETED`.
- Audit: `thread.delete`

##### Posts (Replies)

**`GET /api/forum/threads/[id]/posts`** — List posts in thread
- Query: `?page=1&limit=30&sort=oldest|newest`
- Auth: None (public)
- Response: `{ data: Post[], pagination: {...} }`

**`POST /api/forum/threads/[id]/posts`** — Create reply
- Auth: `member+`
- Body: `{ body: string (1-20000 chars), parentId?: string }`
- Pre-publish: AI content check.
- Response: `{ data: Post }` (201)
- Audit: `post.create`

**`PATCH /api/forum/posts/[id]`** — Edit post
- Auth: Author only
- Body: `{ body: string }`
- Re-runs AI check.
- Response: `{ data: Post }`
- Audit: `post.edit`

**`DELETE /api/forum/posts/[id]`** — Soft-delete post
- Auth: Author or `moderator+`
- Response: `{ success: true }`
- Audit: `post.delete`

##### Reactions

**`POST /api/forum/threads/[id]/reactions`** — React to thread
- Auth: `member+`
- Body: `{ type: "UPVOTE" | "DOWNVOTE" | "INSIGHTFUL" | "FLAME" }`
- Toggle: If same reaction exists, removes it. If different reaction of same polarity exists, replaces it.
- Response: `{ data: { type, count } }`
- No audit (high frequency).

**`DELETE /api/forum/threads/[id]/reactions`** — Remove reaction
- Auth: `member+`
- Body: `{ type: ReactionType }`
- Response: `{ success: true }`

(Same pattern for post reactions at `/api/forum/posts/[id]/reactions`.)

##### Topics

**`GET /api/forum/topics`** — List all topics
- Auth: None (public)
- Response: `{ data: Topic[] }`

**`POST /api/forum/topics`** — Create topic
- Auth: `admin` only
- Body: `{ name: string, slug: string, description?: string, icon?: string, color?: string }`
- Response: `{ data: Topic }` (201)
- Audit: `topic.create`

##### Reports

**`POST /api/forum/reports`** — Report content
- Auth: `member+`
- Body: `{ reason: ReportReason, description?: string, threadId?: string, postId?: string }` (exactly one of threadId/postId required)
- Response: `{ data: Report }` (201)
- Audit: `report.create`

**`GET /api/forum/reports`** — Moderator queue
- Auth: `moderator+`
- Query: `?status=OPEN&page=1&limit=20`
- Response: `{ data: Report[], pagination: {...} }`

**`PATCH /api/forum/reports/[id]`** — Resolve report
- Auth: `moderator+`
- Body: `{ status: ReportStatus, resolution: string }`
- Side effects: If status is `RESOLVED_REMOVED`, sets target content status to `REMOVED`.
- Response: `{ data: Report }`
- Audit: `report.resolve`

##### Moderation

**`POST /api/forum/moderation`** — Take moderation action
- Auth: `moderator+` (bans require `admin`)
- Body: `{ action: ModActionType, reason: string, targetUserId?: string, targetThreadId?: string, targetPostId?: string, metadata?: { banDuration?: number } }`
- Validation: Action-specific rules (e.g., can't ban admins).
- Response: `{ data: ModerationAction }`
- Audit: `moderation.{action}`

**`GET /api/forum/moderation`** — Audit log
- Auth: `admin` only
- Query: `?page=1&limit=50&action=&entityType=&userId=`
- Response: `{ data: AuditLog[], pagination: {...} }`

##### Users

**`GET /api/forum/users/[id]`** — Public profile
- Auth: None (public)
- Response: `{ data: { id, name, image, bio, role, threadCount, postCount, joinedAt } }`

**`PATCH /api/forum/users/[id]`** — Update role (admin) or own profile
- Auth: Self (name/bio/image) or `admin` (role)
- Body: `{ name?: string, bio?: string, image?: string, role?: UserRole }`
- Validation: zod; admin can't demote themselves.
- Response: `{ data: User }`
- Audit: `user.update` or `user.role_change`

---

### D. UI/UX Scope

#### Rendering Strategy

| Route | Rendering | Reason |
|---|---|---|
| `/forum` | SSR (dynamic) | Fresh topic counts, latest threads |
| `/forum/topic/[slug]` | SSR (dynamic) | Paginated thread lists |
| `/forum/thread/[id]` | SSR (dynamic) + client-side reactions | SEO-friendly thread content; interactive reactions |
| `/forum/new` | CSR | Form-heavy, behind auth |
| `/forum/me` | CSR | Private user data |
| `/forum/moderation` | CSR | Admin-only, no SEO value |

All SSR pages use `export const runtime = 'nodejs'` to ensure Prisma/pg works.

#### Minimal Screens (Phase 3 MVP)

1. **Forum Home (`/forum`)** — Topic grid with thread counts + latest threads feed.
2. **Topic View (`/forum/topic/[slug]`)** — Thread list with pagination, sorting, search.
3. **Thread Detail (`/forum/thread/[id]`)** — Thread body + paginated post list + reply form + reactions.
4. **New Thread (`/forum/new`)** — Title, body (markdown editor), topic selector.
5. **User Profile (`/forum/me`)** — Activity feed, created threads/posts.
6. **Moderation (`/forum/moderation`)** — Report queue, action buttons, audit log (Phase 4).

#### Shared Components (additions to `src/shared/ui/`)

| Component | Purpose |
|---|---|
| `avatar.tsx` | User avatar with fallback initials |
| `textarea.tsx` | Auto-resizing textarea (markdown input) |
| `dropdown-menu.tsx` | Radix dropdown for action menus |
| `tabs.tsx` | Radix tabs for topic navigation |
| `skeleton.tsx` | Loading skeleton placeholders |
| `pagination.tsx` | Reusable page navigation |
| `tooltip.tsx` | Radix tooltip for reaction labels |

#### Feature Components (in `src/features/forum/components/`)

| Component | Description |
|---|---|
| `thread-card.tsx` | Thread preview card (title, excerpt, meta, reactions) |
| `thread-list.tsx` | Paginated thread list with sort controls |
| `thread-detail.tsx` | Full thread body + metadata |
| `thread-form.tsx` | Create/edit thread form with markdown preview |
| `post-card.tsx` | Single reply/post with author, time, reactions |
| `post-list.tsx` | Paginated post list (nested reply support Phase 5+) |
| `post-editor.tsx` | Reply input with markdown support |
| `topic-nav.tsx` | Horizontal scrollable topic filter |
| `topic-badge.tsx` | Coloured topic tag |
| `reaction-bar.tsx` | Reaction buttons with counts |
| `report-dialog.tsx` | Report content modal |
| `user-avatar.tsx` | Forum-specific avatar with role badge |
| `user-badge.tsx` | Role indicator (mod/admin crown) |
| `pagination-controls.tsx` | Next/prev + page number bar |
| `mod-queue.tsx` | Report list + resolution controls |

#### Design System Alignment

The forum UI will use the existing Bharatvarsh design system:

| Element | Styling |
|---|---|
| Page backgrounds | `var(--obsidian-900)`, `var(--obsidian-850)` |
| Cards (thread, post) | `var(--obsidian-800)` with `border: 1px solid var(--obsidian-700)` |
| Primary actions | `var(--mustard-500)` buttons |
| Secondary text | `var(--text-secondary)`, `var(--text-muted)` |
| Topic colours | Mapped to existing CSS variables (e.g., `--navy-*`, `--event-*`) |
| Hover states | `var(--obsidian-700)` background |
| Focus rings | `var(--powder-300)` outline |
| Status badges | Existing `Badge` component with new variants for forum roles |
| Animations | framer-motion consistent with existing page transitions |

---

### E. AI Capabilities (Vertex AI / Gemini)

#### Architecture

```
User submits thread/post
        ↓
  Route Handler validates with zod
        ↓
  AI Content Check (Vertex AI Gemini)
        ↓
  ┌─────┴─────┐
  PASS        FLAGGED/BLOCKED
  ↓           ↓
  Publish     Quarantine (FLAGGED) or Reject (BLOCKED)
              ↓
        Mod queue notification
              ↓
        Human review → Approve / Remove
```

#### 1. Pre-Publication Content Check

**Purpose:** Screen all user-generated content before publishing.

**Model:** Gemini 1.5 Flash (fast, cheap) via Vertex AI.

**System prompt (high-level):**
```
You are a content moderation assistant for a literary discussion forum about
the novel "Bharatvarsh" — an alternate-history military thriller.

Evaluate the following user-submitted content for:
1. Spam or promotional content
2. Hate speech, harassment, or personal attacks
3. Sexually explicit content
4. Personally identifiable information (PII)
5. Content that violates community guidelines

Respond with a JSON object:
{
  "decision": "PASS" | "FLAGGED" | "BLOCKED",
  "confidence": 0.0-1.0,
  "reasons": ["reason1", ...],
  "categories": ["SPAM" | "HATE" | "HARASSMENT" | "SEXUAL" | "PII" | "OTHER"],
  "suggestion": "optional rewrite suggestion for FLAGGED content"
}

Rules:
- PASS: Content is safe to publish
- FLAGGED: Content may violate guidelines — route to human review
- BLOCKED: Content clearly violates guidelines — reject immediately
- Be lenient with fictional violence discussion (it's a military thriller forum)
- Literary analysis and plot discussion of dark themes is PASS
- A confidence < 0.7 on a negative decision should result in FLAGGED, not BLOCKED
```

**Input/output JSON schema:**
```typescript
// Input
interface ContentCheckInput {
  content: string;      // The body text
  contentType: 'thread' | 'post';
  authorId: string;
  context?: string;     // Thread title for posts
}

// Output
interface ContentCheckOutput {
  decision: 'PASS' | 'FLAGGED' | 'BLOCKED';
  confidence: number;
  reasons: string[];
  categories: ('SPAM' | 'HATE' | 'HARASSMENT' | 'SEXUAL' | 'PII' | 'OTHER')[];
  suggestion?: string;
}
```

**Latency budget:** 2000ms max. If Vertex AI times out, default to `PASS` and log for async review.

#### 2. Auto-Tagging & Summarisation

**Purpose:** Generate thread excerpts and suggest topic tags.

**When:** After a thread is created with `PASS` status.

**System prompt:**
```
Given a forum thread about the Bharatvarsh novel universe, produce:
1. A 1-2 sentence summary (max 200 chars) for use as a thread excerpt
2. Suggested topic tags from the available list: [topics fetched from DB]

Respond as JSON:
{
  "excerpt": "...",
  "suggestedTopics": ["topic-slug-1", "topic-slug-2"]
}
```

**Async:** Runs after publish. Thread is immediately visible; excerpt populates within ~3s.

#### 3. Toxicity/Spam Detection

**Purpose:** Ongoing monitoring for evolving abuse patterns.

**Approach:**
- Heuristic layer (runs first, no AI cost):
  - Duplicate content detection (hash-based)
  - Link density check (>3 links = flag)
  - Posting velocity check (>5 posts/min = flag)
  - New account + high activity = flag
- AI layer (Vertex AI): Only invoked if heuristics don't trigger, as part of content check.

#### Human-in-the-Loop (HIL) Workflow

1. Content flagged → `status = QUARANTINED`, `aiCheckResult = FLAGGED`.
2. Author sees "Your post is under review" message (not an error).
3. Entry appears in moderator queue (`/forum/moderation`).
4. Moderator reviews: sees original content, AI reasoning, confidence score.
5. Moderator decides: **Approve** (publish) or **Remove** (with reason).
6. Author notified of outcome (in-app notification — Phase 5+).
7. All decisions logged in `ModerationAction` + `AuditLog`.

#### Monitoring AI Decisions

- Log every AI call to `AuditLog` with `action = "ai.content_check"`, including model response, latency, and token count.
- Dashboard metric: AI accuracy = `(correct PASS + correct BLOCK) / total decisions` measured against moderator overrides.
- Alert threshold: If AI override rate > 20% in a rolling 7-day window, flag for prompt tuning.

---

### F. Metrics & Observability

#### Product Metrics

| Metric | Definition | Collection |
|---|---|---|
| DAU / WAU | Unique users visiting forum per day/week | GA4 page_view events |
| Activation funnel | Sign-up → First post rate | Custom GA4 events |
| Posts/day | Total posts created per day | DB query (daily cron) |
| Thread-to-reply ratio | Avg replies per thread | DB query |
| D7 retention | % of users returning within 7 days | GA4 cohort analysis |
| Time to first reply | Median time from thread creation to first post | DB query |

#### Content Health Metrics

| Metric | Definition | Alert threshold |
|---|---|---|
| Report rate | Reports / total posts (%) | > 5% |
| Spam rate | AI-blocked or mod-removed spam / total posts (%) | > 3% |
| Mod resolution time | Median time from report → resolution | > 24h |
| AI override rate | Mod overrides of AI decisions / total AI decisions | > 20% |
| Quarantine queue depth | Count of QUARANTINED items | > 50 |

#### Platform Metrics

| Metric | Tool | Alert threshold |
|---|---|---|
| API latency (p50, p95, p99) | Cloud Monitoring | p95 > 500ms |
| Error rate (5xx) | Cloud Monitoring | > 1% |
| DB connection pool | Prisma metrics + Cloud SQL insights | > 80% utilisation |
| DB query latency | Prisma logging | p95 > 200ms |
| Cloud Run instance count | Cloud Monitoring | > 10 (cost concern) |
| Memory usage | Cloud Run metrics | > 80% |
| AI API latency | Custom metric (logged per call) | p95 > 3000ms |
| AI API errors | Custom metric | > 5% |

#### Tooling

| Concern | Demo (Phase 3-5) | Business-grade (Phase 7) |
|---|---|---|
| App analytics | GA4 (`gtag.js`) | GA4 + BigQuery export |
| Structured logging | `console.log` with JSON (Cloud Logging auto-ingests from Cloud Run) | Structured logging library (e.g., `pino`) with correlation IDs |
| Error tracking | Cloud Error Reporting (free) | Sentry (with source maps) |
| Uptime monitoring | Cloud Monitoring uptime checks | Cloud Monitoring + PagerDuty integration |
| DB monitoring | Cloud SQL Insights (built-in) | Cloud SQL Insights + custom Grafana dashboards |

#### Log Structure

```typescript
// All server logs follow this shape (JSON, auto-ingested by Cloud Logging)
interface LogEntry {
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  correlationId: string;    // Per-request UUID
  userId?: string;          // Authenticated user
  action: string;           // e.g., "thread.create", "ai.content_check"
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}
```

---

## 3. GCP Deployment Plan

### Demo-First Stack

```
┌──────────────────────────────────────────────────────────┐
│                        Internet                           │
│                           │                               │
│                    Cloud Load Balancer                     │
│                     (managed HTTPS)                        │
│                           │                               │
│                  ┌────────┴────────┐                      │
│                  │   Cloud Run     │                      │
│                  │  (Next.js app)  │                      │
│                  │  min: 0, max: 5 │                      │
│                  └───┬────┬────┬───┘                      │
│                      │    │    │                           │
│           ┌──────────┘    │    └──────────┐               │
│           ↓               ↓               ↓               │
│    Cloud SQL         Secret Manager   Vertex AI           │
│    (Postgres)        (secrets)        (Gemini)            │
│                                                           │
│    Artifact Registry    Cloud Build                       │
│    (container images)   (CI/CD)                           │
└──────────────────────────────────────────────────────────┘
```

### Cloud SQL Connectivity

**Demo choice: Cloud Run integrated Cloud SQL connection** (built-in Cloud SQL connector via Unix socket)

**Justification:**
- Simplest setup: Cloud Run has a built-in checkbox for "Cloud SQL connections" that sets up an automatic Unix socket proxy.
- No additional infra (no VPC connector, no Auth Proxy sidecar).
- `DATABASE_URL` format: `postgresql://user:pass@localhost/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE`
- Works with Prisma out of the box.

**Hardening path (Phase 7):**
- Private IP + Serverless VPC Connector for defence-in-depth.
- Connection pooling via PgBouncer (or Prisma Data Proxy) if connection count becomes an issue.
- IAM-based auth (no password) for Cloud SQL connections.

### Container Setup

```dockerfile
# Multi-stage build (planned, not implemented yet)
# Stage 1: Install deps + build
# Stage 2: Production runtime (node:20-slim)
# - Runs next start on port 8080 (Cloud Run default)
# - Prisma client generated at build time
# - Health check endpoint: /api/health
```

### Environments

| Environment | Infra | DB | Deploy trigger |
|---|---|---|---|
| **Local** | `next dev` + Docker Compose Postgres | Local Postgres (port 5432) | Manual |
| **Staging** | Cloud Run (staging service) | Cloud SQL (staging instance, `db-f1-micro`) | Push to `staging` branch |
| **Production** | Cloud Run (prod service) | Cloud SQL (prod instance, `db-custom-1-3840`) | Push to `main` branch (after staging smoke test) |

### Secrets Strategy

| Secret | Local | Staging/Prod |
|---|---|---|
| `DATABASE_URL` | `.env.local` (gitignored) | GCP Secret Manager |
| `NEXTAUTH_SECRET` | `.env.local` | GCP Secret Manager |
| `NEXTAUTH_URL` | `.env.local` | Cloud Run env var |
| `GOOGLE_CLIENT_ID` | `.env.local` | GCP Secret Manager |
| `GOOGLE_CLIENT_SECRET` | `.env.local` | GCP Secret Manager |
| `VERTEX_AI_PROJECT` | `.env.local` | Cloud Run env var |
| `VERTEX_AI_LOCATION` | `.env.local` | Cloud Run env var |
| Existing (Airtable, Resend) | `.env.local` | GCP Secret Manager |

**Rule:** `.env.local` is in `.gitignore`. `.env.example` documents all required variables with placeholder values.

### Rollout Strategy

1. **Build:** Cloud Build triggers on push → builds Docker image → pushes to Artifact Registry.
2. **Deploy to staging:** Cloud Build deploys new revision to staging Cloud Run service.
3. **Smoke tests:** Automated tests (Playwright) run against staging URL.
4. **Promote to prod:** If smoke tests pass, deploy same image tag to prod Cloud Run service.
5. **Traffic splitting:** Initial deploy at 10% traffic → monitor for 15 min → ramp to 100%.
6. **Rollback:** One-click rollback to previous revision if error rate spikes.

### Cloud Build Config (planned structure)

```yaml
# cloudbuild.yaml (Phase 1)
steps:
  - name: node:20  # Install + build
  - name: docker   # Build container
  - name: gcr.io/cloud-builders/docker  # Push to Artifact Registry
  - name: gcr.io/google.com/cloudsdktool/cloud-sdk  # Deploy to Cloud Run
```

---

## 4. Phase-Wise Implementation Roadmap

---

### Phase 0 — Design Spikes + Decision Locks

**Duration estimate:** N/A (planning only)

#### Scope

- Lock the ORM choice (Prisma — justified above).
- Lock the auth approach (Auth.js v5 + DB sessions — justified above).
- Lock the Cloud SQL connectivity method (built-in Cloud Run connector).
- Lock the AI model choice (Gemini 1.5 Flash via Vertex AI).
- Lock markdown rendering approach (e.g., `react-markdown` + `remark-gfm` for safe rendering).
- Create `.env.example` documenting all new env vars.
- Create seed data plan (default topics, test users).

#### Repo Changes

| File | Change |
|---|---|
| `docs/forum-implementation-plan.md` | This document (already created) |
| `.env.example` | New: document all env vars with placeholders |
| `docs/DECISIONS.md` | Append ADR-010 through ADR-015 for forum decisions |

#### DB Changes

None.

#### API Contracts

None.

#### UI Deliverables

None.

#### Test Strategy

None.

#### Definition of Done

- [ ] All technology decisions documented in ADRs
- [ ] `.env.example` created with all required variables
- [ ] Team has reviewed and approved this plan

---

### Phase 1 — DB + ORM Scaffolding + Migrations + Local Dev Postgres

#### Scope

**In:** Prisma setup, schema, migrations, local Postgres (Docker Compose), DB client module, health check endpoint, Dockerfile skeleton, Cloud Build config.

**Out:** Auth, forum API routes, UI, AI.

#### Repo Changes

| File/Folder | Change |
|---|---|
| `package.json` | Add: `prisma`, `@prisma/client` |
| `prisma/schema.prisma` | New: Full schema (all models from Section B) |
| `prisma/seed.ts` | New: Seed script for topics + test users |
| `src/server/db.ts` | New: Lazy-init Prisma client (`import 'server-only'`) |
| `src/config/env.ts` | Extend: Add `database.url` to `getServerEnv()` |
| `docker-compose.yml` | New: Local Postgres (port 5432) + pgAdmin (optional) |
| `.env.example` | Updated with DATABASE_URL |
| `.gitignore` | Add `.env.local`, `prisma/*.db` |
| `Dockerfile` | New: Multi-stage build for Cloud Run |
| `cloudbuild.yaml` | New: CI/CD pipeline skeleton |
| `.dockerignore` | New: Exclude node_modules, .env, etc. |
| `src/app/api/health/route.ts` | New: Health check endpoint (DB connectivity test) |

#### DB Changes

- Initial migration: `npx prisma migrate dev --name init` creates all tables.
- Seed: 5 default topics (General Discussion, Plot & Theories, Characters, World Building, Announcements).

#### API Contracts

- `GET /api/health` → `{ status: "ok", db: "connected" | "error" }`

#### UI Deliverables

None.

#### Test Strategy

- **Unit:** Prisma client initialisation (mock DB).
- **Integration:** Seed script runs successfully against Docker Postgres.
- Health check returns 200.

#### Definition of Done

- [ ] `prisma migrate dev` runs without errors
- [ ] `prisma db seed` populates topics
- [ ] `src/server/db.ts` initialises Prisma client with lazy pattern
- [ ] Health check endpoint returns `{ status: "ok", db: "connected" }`
- [ ] `docker-compose up` starts Postgres and app connects
- [ ] Existing site (`/`, `/novel`, `/lore`, `/timeline`) unaffected — `next build` passes
- [ ] Dockerfile builds successfully

---

### Phase 2 — Auth + RBAC + Protected Routes

#### Scope

**In:** Auth.js setup, email magic-link provider (Resend), Google OAuth (optional), session management, RBAC middleware, sign-in/out UI, auth feature module.

**Out:** Forum content pages, forum API routes.

#### Repo Changes

| File/Folder | Change |
|---|---|
| `package.json` | Add: `next-auth@beta` (v5), `@auth/prisma-adapter`, `zod` |
| `src/server/auth.ts` | New: Auth.js config (Prisma adapter, providers, callbacks, session strategy) |
| `src/app/api/auth/[...nextauth]/route.ts` | New: Auth.js catch-all route handler |
| `src/middleware.ts` | New: Session check for protected forum routes |
| `src/features/auth/` | New: `components/sign-in-button.tsx`, `sign-out-button.tsx`, `auth-guard.tsx`, `role-gate.tsx`, `hooks/use-session.ts`, `types.ts`, `index.ts` |
| `src/shared/layout/header.tsx` | Modify: Add conditional auth button (sign in / user avatar) |
| `src/config/env.ts` | Extend: Add `auth.secret`, `auth.googleClientId`, `auth.googleClientSecret` |
| `src/types/index.ts` | Extend: Add `UserPublic`, `SessionUser` shared types |
| `src/config/feature-flags.ts` | New: `FORUM_ENABLED`, `FORUM_REQUIRE_AUTH_TO_READ` flags |

#### DB Changes

- Migration: Auth tables (users, accounts, sessions, verification_tokens) — already in schema from Phase 1.
- No new migration if Phase 1 schema included auth models.

#### API Contracts

- Auth.js handles all `/api/auth/*` routes automatically.
- Session available via `auth()` helper in server components and route handlers.

#### UI Deliverables

- Sign-in button in header (visible only when `FORUM_ENABLED=true`).
- Sign-in page (Auth.js default or custom at `/auth/signin`).
- Sign-out button in user dropdown.
- `<AuthGuard>` wrapper component for protected pages.
- `<RoleGate role="moderator">` wrapper for role-restricted UI.

#### Test Strategy

- **Unit:** `role-gate.tsx` renders/hides based on mock session.
- **Integration:** Sign-in flow with magic-link (test against local Postgres).
- **Manual:** Verify session persists across page reloads.

#### Definition of Done

- [ ] Email magic-link sign-in works end-to-end (send email → click link → session created)
- [ ] Session stored in Postgres `sessions` table
- [ ] `auth()` returns valid session in server components
- [ ] Middleware redirects unauthenticated users from `/forum/new` to sign-in
- [ ] Middleware allows unauthenticated users to read `/forum` and `/forum/thread/*`
- [ ] Header shows sign-in/out button
- [ ] `<RoleGate>` hides mod-only UI from members
- [ ] Existing site routes (`/`, `/novel`, `/lore`, `/timeline`) completely unaffected
- [ ] `next build` passes

---

### Phase 3 — Core Forum (Threads/Posts) + Basic UI + Pagination

#### Scope

**In:** Thread CRUD, post CRUD, topic listing, pagination, forum pages (home, topic, thread detail, new thread), reaction API + UI.

**Out:** Moderation, AI, search, notifications.

#### Repo Changes

| File/Folder | Change |
|---|---|
| `src/app/forum/layout.tsx` | New: Forum layout with topic nav + auth context |
| `src/app/forum/page.tsx` | New: Forum home (metadata + `<ForumContent />`) |
| `src/app/forum/topic/[slug]/page.tsx` | New: Topic thread listing |
| `src/app/forum/thread/[id]/page.tsx` | New: Thread detail |
| `src/app/forum/new/page.tsx` | New: Create thread (auth-gated) |
| `src/app/forum/me/page.tsx` | New: User profile |
| `src/app/api/forum/threads/route.ts` | New: GET (list) + POST (create) |
| `src/app/api/forum/threads/[id]/route.ts` | New: GET + PATCH + DELETE |
| `src/app/api/forum/threads/[id]/posts/route.ts` | New: GET + POST |
| `src/app/api/forum/posts/[id]/route.ts` | New: PATCH + DELETE |
| `src/app/api/forum/threads/[id]/reactions/route.ts` | New: POST + DELETE |
| `src/app/api/forum/topics/route.ts` | New: GET |
| `src/features/forum/` | New: All components, hooks, types, Content files, index.ts |
| `src/shared/ui/avatar.tsx` | New |
| `src/shared/ui/textarea.tsx` | New |
| `src/shared/ui/tabs.tsx` | New |
| `src/shared/ui/skeleton.tsx` | New |
| `src/shared/ui/pagination.tsx` | New |
| `src/shared/ui/index.ts` | Update: Add new component exports |
| `src/lib/metadata.ts` | Update: Add `forum` page metadata |
| `package.json` | Add: `react-markdown`, `remark-gfm`, `rehype-sanitize` (for markdown rendering) |

#### DB Changes

- No new migration (schema already includes threads, posts, reactions from Phase 1).
- Seed: Add sample threads and posts for development.

#### API Contracts

All endpoints defined in Section C above (threads, posts, reactions, topics — read + write).

#### UI Deliverables

- Forum home page with topic grid + latest threads feed.
- Topic page with paginated thread list (20/page), sort by latest/popular.
- Thread detail page with body (rendered markdown), author info, reactions, paginated posts (30/page).
- New thread form with title, markdown body, topic selector.
- Post reply form (inline, below thread).
- Reaction bar (upvote/downvote/insightful/flame).
- User profile page (own threads + posts).
- Loading skeletons for all async content.
- Empty states ("No threads yet — be the first!").
- Responsive design (mobile-first, matches existing Bharatvarsh design system).

#### Test Strategy

- **Unit:** Zod validation schemas for all payloads. Component rendering tests (thread-card, post-card).
- **Integration:** Thread CRUD lifecycle (create → read → edit → delete). Pagination boundary tests.
- **E2e (Playwright):** Create thread → view in listing → reply → view reply.

#### Definition of Done

- [ ] Forum home page renders topic grid + threads
- [ ] Thread CRUD works end-to-end (create, read, edit, soft-delete)
- [ ] Post/reply CRUD works end-to-end
- [ ] Reactions toggle correctly (optimistic UI + server sync)
- [ ] Pagination works (threads and posts)
- [ ] Markdown renders safely (no XSS)
- [ ] User can only edit/delete own content
- [ ] Forum nav accessible from site header
- [ ] Mobile-responsive layout
- [ ] All forum pages follow Bharatvarsh design system
- [ ] `next build` passes
- [ ] Existing pages unaffected

---

### Phase 4 — Moderation (Reporting + Admin Queue) + Audit Logs

#### Scope

**In:** Report content flow, moderator queue, moderation actions (remove/approve/warn/ban), audit logging for all mutations, moderation page.

**Out:** AI moderation (Phase 5), notifications.

#### Repo Changes

| File/Folder | Change |
|---|---|
| `src/app/forum/moderation/page.tsx` | New: Moderation queue page (role-gated) |
| `src/app/api/forum/reports/route.ts` | New: GET (mod queue) + POST (report) |
| `src/app/api/forum/reports/[id]/route.ts` | New: PATCH (resolve) |
| `src/app/api/forum/moderation/route.ts` | New: GET (audit log) + POST (action) |
| `src/app/api/forum/users/[id]/route.ts` | New: GET (profile) + PATCH (role/ban) |
| `src/features/forum/components/report-dialog.tsx` | Update: Full implementation |
| `src/features/forum/components/mod-queue.tsx` | Update: Full implementation |
| `src/features/forum/ModerationContent.tsx` | New: Mod queue composition |
| `src/server/moderation.ts` | New: Business logic (ban checks, audit trail creation) |

#### DB Changes

- No new migration (report, moderation_action, audit_log tables exist from Phase 1).
- Seed: Sample reports for dev/testing.

#### API Contracts

All moderation endpoints from Section C (reports, moderation actions, user management).

#### UI Deliverables

- Report dialog (accessible from thread/post dropdown menu).
- Moderation queue page: list of open reports with content preview, AI flags (placeholder until Phase 5), and action buttons.
- Moderator actions: approve, remove, warn, temp-ban (with duration picker), perm-ban.
- Audit log viewer (admin-only tab on moderation page).
- Visual indicators: "Removed" badge on mod-removed content. "Quarantined" badge for flagged content.
- Ban indicator: Banned users see "You are banned until {date}" instead of reply form.

#### Test Strategy

- **Unit:** Moderation business logic (can moderator ban admin? No). Audit log creation.
- **Integration:** Full report lifecycle (member reports → mod sees → mod resolves → content status updates).
- **E2e:** Report content → moderator removes → content hidden from public.

#### Definition of Done

- [ ] Members can report threads and posts with reason
- [ ] Moderators see report queue with open items
- [ ] Moderators can resolve reports (remove content, dismiss, warn)
- [ ] Admin can change user roles
- [ ] Admin can temp-ban and perm-ban users
- [ ] All mutations create audit log entries
- [ ] Audit log viewable by admin
- [ ] Banned users cannot post
- [ ] Removed content shows "This content has been removed" placeholder
- [ ] Role-gating prevents member access to mod page
- [ ] `next build` passes

---

### Phase 5 — AI Moderation/Enrichment (Vertex AI) + HIL Controls

#### Scope

**In:** Vertex AI client setup, pre-publication content check, auto-tagging, excerpt generation, human-in-the-loop workflow, toxicity heuristics.

**Out:** Advanced AI features (sentiment analysis, user risk scoring).

#### Repo Changes

| File/Folder | Change |
|---|---|
| `package.json` | Add: `@google-cloud/vertexai` |
| `src/server/ai/vertex-client.ts` | New: Lazy-init Vertex AI client |
| `src/server/ai/content-check.ts` | New: Content moderation function |
| `src/server/ai/auto-tagger.ts` | New: Auto-tag + summarise |
| `src/server/ai/toxicity.ts` | New: Heuristic spam/toxicity checks |
| `src/config/env.ts` | Extend: Add `vertexAi.project`, `vertexAi.location` |
| `src/app/api/forum/threads/route.ts` | Modify: Integrate AI check on POST |
| `src/app/api/forum/threads/[id]/posts/route.ts` | Modify: Integrate AI check on POST |
| `src/features/forum/components/mod-queue.tsx` | Modify: Show AI reasoning + confidence |
| `src/features/forum/components/quarantine-notice.tsx` | New: "Under review" message for authors |

#### DB Changes

- No new migration. `aiCheckResult` column already on threads/posts.

#### API Contracts

- Thread/post create endpoints now return `{ data: Thread/Post, aiStatus: 'PASS' | 'QUARANTINED' | 'BLOCKED' }`.
- Blocked responses return 422 with `{ error: "Content blocked", code: "AI_CONTENT_BLOCKED", reasons: [...] }`.

#### UI Deliverables

- "Your post is under review" notice for quarantined content (visible to author only).
- AI reasoning panel in mod queue (confidence score, flagged categories, suggestion).
- Toggle to override AI decision (approve/remove).
- AI badge on mod-approved content ("Reviewed by moderator").

#### Test Strategy

- **Unit:** Content check with mocked Vertex AI responses (PASS, FLAGGED, BLOCKED). Heuristic tests (link density, duplicate detection).
- **Integration:** Submit flagged content → verify quarantine → moderator approves → content published.
- **E2e:** Full HIL workflow with real Vertex AI (staging only).

#### Definition of Done

- [ ] Pre-publication AI check runs on all new threads and posts
- [ ] PASS content publishes immediately
- [ ] FLAGGED content quarantined + appears in mod queue
- [ ] BLOCKED content rejected with user-friendly error message
- [ ] Auto-tagging populates thread excerpts within 5s of creation
- [ ] Heuristic checks catch obvious spam (>3 links, duplicate content)
- [ ] Moderator can see AI reasoning and confidence in mod queue
- [ ] Moderator can override AI decisions
- [ ] All AI decisions logged in audit_log
- [ ] AI timeout (>2s) defaults to PASS with async review flag
- [ ] `next build` passes
- [ ] Vertex AI credentials in Secret Manager (staging/prod)

---

### Phase 6 — Metrics + Observability + Rate Limiting + Caching

#### Scope

**In:** GA4 integration for forum events, structured logging, rate limiting, response caching, DB query optimisation, error tracking setup.

**Out:** Advanced analytics dashboards, cost optimisation.

#### Repo Changes

| File/Folder | Change |
|---|---|
| `package.json` | Add: rate limiting library (e.g., `@upstash/ratelimit` or custom in-memory), `pino` (structured logging) |
| `src/server/rate-limit.ts` | New: Rate limiter middleware |
| `src/server/logger.ts` | New: Structured logging with correlation IDs |
| `src/middleware.ts` | Modify: Add rate limiting checks |
| `src/shared/hooks/use-analytics.ts` | New: GA4 event tracking hook for forum actions |
| `src/app/forum/layout.tsx` | Modify: Add analytics tracking |
| `src/app/api/forum/*/route.ts` | Modify: Add rate limiting, structured logging, cache headers |
| `next.config.ts` | Modify: Add cache headers for forum read endpoints |
| `src/config/feature-flags.ts` | Update: Add rate limit thresholds, cache TTLs |

#### DB Changes

- Add database indexes if missing (review query patterns from Phase 3-5).
- Add materialized views or denormalized counts if thread/post counts are slow.

#### API Contracts

- Rate limit headers added to all responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- 429 response when rate limit exceeded: `{ error: "Too many requests", code: "RATE_LIMITED", retryAfter: <seconds> }`.

#### UI Deliverables

- Rate limit feedback: "You're posting too fast. Please wait {n} seconds."
- GA4 custom events: `forum_thread_create`, `forum_post_create`, `forum_reaction`, `forum_report`, `forum_sign_in`.

#### Test Strategy

- **Unit:** Rate limiter logic (token bucket).
- **Integration:** Exceed rate limit → 429 response → wait → request succeeds.
- **Load test:** k6 or Artillery script to validate rate limits and caching under load.

#### Definition of Done

- [ ] Rate limiting active on all forum API endpoints
- [ ] 429 responses include retry-after header
- [ ] Forum read endpoints use appropriate `Cache-Control` headers
- [ ] Structured JSON logs emitted from all API routes
- [ ] Correlation IDs link request lifecycle
- [ ] GA4 events fire for key forum actions
- [ ] Cloud Monitoring alerts configured for error rate > 1% and latency p95 > 500ms
- [ ] DB query performance reviewed — no N+1 queries
- [ ] `next build` passes

---

### Phase 7 — Hardening for "Business-Grade"

#### Scope

**In:** WAF/abuse protection, automated backups, canary releases, load testing, connection pooling, VPC hardening, security audit, accessibility audit.

**Out:** Feature development (this is infra/ops only).

#### Repo Changes

| File/Folder | Change |
|---|---|
| `cloudbuild.yaml` | Modify: Add canary deployment step (10% → 50% → 100%) |
| `terraform/` or `infra/` | New (optional): IaC for Cloud SQL, Cloud Run, Secret Manager |
| `k6/` or `load-tests/` | New: Load testing scripts |
| `src/middleware.ts` | Modify: Add IP-based abuse detection, Cloudflare/Cloud Armor integration |
| `next.config.ts` | Modify: Security headers (CSP, HSTS, X-Frame-Options) |
| `prisma/schema.prisma` | Modify: Add connection pooling config |

#### DB Changes

- Enable automated backups on Cloud SQL (daily, 7-day retention).
- Point-in-time recovery enabled.
- Connection pooling: Configure PgBouncer sidecar or Prisma connection pool.

#### API Contracts

No new endpoints.

#### UI Deliverables

- CSP-compliant inline styles/scripts audit.
- WCAG AA accessibility audit and fixes.

#### Test Strategy

- **Load test:** Simulate 100 concurrent users: browse, create threads, reply. Target: p95 < 500ms, zero errors.
- **Security:** OWASP ZAP scan on staging. SQL injection testing on all inputs. XSS testing on markdown rendering.
- **Chaos:** Kill Cloud Run instance during load test → verify auto-recovery.
- **Accessibility:** axe-core audit on all forum pages.

#### Definition of Done

- [ ] Cloud Armor WAF rules block known attack patterns
- [ ] Security headers set (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] Automated DB backups running (daily, 7-day retention)
- [ ] Point-in-time recovery verified
- [ ] Load test passes: 100 concurrent users, p95 < 500ms, 0 errors
- [ ] Canary deployment tested: 10% → ramp to 100%
- [ ] Rollback verified: revert to previous revision in < 2 minutes
- [ ] OWASP ZAP scan: 0 high/critical findings
- [ ] WCAG AA audit: 0 violations on forum pages
- [ ] Connection pooling configured (max connections aligned to Cloud SQL tier)
- [ ] All secrets in Secret Manager (zero secrets in env vars or code)
- [ ] Monitoring alerts verified: team notified within 5 minutes of incident

---

## Appendix: New Dependencies Summary

| Package | Phase | Purpose |
|---|---|---|
| `prisma` | 1 | ORM CLI |
| `@prisma/client` | 1 | ORM client |
| `next-auth@beta` (v5) | 2 | Authentication |
| `@auth/prisma-adapter` | 2 | Auth.js ↔ Prisma bridge |
| `zod` | 2 | Schema validation |
| `react-markdown` | 3 | Markdown rendering |
| `remark-gfm` | 3 | GitHub-flavoured markdown |
| `rehype-sanitize` | 3 | HTML sanitisation |
| `@google-cloud/vertexai` | 5 | Vertex AI client |
| `pino` | 6 | Structured logging |
| Rate limiting lib (TBD) | 6 | API rate limiting |

## Appendix: ADR Index (to be created)

| ADR | Title | Phase |
|---|---|---|
| ADR-010 | Prisma as Forum ORM | 0 |
| ADR-011 | Auth.js v5 with DB Sessions | 0 |
| ADR-012 | Cloud SQL Built-in Connector for Demo | 0 |
| ADR-013 | Gemini 1.5 Flash for Content Moderation | 0 |
| ADR-014 | Zod for API Validation | 0 |
| ADR-015 | Soft-Delete Strategy for Forum Content | 0 |
