'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LoreHero,
  LoreFilters,
  LoreCard,
  LoreModal,
} from '@/components/features/lore';
import loreData from '@/data/lore-items.json';
import type { LoreItem, LoreCategory, LoreData } from '@/types';

type FilterValue = LoreCategory | 'all';

export function LoreContent() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selectedItem, setSelectedItem] = useState<LoreItem | null>(null);

  const data = loreData as LoreData;

  const filteredItems = useMemo(() => {
    const items =
      filter === 'all'
        ? data.lore
        : data.lore.filter((item) => item.category === filter);
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data.lore, filter]);

  const counts = useMemo(
    () => ({
      all: data.lore.length,
      characters: data.lore.filter((i) => i.category === 'characters').length,
      locations: data.lore.filter((i) => i.category === 'locations').length,
      factions: data.lore.filter((i) => i.category === 'factions').length,
      tech: data.lore.filter((i) => i.category === 'tech').length,
    }),
    [data.lore]
  );

  return (
    <div className="min-h-screen bg-[var(--obsidian-900)]">
      {/* Hero Section */}
      <LoreHero />

      {/* Main Content */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
          {/* Filters */}
          <LoreFilters
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
            className="mb-10"
          />

          {/* Cards Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <LoreCard item={item} onClick={() => setSelectedItem(item)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[var(--text-muted)]">
                No items found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Quote */}
      <section className="py-16 md:py-24 border-t border-[var(--obsidian-700)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 text-center">
          <blockquote className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl font-serif italic text-[var(--powder-300)] leading-relaxed">
              &ldquo;In Bharatvarsh, the Mesh sees everything. Every transaction,
              every movement, every word spoken in the open. Peace has a price.
              Most have stopped counting.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* Modal */}
      <LoreModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
