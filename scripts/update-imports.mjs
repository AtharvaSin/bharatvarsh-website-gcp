/**
 * Mass import path updater for Batch A refactor.
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

// Ordered replacements (more specific first)
const replacements = [
  ["'@/components/ui/button'", "'@/shared/ui/button'"],
  ["'@/components/ui/badge'", "'@/shared/ui/badge'"],
  ["'@/components/ui/card'", "'@/shared/ui/card'"],
  ["'@/components/ui'", "'@/shared/ui'"],
  ["'@/components/layout/header'", "'@/shared/layout/header'"],
  ["'@/components/layout/footer'", "'@/shared/layout/footer'"],
  ["'@/components/layout/LayoutProvider'", "'@/shared/layout/LayoutProvider'"],
  ["'@/components/layout'", "'@/shared/layout'"],
  ["'@/hooks/use-media-query'", "'@/shared/hooks/use-media-query'"],
  ["'@/hooks/use-device-capability'", "'@/shared/hooks/use-device-capability'"],
  ["'@/hooks/use-adaptive-animations'", "'@/shared/hooks/use-adaptive-animations'"],
  ["'@/lib/utils'", "'@/shared/utils'"],
  ["from '@/hooks'", "from '@/shared/hooks'"],
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
