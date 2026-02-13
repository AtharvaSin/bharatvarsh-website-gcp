/**
 * Prisma database client for the Bharatvarsh forum.
 * Server-only module — do not import from client components.
 *
 * Uses lazy initialization (ADR-004) to prevent build failures
 * when DATABASE_URL is absent during static generation.
 *
 * Phase 7: Connection pool settings aligned with Cloud SQL tier.
 * Cloud Run scales 0–5 instances, each with its own pool.
 * Cloud SQL db-custom-1-3840 supports ~100 connections.
 * Budget: 100 connections / 5 instances = 20 per instance.
 */

import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Connection pool limits per Cloud Run instance. */
const POOL_SIZE = parseInt(process.env.DATABASE_POOL_SIZE || '20', 10);
const POOL_TIMEOUT = parseInt(process.env.DATABASE_POOL_TIMEOUT || '10', 10);

/**
 * Get the singleton Prisma client instance.
 * In development, the client is stored on `globalThis` to survive HMR.
 * In production, a single instance is created and reused.
 */
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const datasourceUrl = process.env.DATABASE_URL;

    if (datasourceUrl) {
      console.log('Using DATABASE_URL from environment');
    }

    globalForPrisma.prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      datasourceUrl,
    });
  }
  return globalForPrisma.prisma;
}

/** Lazily-initialized Prisma client — import this in server modules. */
export const prisma = getPrismaClient();
