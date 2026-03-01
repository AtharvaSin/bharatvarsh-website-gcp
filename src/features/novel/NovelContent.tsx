'use client';

import { FC, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Globe,
  Users,
  Search,
  Map,
  Clock,
  ArrowRight,
  Mail,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { GlyphWatermark, ParticleField } from '@/shared/ui';
import { WhatAwaitsSection } from '@/features/newsletter';
import novelData from '@/content/data/novel.json';
import type { NovelData, VerifiedStatus } from '@/types';

const iconMap: Record<string, FC<{ className?: string }>> = {
  globe: Globe,
  users: Users,
  search: Search,
  map: Map,
  'book-open': BookOpen,
  clock: Clock,
};

// Inner component that uses search params
function NovelPageInner() {
  const data = novelData as NovelData;
  const searchParams = useSearchParams();
  const verifiedStatus = searchParams.get('verified') as VerifiedStatus;

  return (
    <div className="min-h-screen bg-[var(--obsidian-900)]">
      {/* Hero Section - Book Cover Style */}
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)] via-[var(--obsidian-900)] to-[var(--obsidian-900)]" />

        {/* Trishul Glyph Watermark */}
        <GlyphWatermark
          glyph="trishul"
          opacity={0.025}
          size="90%"
          position="center"
          color="var(--mustard-500)"
          animate={true}
          animationType="pulse"
        />

        {/* Ambient Particle Field */}
        <ParticleField
          count={25}
          color="rgba(241, 194, 50, 0.2)"
          minSize={1}
          maxSize={3}
          speed={0.1}
          driftUp={true}
          style="dust"
          coverage="viewport"
          zIndex={1}
        />

        {/* Decorative elements - enhanced */}
        <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 md:top-20 -left-10 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-[var(--mustard-500)] rounded-full blur-[80px] md:blur-[128px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-10 md:bottom-20 -right-10 md:right-10 w-64 md:w-96 h-64 md:h-96 bg-[var(--powder-500)] rounded-full blur-[80px] md:blur-[128px]"
          />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Book Cover */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 flex justify-center"
            >
              <div className="relative group">
                {/* Animated glow ring behind book */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -inset-8 rounded-xl"
                  style={{
                    background: 'radial-gradient(ellipse at center, var(--mustard-500) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />

                {/* Book shadow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[var(--navy-900)] to-black/50 rounded-lg blur-xl opacity-50" />

                {/* Book cover image with hover effects */}
                <motion.div
                  whileHover={{ scale: 1.02, rotateY: -3 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-[280px] md:w-[320px] lg:w-[360px] aspect-[2/3] rounded-lg shadow-2xl overflow-hidden"
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                >
                  <Image
                    src="/images/novel-cover.png"
                    alt="Bharatvarsh Novel Cover"
                    fill
                    className="object-cover transition-all duration-500 group-hover:brightness-110"
                    priority
                  />

                  {/* Spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 to-transparent" />

                  {/* Subtle shine effect on hover */}
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{ x: '200%', opacity: 0.2 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
                  />
                </motion.div>

                {/* Coming soon badge with pulse */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 -right-3"
                >
                  <Badge variant="mustard" className="shadow-lg">
                    {data.novel.status}
                  </Badge>
                </motion.div>
              </div>
            </motion.div>

            {/* Book Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {data.novel.genre.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[var(--powder-300)] tracking-tight mb-4">
                {data.novel.title}
              </h1>

              <p className="text-xl md:text-2xl text-[var(--mustard-500)] font-serif italic mb-6">
                {data.novel.subtitle}
              </p>

              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                {data.novel.tagline}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
                {data.purchase.available ? (
                  data.purchase.platforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button variant={platform.name.includes('Notion') ? 'primary' : 'outline'} size="lg" className="w-full">
                        {platform.name.includes('Notion') ? (
                          <BookOpen className="w-5 h-5 mr-2" />
                        ) : (
                          <ShoppingCart className="w-5 h-5 mr-2" />
                        )}
                        Buy on {platform.name}
                      </Button>
                    </a>
                  ))
                ) : (
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    <Mail className="w-5 h-5 mr-2" />
                    Get Notified
                  </Button>
                )}
                <Link href="/lore" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explore the World
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Synopsis Section */}
      <section className="py-16 md:py-24 border-t border-[var(--obsidian-700)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-[var(--powder-300)] mb-8 text-center">
                The Story
              </h2>

              <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
                <p className="text-xl font-serif italic text-[var(--powder-400)] text-center">
                  {data.synopsis.hook}
                </p>

                <div className="w-24 h-0.5 bg-[var(--obsidian-600)] mx-auto my-8" />

                <p>{data.synopsis.description}</p>
                <p>{data.synopsis.plot}</p>
                <p>{data.synopsis.stakes}</p>

                <p className="text-xl font-serif italic text-[var(--mustard-500)] text-center pt-4">
                  {data.synopsis.closing}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Awaits You Section with Lead Magnet */}
      <WhatAwaitsSection
        features={data.features}
        dossierContent={data.dossier}
        sectionContent={data.whatAwaitsYou}
        verifiedStatus={verifiedStatus}
      />

      {/* Author Section */}
      <section className="py-16 md:py-24 border-t border-[var(--obsidian-700)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl text-[var(--powder-300)] mb-8">
              About the Author
            </h2>

            <div className="relative w-24 h-24 rounded-full border border-[var(--obsidian-600)] mx-auto mb-6 overflow-hidden">
              <Image
                src="/images/author-avatar.jpg"
                alt="Atharva Singh"
                fill
                className="object-cover"
              />
            </div>

            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              {data.author.bio}
            </p>
            <p className="text-sm text-[var(--text-muted)] italic">
              {data.author.note}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Related Content Section */}
      <section className="py-16 md:py-24 border-t border-[var(--obsidian-700)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-[var(--powder-300)] mb-8 text-center">
              Explore More
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.related.map((item, index) => {
                const Icon = iconMap[item.icon] || BookOpen;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'group block p-6 rounded-lg',
                        'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-700)]',
                        'border border-[var(--obsidian-600)] hover:border-[var(--powder-500)]',
                        'transition-all duration-200 hover:-translate-y-1'
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg bg-[var(--powder-500)]/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-[var(--powder-400)]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--powder-300)] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-4">
                        {item.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-[var(--powder-400)] group-hover:text-[var(--powder-300)]">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Main export with Suspense boundary for useSearchParams
export function NovelContent() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--obsidian-900)]" />}>
      <NovelPageInner />
    </Suspense>
  );
}
