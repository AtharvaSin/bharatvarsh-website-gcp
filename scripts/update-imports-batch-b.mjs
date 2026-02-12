/**
 * Mass import path updater for Batch B refactor (content layer).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      results.push(...walk(full));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const replacements = [
  ["'@/data/timeline-phases'", "'@/content/data/timeline-phases'"],
  ["'@/data/timeline.json'", "'@/content/data/timeline.json'"],
  ["'@/data/lore-items.json'", "'@/content/data/lore-items.json'"],
  ["'@/data/novel.json'", "'@/content/data/novel.json'"],
  ["'@/data/scrollytelling.json'", "'@/content/data/scrollytelling.json'"],
  ["'@/data/characters.json'", "'@/content/data/characters.json'"],
  ["'@/data/factions.json'", "'@/content/data/factions.json'"],
  ["'@/data/locations.json'", "'@/content/data/locations.json'"],
  ["'@/lib/data'", "'@/content/loaders'"],
];

const files = walk(join(ROOT, 'src'));
let totalChanges = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let changed = false;

  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(file, content, 'utf-8');
    totalChanges++;
    console.log(`Updated: ${file.replace(ROOT, '').replace(/\\/g, '/')}`);
  }
}

console.log(`\nTotal files updated: ${totalChanges}`);
