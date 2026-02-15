# Bhoomi Copilot Upgrade Strategy: "The Mesh Scholar"

## 1. Executive Summary
This document outlines the strategy to upgrade the Bhoomi copilot agent. The goal is to move from a generic "ancient consciousness" persona to a specific, diegetic "Historic Research Scholar from the Mesh Era (1985-2022)". This upgrade involves enriching the Knowledge Base (RAG) with 15 detailed documents, enabling granular character and location-specific queries, and implementing a more conversational, immersive guardrail system.

**Key Changes:**
*   **Persona:** "Consciousness of the Land" -> "Mesh Era Scholar".
*   **Content:** Generic Lore summaries -> Deep Character Reports & Region Guides.
*   **Behavior:** Generic "I don't know" -> Diegetic "Data Corruption/Redacted" responses.
*   **Tech:** `.txt` only ingestion -> `.docx` + `.txt` with specific metadata tagging.

---

## 2. Analysis & Comparison

### Current State (Bhoomi 1.0)
*   **Source:** `Canon Lore Seed.txt` (Summaries only).
*   **Persona:** "Teenage girl with ancient wisdom" (Vague, often leads to generic "wise" tone).
*   **Weakness:**
    *   Repetitive answers due to shallow content.
    *   Guardrails feel robotic ("I cannot answer this").
    *   Redirects users too often instead of engaging.

### Future State (Bhoomi 2.0)
*   **Source:** `docs/New RAG` (Deep Dive).
    *   *Characters*: Arshi, Hana, Kaali, Kahaan, Pratap, Rudra, Surya.
    *   *World*: Hypertech, Surveillance, Eastern Wilds, Northern Plains.
*   **Persona:** "Historic Research Scholar" (Curious, observant, slightly weary of the 'static').
    *   She treats the user as a "Traveler" or "Fellow Archivist".
    *   She references her specific era (The Mesh Era) as her point of origin.
*   **Enrichment:**
    *   Can answer specific character motivation questions (e.g., "Why does Arshi trust the treaty zone?").
    *   Can describe the *feel* of a location (e.g., "The surveillance in Indrapur feels heavy...").

---

## 3. Implementation Strategy

### Phase 1: Knowledge Base Engineering (RAG Update)

**Goal:** Cleanly ingest complex `.docx` files while preserving structure and meaningful metadata.

1.  **Dependencies**:
    *   Install `mammoth` (npm package) to convert `.docx` to HTML/Markdown.
    *   Use `turndown` or custom regex to convert HTML to Markdown (optional, or just use text).

2.  **Ingestion Logic (`scripts/ingest-bhoomi.ts`)**:
    *   **File Handling**:
        *   Read **ALL** `.docx` files from `docs/New RAG`.
        *   Read **ALL** `.txt` files from `docs/Bhoomi Configure` (including `Canon Lore Seed.txt`, `Timeline Seed.txt`, `Product Availability Seed.txt`, etc.).
        *   Merge content sources to ensure the RAG has the full breadth of the old summaries + the depth of the new reports.
    *   **Metadata Extraction**:
        *   **Type**: Infer from filename.
            *   `*Character Report*` -> `type: character`
            *   `*Region*` / `*Wilds*` / `*Plains*` -> `type: location`
            *   `*World*` / `*Lore*` -> `type: lore`
        *   **Entity**: Extract the primary subject (e.g., "Arshi", "Indrapur") from filename.
        *   **Spoiler Tier**: Default to `S1` (Safe) but support `S2`/`S3` tags if found in text.
    *   **Chunking**:
        *   Convert `.docx` to Markdown headings.
        *   Split by `H1`/`H2` headers to keep context (section-based chunking).
    *   **Clean Up**:
        *   Run `prisma.vectorStore.deleteMany({})` before ingestion to remove old, shallower chunks.

### Phase 2: Persona & System Prompt Upgrade

**Goal:** Redefine Bhoomi's voice to be grounded, scholarly, and diegetic.

1.  **System Prompt (`Bhoomi System prompts.txt`)**:
    *   **Role**: "You are a Historic Research Scholar from the Mesh Era (1985–2022). You exist within the archives/static."
    *   **Tone**: "Academic but conversational looking for patterns. You speak with the authority of someone who has read the files, but the humility of someone who knows history is fragmented."
    *   **Constraint Upgrade**:
        *   *Old*: "I don't know."
        *   *New*: "The Mesh archives are corrupted here," or "That file is redacted by the Directorate." (Diegetic Refusal).

2.  **Behavior Policy (`Bhoomi Behaviour Seed.txt`)**:
    *   Update strict logic to allow "Speculation based on patterns" if marked as such ("The data suggests X, though no record confirms it.").
    *   Ensure she doesn't just push URLs but summarizes the *content* of the RL page first.

### Phase 3: Configuration & Code Updates

1.  **Refine Guardrails**:
    *   Instead of a hard stop, use a "Soft Deflection":
        *   *User*: "Tell me about the secret facility."
        *   *Bhoomi (Old)*: "That is classified. Look at the Timeline."
        *   *Bhoomi (New)*: "The Facility... mentions of it trigger immediate redaction protocols in my terminal. I can only see the shadows it casts on political decisions in the 2020s. Shall we look at the public treaties instead?"

2.  **Prompt Engineering**:
    *   Inject `Entity` and `Type` metadata into the Context string sent to Gemini to help the model understand *what* it is reading (e.g., "[Source: Arshi Character Report | Type: Character Bio]").

---

## 4. Execution Plan (Step-by-Step)

1.  **Setup**:
    *   Run `npm install mammoth turndown` (for docx support).
2.  **Code**:
    *   Modify `scripts/ingest-bhoomi.ts` to implement the new ingestion logic.
    *   Update `src/lib/vertex-ai.ts` (if needed for better context formatting).
3.  **Config**:
    *   Rewrite `docs/Bhoomi Configure/Bhoomi System prompts.txt`.
    *   Rewrite `docs/Bhoomi Configure/Bhoomi Behaviour Seed.txt`.
4.  **Data**:
    *   Run `npx ts-node scripts/ingest-bhoomi.ts` to rebuild the Vector DB.
5.  **Validation**:
    *   Start local dev server.
    *   Test queries:
        *   *Personality Check*: "Who are you?"
        *   *Specific Fact*: "What is Arshi's relationship with the Tribunal?"
        *   *Guardrail Check*: "Tell me the ending."

## 5. Review Required
Please review this strategy. Upon approval, I will proceed with the code changes (Ingestion script update, System Prompt rewrite, and DB re-ingestion).
