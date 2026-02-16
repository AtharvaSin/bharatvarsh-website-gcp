---
name: ingest_lore
description: Ingests narrative content (.docx, .txt) into the vector database for the Bhoomi AI RAG system.
---
# Ingest Lore Skill

This skill automates the process of parsing, chunking, and embedding narrative content into the PostgreSQL vector database using the `scripts/ingest-bhoomi.ts` script.

## Pre-requisites
- Ensure `.env` contains valid `DATABASE_URL` and `GOOGLE_VERTEX_AI_API_KEY` (or default credentials).
- Ensure `docs/New RAG` contains the source `.docx` files.
- Ensure dependencies `mammoth` and `turndown` are installed (run `npm install` if unsure).

## Usage
1.  **Run Ingestion**: Execute the ingestion script using `npx ts-node`.
2.  **Verify**: Check the output for successful chunk generation and database insertion.

## Command
```bash
npx ts-node scripts/ingest-bhoomi.ts
```

## Verification
After the script completes, you should see output indicating:
- Number of files processed.
- Total chunks created.
- Confirmation of successful database transaction.
