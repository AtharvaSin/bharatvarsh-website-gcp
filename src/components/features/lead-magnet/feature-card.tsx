'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Search, BookOpen, Map, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

// Icon mapping for feature cards
const iconMap: Record<string, FC<{ className?: string }>> = {
  globe: Globe,
  users: Users,
  search: Search,
  'book-open': BookOpen,
  map: Map,
  clock: Clock,
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
  className?: string;
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  index,
  className,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[icon] || BookOpen;

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, delay: index * 0.1 },
      };

  return (
    <motion.div
      {...animationProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative p-6 rounded-lg overflow-hidden',
        'bg-[var(--obsidian-900)]',
        'border border-[var(--obsidian-600)]',
        'transition-all duration-300',
        'hover:border-[var(--mustard-500)]/50',
        'hover:shadow-[0_0_30px_rgba(241,194,50,0.1)]',
        className
      )}
    >
      {/* Hover glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.15 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, var(--mustard-500) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Icon with enhanced styling */}
      <motion.div
        animate={isHovered && !prefersReducedMotion ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative w-12 h-12 rounded-lg flex items-center justify-center mb-4',
          'bg-[var(--mustard-500)]/10',
          'transition-all duration-300',
          isHovered && 'bg-[var(--mustard-500)]/20 shadow-[0_0_15px_rgba(241,194,50,0.2)]'
        )}
      >
        <Icon className="w-6 h-6 text-[var(--mustard-500)]" />
      </motion.div>

      {/* Title with subtle glow on hover */}
      <h3 className={cn(
        'relative text-lg font-semibold mb-2',
        'text-[var(--text-primary)]',
        'transition-colors duration-300',
        isHovered && 'text-[var(--powder-300)]'
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className="relative text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>

      {/* Bottom accent line on hover */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--mustard-500)] via-[var(--mustard-500)]/50 to-transparent origin-left"
      />
    </motion.div>
  );
};

export default FeatureCard;
