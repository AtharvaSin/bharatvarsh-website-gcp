'use client';

import { FC, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const DossierModal: FC<DossierModalProps> = ({
  isOpen,
  onClose,
  title = 'Verify to Unlock the Dossier',
  children,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap - keep focus within modal
  const handleTabKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    },
    []
  );

  // Lock scroll and set up event listeners when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Add event listeners
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);

      // Focus the modal after a brief delay
      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector('button');
        closeButton?.focus();
      }, 50);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);

      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscape, handleTabKey]);

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.2 },
      };

  const backdropAnimationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...backdropAnimationProps}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[var(--obsidian-950)]/90 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal container - centers the modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dossier-modal-title"
          >
            <motion.div
              ref={modalRef}
              {...animationProps}
              className={cn(
                'relative w-full max-w-md max-h-[90vh] overflow-y-auto',
                'bg-gradient-to-br from-[var(--obsidian-800)] to-[var(--obsidian-900)]',
                'border border-[var(--mustard-500)]/30 rounded-xl',
                'shadow-2xl shadow-[var(--mustard-500)]/10'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[var(--obsidian-600)] bg-[var(--obsidian-800)]/95 backdrop-blur-sm">
                <h3
                  id="dossier-modal-title"
                  className="text-lg font-semibold text-[var(--text-primary)]"
                >
                  {title}
                </h3>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className={cn(
                    'w-10 h-10 rounded-full',
                    'bg-[var(--obsidian-700)] hover:bg-[var(--obsidian-600)]',
                    'border border-[var(--obsidian-600)]',
                    'flex items-center justify-center',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--mustard-500)] focus:ring-offset-2 focus:ring-offset-[var(--obsidian-900)]'
                  )}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DossierModal;
