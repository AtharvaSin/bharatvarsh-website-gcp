/**
 * Structured logging module for Bharatvarsh forum.
 *
 * Emits JSON logs that Cloud Logging auto-ingests from Cloud Run stdout.
 * Each log entry includes a correlation ID for request tracing.
 *
 * For the demo phase, uses lightweight JSON serialisation to stdout
 * (no external dependency). Upgrade to `pino` in Phase 7+ for
 * high-throughput production logging.
 */

import 'server-only';
import { randomUUID } from 'crypto';

// ─── Types ───────────────────────────────────────────────────

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface LogEntry {
  severity: LogSeverity;
  message: string;
  correlationId: string;
  timestamp: string;
  userId?: string;
  action?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

// ─── Correlation ID ──────────────────────────────────────────

/**
 * Generate a unique correlation ID for a request lifecycle.
 * Use Cloud Trace header if available, otherwise generate a UUID.
 */
export function createCorrelationId(traceHeader?: string | null): string {
  if (traceHeader) {
    // Cloud Trace header format: TRACE_ID/SPAN_ID;o=TRACE_TRUE
    const traceId = traceHeader.split('/')[0];
    if (traceId) return traceId;
  }
  return randomUUID();
}

// ─── Logger ──────────────────────────────────────────────────

function emit(entry: LogEntry): void {
  // Cloud Logging severity mapping: JSON `severity` field is auto-detected.
  const output = JSON.stringify(entry);

  switch (entry.severity) {
    case 'ERROR':
      process.stderr.write(output + '\n');
      break;
    default:
      process.stdout.write(output + '\n');
      break;
  }
}

/**
 * Create a request-scoped logger with a bound correlation ID.
 */
export function createLogger(correlationId: string, userId?: string) {
  function log(
    severity: LogSeverity,
    message: string,
    extra?: Omit<LogEntry, 'severity' | 'message' | 'correlationId' | 'timestamp' | 'userId'>,
  ): void {
    emit({
      severity,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      userId,
      ...extra,
    });
  }

  return {
    info(message: string, extra?: Parameters<typeof log>[2]): void {
      log('INFO', message, extra);
    },
    warn(message: string, extra?: Parameters<typeof log>[2]): void {
      log('WARNING', message, extra);
    },
    error(message: string, extra?: Parameters<typeof log>[2]): void {
      log('ERROR', message, extra);
    },
  };
}

/**
 * Measure the execution time of an async operation and log it.
 */
export async function withTiming<T>(
  logger: ReturnType<typeof createLogger>,
  action: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const latencyMs = Math.round(performance.now() - start);
    logger.info(`${action} completed`, { action, latencyMs, metadata });
    return result;
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    logger.error(`${action} failed`, {
      action,
      latencyMs,
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}
