'use client';

import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileLock2, CheckCircle2, Mail, Shield } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui/button';
import { useDossierForm } from '@/features/newsletter/hooks/use-dossier-form';
import { useIsDesktop, usePrefersReducedMotion } from '@/shared/hooks/use-media-query';
import { DossierForm } from './dossier-form';
import { DossierModal } from './dossier-modal';
import { DossierDownloadSection } from './dossier-download-section';
import type { DossierContent, DossierState } from '@/types';

interface DossierCardProps {
  content: DossierContent;
  initialState?: DossierState;
  index?: number;
  className?: string;
}

export const DossierCard: FC<DossierCardProps> = ({
  content,
  initialState = 'idle',
  index = 0,
  className,
}) => {
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = usePrefersReducedMotion();

  const {
    state,
    formData,
    errors,
    resendCountdown,
    submittedEmail,
    setField,
    validateField,
    submit,
    resend,
    expand,
    collapse,
    setVerified,
  } = useDossierForm({ initialState });

  useEffect(() => {
    if (initialState === 'verified') {
      setVerified();
    }
  }, [initialState, setVerified]);

  const handleCTAClick = (): void => {
    expand();
  };

  const handleModalClose = (): void => {
    collapse();
  };

  const handleSubmit = async (): Promise<void> => {
    await submit();
  };

  const handleResend = async (): Promise<void> => {
    await resend();
  };

  const cardAnimationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, delay: index * 0.1 },
      };

  const contentAnimationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto' },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const },
      };

  const showModal = !isDesktop && (state === 'expanded' || state === 'submitting');
  const showInlineForm = isDesktop && (state === 'expanded' || state === 'submitting');

  return (
    <>
      <motion.div
        {...cardAnimationProps}
        className={cn('relative', className)}
      >
        {/* Outer Glow for Priority - Simplified */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  opacity: state === 'verified' ? [0.15, 0.25, 0.15] : [0.2, 0.35, 0.2],
                }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={cn(
            'absolute -inset-1 rounded-2xl blur-xl pointer-events-none',
            state === 'verified'
              ? 'bg-[var(--status-success)]/30'
              : 'bg-[var(--mustard-500)]/25'
          )}
        />

        {/* Card Container - Glass Morphism Style */}
        <div
          className={cn(
            'relative h-full rounded-2xl overflow-hidden',
            'bg-black/40 backdrop-blur-lg',
            'border transition-all duration-300',
            state === 'verified'
              ? 'border-[var(--status-success)]/30'
              : 'border-white/10 hover:border-[var(--mustard-500)]/30'
          )}
        >
          {/* Card Header - Simplified */}
          <div
            className={cn(
              'p-4 border-b',
              state === 'verified'
                ? 'border-[var(--status-success)]/20 bg-[var(--status-success)]/5'
                : 'border-[var(--mustard-500)]/20 bg-[var(--mustard-500)]/5'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs font-mono tracking-wider',
                    state === 'verified'
                      ? 'text-[var(--status-success)]'
                      : 'text-[var(--mustard-500)]'
                  )}
                >
                  DOSSIER-001
                </span>
                <motion.div
                  animate={prefersReducedMotion ? {} : { opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    state === 'verified' ? 'bg-[var(--status-success)]' : 'bg-[var(--mustard-500)]'
                  )}
                />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider',
                  state === 'verified'
                    ? 'bg-[var(--status-success)]/20 text-[var(--status-success)]'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                <Shield className="w-3 h-3" />
                {state === 'verified' ? 'CLEARED' : 'PRIORITY'}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="relative p-6">
            {/* Eyebrow + PDF Chip */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={cn(
                  'text-[10px] font-mono tracking-widest',
                  state === 'verified'
                    ? 'text-[var(--status-success)]'
                    : 'text-[var(--mustard-500)]'
                )}
              >
                {content.eyebrow}
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded',
                  state === 'verified'
                    ? 'bg-[var(--status-success)]/20 text-[var(--status-success)]'
                    : 'bg-[var(--mustard-500)]/20 text-[var(--mustard-500)]'
                )}
              >
                {content.pdfChip}
              </span>
            </div>

            {/* Icon */}
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-5 border',
                state === 'verified'
                  ? 'bg-[var(--status-success)]/10 border-[var(--status-success)]/30'
                  : 'bg-[var(--mustard-500)]/10 border-[var(--mustard-500)]/30'
              )}
            >
              {state === 'verified' ? (
                <CheckCircle2 className="w-7 h-7 text-[var(--status-success)]" />
              ) : (
                <FileLock2 className="w-7 h-7 text-[var(--mustard-500)]" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-display text-[var(--powder-300)] mb-3">
              {content.title}
            </h3>

            {/* Body - Show different content based on state */}
            <AnimatePresence mode="wait">
              {state === 'idle' && (
                <motion.div
                  key="idle"
                  {...(prefersReducedMotion
                    ? {}
                    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
                >
                  <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                    {content.body}
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCTAClick}
                    className={cn(
                      'w-full min-h-[52px] font-mono tracking-wide',
                      'bg-[var(--mustard-500)] hover:bg-[var(--mustard-500)]/90',
                      'text-[var(--obsidian-900)] font-semibold'
                    )}
                  >
                    <FileLock2 className="w-5 h-5 mr-2" />
                    {content.cta}
                  </Button>
                </motion.div>
              )}

              {state === 'submitted' && (
                <motion.div
                  key="submitted"
                  {...(prefersReducedMotion
                    ? {}
                    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30">
                    <Mail className="w-5 h-5 text-[var(--status-success)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[var(--status-success)]">
                        {content.submittedMessage}
                      </p>
                      {submittedEmail && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                          Sent to: {submittedEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleResend}
                    disabled={resendCountdown > 0}
                    className="w-full min-h-[52px] font-mono"
                  >
                    {resendCountdown > 0
                      ? `${content.resendButton} (${resendCountdown}s)`
                      : content.resendButton}
                  </Button>
                </motion.div>
              )}

              {state === 'verified' && (
                <motion.div
                  key="verified"
                  {...(prefersReducedMotion
                    ? {}
                    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
                >
                  {/* Success Message */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30">
                    <CheckCircle2 className="w-5 h-5 text-[var(--status-success)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-[var(--status-success)]">
                      {content.verifiedMessage}
                    </p>
                  </div>

                  {/* Download Section */}
                  <DossierDownloadSection
                    pdfPath="/downloads/Bharatvarsh-Dossier-Chapter-1.pdf"
                    fileName={content.pdfFileName || 'Bharatvarsh Dossier - Chapter 1.pdf'}
                    fileSize={content.pdfSize}
                    chapterTitle={content.downloadTitle}
                    subtitle={content.downloadSubtitle}
                    downloadCta={content.downloadCta}
                    downloadedMessage={content.downloadedMessage}
                  />

                  {/* Clearance Timestamp */}
                  <div className="mt-4 pt-4 border-t border-[var(--obsidian-700)]">
                    <span className="font-mono text-[10px] text-[var(--status-success)] tracking-wider">
                      CLEARANCE VERIFIED • {new Date().toLocaleDateString('en-US')}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Form (Desktop only) */}
            <AnimatePresence>
              {showInlineForm && (
                <motion.div
                  key="inline-form"
                  {...contentAnimationProps}
                  className="overflow-hidden"
                >
                  <div className="pt-5 border-t border-[var(--obsidian-600)] mt-5">
                    <DossierForm
                      content={content}
                      formData={formData}
                      errors={errors}
                      isSubmitting={state === 'submitting'}
                      onFieldChange={setField}
                      onFieldBlur={validateField}
                      onSubmit={handleSubmit}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Modal for Mobile/Tablet */}
      <DossierModal isOpen={showModal} onClose={handleModalClose} title={content.expandedTitle}>
        <DossierForm
          content={content}
          formData={formData}
          errors={errors}
          isSubmitting={state === 'submitting'}
          onFieldChange={setField}
          onFieldBlur={validateField}
          onSubmit={handleSubmit}
        />
      </DossierModal>
    </>
  );
};

export default DossierCard;
