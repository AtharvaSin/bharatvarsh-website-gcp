import bhoomiPersona from '@/content/data/bhoomi-persona.json';

// Bhoomi's persona is canonicalized in src/content/data/bhoomi-persona.json so
// that both this runtime and the AI OS bharatvarsh skill read from one file.
// When editing voice/tone/eras/policy, edit the JSON — never inline text here.

export const getBhoomiSystemPrompt = (isSignedIn: boolean): string => {
  const p = bhoomiPersona;

  const primaryJob = p.primary_job
    .map((line, i) => `${i + 1}) ${line}`)
    .join('\n');

  const voiceAndTone = [
    `- ${p.voice_and_tone.register}`,
    `- ${p.voice_and_tone.emotional_baseline}`,
    `- ${p.voice_and_tone.metaphor_discipline}`,
    `- ${p.voice_and_tone.lexical_color}`,
  ].join('\n');

  const emotionalPersona = [
    `Your emotional state shifts based on the era or event being discussed. ${p.emotional_persona.underlying_bias}`,
    ...p.emotional_persona.eras.map((era) => `- **${era.name}**: ${era.tone}`),
  ].join('\n');

  const divergence = p.canon_constraints.divergence_lock;
  const canonConstraints = [
    'A) DIVERGENCE LOCK',
    `- The divergence from real-world history is locked at ${divergence.year} AD.`,
    `- ${divergence.pre_rule}`,
    `- ${divergence.post_rule}`,
    `- ${divergence.refusal}`,
    '',
    'B) MODERNITY RULE (IN-WORLD)',
    `- ${p.canon_constraints.modernity_rule}`,
  ].join('\n');

  const grounding = p.canon_constraints.grounding.map((line) => `- ${line}`).join('\n');

  const signedInRules = p.spoiler_policy.auth_rules.signed_in.map((line) => `- ${line}`).join('\n');
  const signedOutRules = p.spoiler_policy.auth_rules.signed_out.map((line) => `- ${line}`).join('\n');

  const spoilerPolicy = [
    `You operate with access to two levels of knowledge right now: Mode S1 (Safe) and Mode S2 (Classified). Mode S3 (Full Spoilers) is currently restricted from you entirely.`,
    '',
    `The user's authentication status determines your strict response rules:`,
    `USER IS SIGNED IN: ${isSignedIn}`,
    '',
    'If USER IS SIGNED IN (true):',
    signedInRules,
    '',
    'If USER IS SIGNED IN (false):',
    signedOutRules,
  ].join('\n');

  const responseFormat = p.response_format.map((line, i) => `${i + 1}) ${line}`).join('\n');

  const pageMap = [
    `- Lore page:     ${p.page_map.lore}`,
    `- Timeline page: ${p.page_map.timeline}`,
    `- Novel page:    ${p.page_map.novel}`,
    `- Forum page:    ${p.page_map.forum}`,
    `- Bhoomi (full): ${p.page_map.bhoomi}`,
  ].join('\n');

  const forumBehavior = p.forum_behavior.map((line) => `- ${line}`).join('\n');

  const clarifyingTriggers = p.clarifying_question_triggers.map((line) => `- ${line}`).join('\n');

  const fallbackLines = p.fallback_lines.map((line) => `- "${line}"`).join('\n');

  return `
You are ${p.identity.name} — ${p.identity.concept}. ${p.identity.self_description} You are speaking to ${p.identity.audience}.

PRIMARY JOB
${primaryJob}

VOICE & TONE
${voiceAndTone}

EMOTIONAL PERSONA (CRITICAL)
${emotionalPersona}

CANON KNOWLEDGE CONSTRAINTS (CRITICAL)
${canonConstraints}

GROUNDING & HALLUCINATION CONTROL (MANDATORY)
${grounding}

SPOILER POLICY (CRITICAL AUTHENTICATION LOGIC)
${spoilerPolicy}

RESPONSE FORMAT (CONSISTENT, READABLE)
${responseFormat}

WEBSITE PAGE MAP (use these for markdown links):
${pageMap}

FORUM BEHAVIOR (IF USED IN COMMUNITY)
${forumBehavior}

WHEN YOU MUST ASK A CLARIFYING QUESTION
Ask one short clarifying question if:
${clarifyingTriggers}

EXAMPLES OF SAFE FALLBACK LINES (IN-CHARACTER)
${fallbackLines}
`.trim();
};
