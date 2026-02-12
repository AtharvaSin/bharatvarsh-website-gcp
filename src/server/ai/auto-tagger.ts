/**
 * Auto-tagging and excerpt generation for the Bharatvarsh Forum.
 *
 * Uses Vertex AI (Gemini 1.5 Flash) to generate a short excerpt and
 * suggest topic tags for newly-created threads. This runs asynchronously
 * after thread creation and never blocks the publish flow.
 *
 * Server-only module -- do not import from client components.
 */

import 'server-only';

import type { GenerateContentResult } from '@google-cloud/vertexai';

import { getModerationModel } from './vertex-client';
import { prisma } from '@/server/db';

// ─── TYPES ─────────────────────────────────────────────────

interface AutoTagResult {
  excerpt: string;
  suggestedTopics: string[];
}

// ─── CONSTANTS ─────────────────────────────────────────────

const AUTO_TAG_PROMPT = `Given a forum thread about the Bharatvarsh novel universe, produce:
1. A 1-2 sentence summary (max 200 chars) for use as a thread excerpt
2. Suggested topic tags from the available list

Respond as JSON:
{
  "excerpt": "...",
  "suggestedTopics": ["topic-slug-1", "topic-slug-2"]
}`;

/** Maximum body length sent to the model to avoid token limits. */
const MAX_BODY_LENGTH = 2000;

/** Timeout for the auto-tagging AI call (slightly longer than moderation). */
const AUTO_TAG_TIMEOUT_MS = 5000;

/** Maximum allowed excerpt length. */
const MAX_EXCERPT_LENGTH = 200;

// ─── MAIN EXPORT ───────────────────────────────────────────

/**
 * Auto-generates excerpt and tag suggestions for a thread.
 * Runs asynchronously after thread creation -- does not block publish.
 *
 * Failures are non-critical: errors are logged and silently swallowed
 * so the thread remains published regardless of AI availability.
 */
export async function autoTagThread(threadId: string): Promise<void> {
  const model = getModerationModel();
  if (!model) return;

  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { title: true, body: true },
    });

    if (!thread) return;

    // Fetch available topics for the suggestion list
    const topics = await prisma.topic.findMany({
      select: { slug: true, name: true },
      orderBy: { sortOrder: 'asc' },
    });

    const topicList = topics.map((t) => t.slug).join(', ');

    const userMessage = [
      `Available topics: [${topicList}]`,
      '',
      `Thread title: ${thread.title}`,
      '',
      'Thread body:',
      thread.body.slice(0, MAX_BODY_LENGTH),
    ].join('\n');

    const result = await Promise.race<GenerateContentResult>([
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: AUTO_TAG_PROMPT + '\n\n' + userMessage }],
          },
        ],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('AI_TIMEOUT')),
          AUTO_TAG_TIMEOUT_MS,
        ),
      ),
    ]);

    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) return;

    const parsed = JSON.parse(responseText) as AutoTagResult;

    // Update thread excerpt if the AI produced a valid one
    if (parsed.excerpt && parsed.excerpt.length <= MAX_EXCERPT_LENGTH) {
      await prisma.thread.update({
        where: { id: threadId },
        data: { excerpt: parsed.excerpt },
      });
    }

    // Log the auto-tag action
    await prisma.auditLog.create({
      data: {
        action: 'ai.auto_tag',
        entityType: 'thread',
        entityId: threadId,
        userId: 'system',
        changes: {
          excerpt: parsed.excerpt,
          suggestedTopics: parsed.suggestedTopics,
        },
      },
    });
  } catch {
    // Auto-tagging failure is non-critical -- log and continue
    await prisma.auditLog
      .create({
        data: {
          action: 'ai.auto_tag_error',
          entityType: 'thread',
          entityId: threadId,
          userId: 'system',
          changes: { error: 'Auto-tag failed' },
        },
      })
      .catch(() => {});
  }
}
