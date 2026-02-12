/**
 * Lazy-init Vertex AI client for the Bharatvarsh Forum.
 *
 * Returns null when VERTEX_AI_PROJECT is not configured so that
 * the application degrades gracefully (AI moderation is skipped).
 *
 * Server-only module -- do not import from client components.
 */

import 'server-only';

import { VertexAI } from '@google-cloud/vertexai';

let vertexAI: VertexAI | null = null;

/**
 * Gets or initializes the Vertex AI client singleton.
 * Returns null if VERTEX_AI_PROJECT is not configured (graceful degradation).
 */
export function getVertexClient(): VertexAI | null {
  const project = process.env.VERTEX_AI_PROJECT;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (!project) {
    return null;
  }

  if (!vertexAI) {
    vertexAI = new VertexAI({ project, location });
  }

  return vertexAI;
}

/**
 * Gets a Gemini generative model for content moderation.
 * Uses Gemini 1.5 Flash for low latency and cost.
 */
export function getModerationModel() {
  const client = getVertexClient();
  if (!client) return null;

  return client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });
}
