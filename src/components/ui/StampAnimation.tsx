'use client';

import { FC, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type StampType =
  | 'access' // "ACCESS GRANTED" stamp
  | 'classified' // "CLASSIFIED" stamp
  | 'declassified' // "DECLASSIFIED" stamp
  | 'approved' // "APPROVED" stamp
  | 'processed' // "PROCESSED" stamp
  | 'custom'; // Custom text stamp

export interface StampAnimationProps {
  /** Children to wrap with stamp effect */
  children: ReactNode;
  /** Type of stamp to show. Default: 'access' */
  stampType?: StampType;
  /** Custom stamp text (when stampType is 'custom') */
  customText?: string;
  /** Color of the stamp. Default: 'var(--mustard-500)' */
  color?: string;
  /** Whether stamp is enabled. Default: true */
  enabled?: boolean;
  /** Duration of stamp visibility in ms. Default: 1000 */
  stampDuration?: number;
  /** Position of stamp: 'center' | 'corner'. Default: 'center' */
  position?: 'center' | 'corner';
  /** Callback when stamp animation completes */
  onStampComplete?: () => void;
  /** Additional className for wrapper */
  className?: string;
}

interface StampInstance {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

/**
 * StampAnimation - War-room style stamp confirmation effect
 *
 * Provides visual feedback for card/button clicks with a
 * "document stamped" effect that reinforces the archive aesthetic.
 */
export const StampAnimation: FC<StampAnimationProps> = ({
  children,
  stampType = 'access',
  customText,
  color = 'var(--mustard-500)',
  enabled = true,
  stampDuration = 1000,
  position = 'center',
  onStampComplete,
  className,
}) => {
  const [stamps, setStamps] = useState<StampInstance[]>([]);

  // Get stamp text based on type
  const getStampText = useCallback(() => {
    switch (stampType) {
      case 'access':
        return 'ACCESS GRANTED';
      case 'classified':
        return 'CLASSIFIED';
      case 'declassified':
        return 'DECLASSIFIED';
      case 'approved':
        return 'APPROVED';
      case 'processed':
        return 'PROCESSED';
      case 'custom':
        return customText || 'CONFIRMED';
      default:
        return 'CONFIRMED';
    }
  }, [stampType, customText]);

  // Handle click to trigger stamp
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      let x: number, y: number;

      if (position === 'corner') {
        x = rect.width - 60;
        y = rect.height - 30;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }

      const newStamp: StampInstance = {
        id: Date.now(),
        x,
        y,
        rotation: -8 + Math.random() * 6,
      };

      setStamps((prev) => [...prev, newStamp]);

      // Remove stamp after duration
      setTimeout(() => {
        setStamps((prev) => prev.filter((s) => s.id !== newStamp.id));
        onStampComplete?.();
      }, stampDuration);
    },
    [enabled, position, stampDuration, onStampComplete]
  );

  const stampText = getStampText();

  return (
    <div
      className={cn('relative', className)}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {stamps.map((stamp) => (
          <motion.div
            key={stamp.id}
            className="absolute pointer-events-none"
            style={{
              left: stamp.x,
              top: stamp.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
            }}
            initial={{
              scale: 2,
              opacity: 0,
              rotate: -15,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: stamp.rotation,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 300,
              duration: 0.3,
            }}
          >
            {/* Stamp visual */}
            <div
              className="relative px-4 py-2 border-2 rounded-sm"
              style={{
                borderColor: color,
                backgroundColor: 'transparent',
              }}
            >
              {/* Stamp text */}
              <span
                className="font-mono text-xs font-bold tracking-wider whitespace-nowrap"
                style={{ color }}
              >
                {stampText}
              </span>

              {/* Ink splash effect */}
              <motion.div
                className="absolute inset-0 rounded-sm"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                }}
              />

              {/* Impact rings */}
              <motion.div
                className="absolute inset-0 rounded-sm"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  border: `1px solid ${color}`,
                }}
              />
            </div>

            {/* Dust particles on stamp */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: color,
                  left: stamp.x > 0 ? '50%' : '50%',
                  top: '50%',
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0.6,
                  scale: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 40,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.02,
                }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * useStampTrigger - Hook for programmatic stamp triggering
 *
 * Use this when you need to trigger stamps without wrapping
 * components in StampAnimation.
 */
export const useStampTrigger = () => {
  const [isTriggered, setIsTriggered] = useState(false);

  const triggerStamp = useCallback(() => {
    setIsTriggered(true);
  }, []);

  const resetStamp = useCallback(() => {
    setIsTriggered(false);
  }, []);

  return { isTriggered, triggerStamp, resetStamp };
};

/**
 * Standalone stamp component for use without wrapping children
 * Used with useStampTrigger hook for programmatic control
 */
export interface StandaloneStampProps {
  /** Type of stamp: 'access' | 'classified' | 'declassified' */
  type?: 'access' | 'classified' | 'declassified';
  /** Color of the stamp */
  color?: string;
  /** Size: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Position within parent */
  position?: 'center' | 'top-right';
  className?: string;
}

export const StandaloneStamp: FC<StandaloneStampProps> = ({
  type = 'access',
  color = 'var(--mustard-500)',
  size = 'md',
  position = 'center',
  className,
}) => {
  const stampText = {
    access: 'ACCESS GRANTED',
    classified: 'CLASSIFIED',
    declassified: 'DECLASSIFIED',
  }[type];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-1',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2',
  }[size];

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-4 right-4',
  }[position];

  // Pre-compute random rotation to avoid calling Math.random during render
  const [rotation] = useState(() => -8 + Math.random() * 6);

  return (
    <motion.div
      className={cn('absolute pointer-events-none', positionClasses, className)}
      style={{ zIndex: 100 }}
      initial={{
        scale: 2,
        opacity: 0,
        rotate: -15,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        rotate: rotation,
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300,
        duration: 0.3,
      }}
    >
      {/* Stamp visual */}
      <div
        className={cn('relative border-2 rounded-sm', sizeClasses)}
        style={{
          borderColor: color,
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}
      >
        {/* Stamp text */}
        <span
          className="font-mono font-bold tracking-wider whitespace-nowrap"
          style={{ color }}
        >
          {stampText}
        </span>

        {/* Ink splash effect */}
        <motion.div
          className="absolute inset-0 rounded-sm"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          }}
        />

        {/* Impact rings */}
        <motion.div
          className="absolute inset-0 rounded-sm"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            border: `1px solid ${color}`,
          }}
        />
      </div>
    </motion.div>
  );
};

export default StampAnimation;
