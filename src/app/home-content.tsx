'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HeroTitle, CTASection, ScrollSection, ParallaxBackground, ContentSection } from '@/components/features/home';
import { cn } from '@/shared/utils';

const sections = [
  { id: 'opening', label: 'Opening' },
  { id: 'the-world', label: 'The World' },
  { id: 'the-regime', label: 'The Regime' },
  { id: 'the-peace', label: 'The Peace' },
  { id: 'the-crack', label: 'The Crack' },
  { id: 'the-hero', label: 'The Hero' },
  { id: 'the-question', label: 'The Question' },
  { id: 'cta', label: 'Explore' },
];

function SectionNav({ activeSection }: { activeSection: string }) {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          title={section.label}
          className={cn(
            "w-3 h-3 rounded-full border-2 border-[var(--powder-300)] transition-all duration-300",
            activeSection === section.id
              ? "bg-[var(--powder-300)] scale-125"
              : "bg-transparent hover:bg-[var(--powder-300)]/50"
          )}
        />
      ))}
    </nav>
  );
}

export function HomeContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [activeSection, setActiveSection] = useState('opening');

  // Track active section with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Progress bar width
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="relative -mt-16 md:-mt-20 snap-y snap-mandatory">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-[var(--mustard-500)] z-[60]"
        style={{ width: progressWidth }}
      />

      {/* Section Navigation Dots */}
      <SectionNav activeSection={activeSection} />

      {/* Section 1: Opening */}
      <ScrollSection
        id="opening"
        height="full"
        background={
          <ParallaxBackground
            imageSrc="/images/landing/bharatvarsh.webp"
            imagePortraitSrc="/images/landing/mobile/opening.webp"
            imageAlt="Bharatvarsh - A nation reimagined"
            imagePriority
            speed={0.3}
            overlayOpacity={0.5}
            gradient="bottom"
            objectPosition="center top"
          />
        }
      >
        <HeroTitle title="BHARATVARSH" subtitle="A tale of truth—and the power that edits it." className="pt-16 md:pt-20" />
      </ScrollSection>

      {/* Section 2: The World */}
      <ScrollSection
        id="the-world"
        height="full"
        background={
          <ParallaxBackground
            imageSrc="/images/landing/refusal.webp"
            imagePortraitSrc="/images/landing/mobile/refusal.webp"
            imageAlt="The Refusal - A different path for India"
            speed={0.4}
            overlayOpacity={0.65}
            gradient="both"
            objectPosition="center center"
          />
        }
      >
        <ContentSection
          headline="India. Familiar in silhouette. Unrecognizable in history."
          content="In 1717, a foreign company came asking for a sweeping charter—tax-free trade, private courts, a country inside a country. Delhi refused. The coast stayed a doorway, not a wound. Wealth circulated instead of draining away. Ideas travelled by guild ledgers and caravan routes, not by conquest—and a new subcontinent learned to build itself on its own terms."
          glyph="chakra"
          dramaticReveal
        />
      </ScrollSection>

      {/* Section 3: The Regime */}
      <ScrollSection
        id="the-regime"
        height="full"
        background={
          <ParallaxBackground
            imageSrc="/images/landing/mesh.webp"
            imagePortraitSrc="/images/landing/mobile/mesh.webp"
            imageAlt="The Mesh - Surveillance and control"
            speed={0.35}
            overlayOpacity={0.6}
            gradient="both"
            objectPosition="center center"
          />
        }
      >
        <ContentSection
          headline="Four decades of order. Engineered. Enforced."
          content={`After the republic buckled under riots and paralysis, the uniform stepped in "for one year"—and never stepped out. Today the Directorate rules by doctrine and infrastructure: a nation where services arrive on time, and so do consequences. The Mesh sits everywhere—wallets, gates, streets, eyes—making convenience indistinguishable from compliance. Corruption fell. So did anonymity.`}
          glyph="mesh"
        />
      </ScrollSection>

      {/* Section 4: The Peace */}
      <ScrollSection
        id="the-peace"
        height="full"
        background={
          <ParallaxBackground
            imageSrc="/images/landing/commute.webp"
            imagePortraitSrc="/images/landing/mobile/commute.webp"
            imageAlt="Daily life in Bharatvarsh"
            speed={0.4}
            overlayOpacity={0.55}
            gradient="both"
            objectPosition="center center"
          />
        }
      >
        <ContentSection
          headline="Stability feels like home—until you notice the locks."
          content="Clean boulevards. Silent glide-cars. Oxy-poles scrubbing the air. Vertical gardens climbing towers no one truly owns. Children grow up thinking checkpoints are just another kind of streetlight. The older generation remembers the decade when timetables collapsed, curfews became routine, and fear did the governing—so they teach gratitude like a survival skill."
          subtext="Most of the time, it works."
          glyph="grid"
        />
      </ScrollSection>

      {/* Section 5: The Crack */}
      <ScrollSection
        id="the-crack"
        height="full"
        background={
          <ParallaxBackground
            imageSrc="/images/landing/20-10.webp"
            imagePortraitSrc="/images/landing/mobile/20-10.webp"
            imageAlt="The 20-10 bombings"
            speed={0.3}
            overlayOpacity={0.55}
            gradient="both"
            objectPosition="center center"
          />
        }
      >
        <ContentSection
          headline="20–10"
          content={`October 20th. Not a war—an interruption. Decoys dragged responders off-route; timed devices hit stations, markets, and civic hubs. The body-count was "manageable," the officials said. But something else was damaged: the public's faith that the Mesh sees everything, that the lattice has no blind spots.`}
          subtext="Someone learned how to move where the cameras don't look. Someone proved the system can be surprised."
          accentColor="var(--status-alert)"
          dramaticReveal
        />
      </ScrollSection>

      {/* Section 6: The Hero */}
      <ScrollSection
        id="the-hero"
        height="full"
        background={
          <ParallaxBackground
            imageSrc="/images/landing/kahaan.webp"
            imagePortraitSrc="/images/landing/mobile/kahaan.webp"
            imageAlt="Kahaan - The protagonist"
            speed={0.35}
            overlayOpacity={0.5}
            gradient="both"
            objectPosition="center top"
          />
        }
      >
        <ContentSection
          headline="Kahaan"
          content={`A Major of the Bharatsena. A "military prince" raised inside the doctrine, groomed for command, fluent in the language of strategy and control. When 20–10 hits, the Council hands him the case—because he is what the state trusts most: precise, ambitious, unshakably capable.`}
          subtext="What he doesn't yet understand is the cost of competence in a perfect machine: every answer pulls a deeper thread, and every thread leads closer to the hands that built the cage."
          accentColor="var(--mustard-500)"
          glyph="trishul"
          dramaticReveal
        />
      </ScrollSection>

      {/* Section 7: The Question */}
      <ScrollSection
        id="the-question"
        height="full"
        background={
          <ParallaxBackground
            imageSrc="/images/landing/question.webp"
            imagePortraitSrc="/images/landing/mobile/question.webp"
            imageAlt="The Question - What would you sacrifice?"
            speed={0.4}
            overlayOpacity={0.6}
            gradient="both"
            objectPosition="center center"
          />
        }
      >
        <ContentSection
          headline="What would you sacrifice for the truth?"
          content="In Bharatvarsh, safety is real—and so is the surrender it demands. The Tribhuj returns like a banned verse spoken aloud: a creed of choice resurfacing in a nation trained to treat choice as a threat. Kahaan must decide what he is willing to break to find what's hidden—because here, the most dangerous thing isn't a bomb."
          subtext="It's a fact the state can't absorb."
          glyph="script"
          dramaticReveal
        />
      </ScrollSection>

      {/* Section 8: CTA */}
      <ScrollSection
        id="cta"
        height="full"
        className="bg-[var(--obsidian-900)]"
      >
        <CTASection />
      </ScrollSection>
    </div>
  );
}
