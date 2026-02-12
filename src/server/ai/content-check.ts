/**
 * Pre-publication AI content analysis for the Bharatvarsh Forum.
 *
 * Uses Vertex AI (Gemini 1.5 Flash) to evaluate user-submitted content
 * for spam, hate speech, harassment, PII, and other policy violations.
 * Falls back to PASS on timeout or misconfiguration so publishing is
 * never blocked by AI availability issues.
 *
 * Server-only module -- do not import from client components.
 */

import 'server-only';

import type { GenerateContentResult } from '@google-cloud/vertexai';

import { getModerationModel } from './vertex-client';
import { prisma } from '@/server/db';

// ─── TYPES ─────────────────────────────────────────────────

type ModerationCategory =
  | 'SPAM'
  | 'HATE'
  | 'HARASSMENT'
  | 'SEXUAL'
  | 'PII'
  | 'OTHER';

type ModerationDecision = 'PASS' | 'FLAGGED' | 'BLOCKED';

export interface ContentCheckInput {
  content: string;
  contentType: 'thread' | 'post';
  authorId: string;
  /** Thread title — provided as context when checking a post. */
  context?: string;
}

export interface ContentCheckOutput {
  decision: ModerationDecision;
  confidence: number;
  reasons: string[];
  categories: ModerationCategory[];
  suggestion?: string;
}

// ─── CONSTANTS ─────────────────────────────────────────────

const MODERATION_SYSTEM_PROMPT = `You are a content moderation assistant for a literary discussion forum about
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
- A confidence < 0.7 on a negative decision should result in FLAGGED, not BLOCKED`;

const DEFAULT_PASS: ContentCheckOutput = {
  decision: 'PASS',
  confidence: 1.0,
  reasons: [],
  categories: [],
};

/** Maximum time to wait for the AI response before defaulting to PASS. */
const AI_TIMEOUT_MS = 2000;

const VALID_DECISIONS: ReadonlySet<string> = new Set([
  'PASS',
  'FLAGGED',
  'BLOCKED',
]);

// ─── MAIN EXPORT ───────────────────────────────────────────

/**
 * Evaluate user-submitted content against community guidelines using
 * Vertex AI. Returns a structured moderation decision.
 *
 * Graceful degradation:
 *  - If Vertex AI is not configured  -> PASS (confidence 0)
 *  - If the AI call times out        -> PASS (logged for async review)
 *  - If the AI response is malformed -> PASS (logged for investigation)
 */
export async function checkContent(
  input: ContentCheckInput,
): Promise<ContentCheckOutput> {
  const model = getModerationModel();

  // If Vertex AI is not configured, default to PASS (SKIPPED)
  if (!model) {
    return {
      ...DEFAULT_PASS,
      confidence: 0,
      reasons: ['AI moderation not configured'],
    };
  }

  const startTime = Date.now();

  try {
    const userMessage = [
      `Content type: ${input.contentType}`,
      input.context ? `Context: ${input.context}` : '',
      '',
      'Content to evaluate:',
      input.content,
    ]
      .filter(Boolean)
      .join('\n');

    // Race between AI call and timeout
    const result = await Promise.race<GenerateContentResult>([
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: MODERATION_SYSTEM_PROMPT + '\n\n' + userMessage },
            ],
          },
        ],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), AI_TIMEOUT_MS),
      ),
    ]);

    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Empty AI response');
    }

    // Parse JSON response
    const parsed = JSON.parse(responseText) as ContentCheckOutput;

    // Validate the parsed response
    if (!VALID_DECISIONS.has(parsed.decision)) {
      throw new Error('Invalid AI decision');
    }

    // Enforce confidence rule: < 0.7 confidence on negative -> FLAGGED instead of BLOCKED
    if (parsed.decision === 'BLOCKED' && parsed.confidence < 0.7) {
      parsed.decision = 'FLAGGED';
    }

    const latencyMs = Date.now() - startTime;

    // Log AI decision to audit log
    await prisma.auditLog.create({
      data: {
        action: 'ai.content_check',
        entityType: input.contentType,
        entityId: input.authorId,
        userId: input.authorId,
        changes: {
          decision: parsed.decision,
          confidence: parsed.confidence,
          categories: parsed.categories,
          latencyMs,
        },
      },
    });

    return parsed;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const isTimeout =
      error instanceof Error && error.message === 'AI_TIMEOUT';

    // Log timeout/error -- fire-and-forget so audit failure never blocks the flow
    await prisma.auditLog
      .create({
        data: {
          action: 'ai.content_check_error',
          entityType: input.contentType,
          entityId: input.authorId,
          userId: input.authorId,
          changes: {
            error: isTimeout ? 'Timeout' : 'AI error',
            latencyMs,
          },
        },
      })
      .catch(() => {});

    // On timeout or error, default to PASS
    // (per plan: "If Vertex AI times out, default to PASS and log for async review")
    return {
      ...DEFAULT_PASS,
      reasons: [
        isTimeout
          ? 'AI timeout — defaulted to PASS'
          : 'AI error — defaulted to PASS',
      ],
    };
  }
}
