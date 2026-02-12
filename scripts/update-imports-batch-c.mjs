/**
 * Mass import path updater for Batch C refactor (feature modules).
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
  // Home feature components (old component paths → new feature paths)
  ["'@/components/features/home'", "'@/features/home'"],
  ["'@/components/features/home/hero-title'", "'@/features/home/components/hero-title'"],
  ["'@/components/features/home/scroll-section'", "'@/features/home/components/scroll-section'"],
  ["'@/components/features/home/content-section'", "'@/features/home/components/content-section'"],
  ["'@/components/features/home/cta-section'", "'@/features/home/components/cta-section'"],
  ["'@/components/features/home/cta-image-card'", "'@/features/home/components/cta-image-card'"],

  // Newsletter / lead-magnet
  ["'@/components/features/lead-magnet'", "'@/features/newsletter'"],
  ["'@/components/features/lead-magnet/dossier-form'", "'@/features/newsletter/components/dossier-form'"],
  ["'@/components/features/lead-magnet/dossier-modal'", "'@/features/newsletter/components/dossier-modal'"],
  ["'@/components/features/lead-magnet/dossier-card'", "'@/features/newsletter/components/dossier-card'"],
  ["'@/components/features/lead-magnet/dossier-download-section'", "'@/features/newsletter/components/dossier-download-section'"],
  ["'@/components/features/lead-magnet/classified-file-card'", "'@/features/newsletter/components/classified-file-card'"],
  ["'@/components/features/lead-magnet/feature-card'", "'@/features/newsletter/components/feature-card'"],
  ["'@/components/features/lead-magnet/what-awaits-section'", "'@/features/newsletter/components/what-awaits-section'"],
  ["'@/hooks/use-dossier-form'", "'@/features/newsletter/hooks/use-dossier-form'"],

  // Lore
  ["'@/components/features/lore'", "'@/features/lore'"],
  ["'@/components/features/lore/lore-card'", "'@/features/lore/components/lore-card'"],
  ["'@/components/features/lore/lore-filters'", "'@/features/lore/components/lore-filters'"],
  ["'@/components/features/lore/lore-hero'", "'@/features/lore/components/lore-hero'"],
  ["'@/components/features/lore/lore-modal'", "'@/features/lore/components/lore-modal'"],

  // Timeline (barrel)
  ["'@/components/features/timeline'", "'@/features/timeline'"],

  // Timeline hooks
  ["'@/hooks/use-timeline-scroll'", "'@/features/timeline/hooks/use-timeline-scroll'"],

  // Content files that moved (from app/ to features/)
  ["'./home-content'", "'@/features/home/HomeContent'"],
  ["'./novel-content'", "'@/features/novel/NovelContent'"],
  ["'./lore-content'", "'@/features/lore/LoreContent'"],
  ["'./timeline-content'", "'@/features/timeline/TimelineContent'"],
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
