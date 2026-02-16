---
name: database_ops
description: Helper skill for comprehensive database operations using Prisma (migrate, seed, studio).
---
# Database Operations Skill

This skill provides a standardized way to perform common database maintenance and development tasks using Prisma ORM.

## Capabilities
- **Migration**: Apply schema changes to the database.
- **Seeding**: Populate the database with initial/test data.
- **Generation**: Update the Prisma Client after schema changes.
- **Studio**: Launch the Prisma Studio GUI for data inspection (local only).

## Commands

### 1. Apply Migrations (Dev)
Use this when you have modified `prisma/schema.prisma` and need to update the local/dev database.
```bash
npx prisma migrate dev
```

### 2. Generate Client
Run this after any schema change to update TypeScript types.
```bash
npx prisma generate
```

### 3. Seed Database
Populate the database with seed data defined in `prisma/seed.ts`.
```bash
npx prisma db seed
```

### 4. Push Schema (Prototyping)
Quickly sync schema with DB without creating a migration file (use with caution in production).
```bash
npx prisma db push
```
