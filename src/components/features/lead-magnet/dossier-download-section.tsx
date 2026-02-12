'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface DossierDownloadSectionProps {
  pdfPath: string;
  fileName: string;
  fileSize?: string;
  chapterTitle?: string;
  subtitle?: string;
  downloadCta?: string;
  downloadedMessage?: string;
  className?: string;
}

export const DossierDownloadSection: FC<DossierDownloadSectionProps> = ({
  pdfPath,
  fileName,
  fileSize = '347 KB',
  chapterTitle = 'Chapter 1: The Last Friday',
  subtitle,
  downloadCta = 'Download Chapter 1',
  downloadedMessage = 'Downloaded successfully',
  className,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const handleDownload = async (): Promise<void> => {
    if (isDownloading) return;

    setIsDownloading(true);

    // Create download link
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success state after brief delay
    setTimeout(() => {
      setIsDownloading(false);
      setHasDownloaded(true);
    }, 1000);
  };

  const containerAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.2 },
      };

  return (
    <motion.div
      {...containerAnimation}
      className={cn(
        'mt-6 p-5 rounded-xl',
        'bg-gradient-to-br from-[var(--status-success)]/10 to-transparent',
        'border border-[var(--status-success)]/20',
        className
      )}
    >
      {/* Unlocked Badge */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={prefersReducedMotion ? {} : {
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Sparkles className="w-4 h-4 text-[var(--mustard-500)]" />
        </motion.div>
        <span className="text-xs font-mono tracking-wider text-[var(--mustard-500)] uppercase">
          Dossier Unlocked
        </span>
      </div>

      {/* File Preview */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-16 rounded-lg bg-[var(--obsidian-700)] flex items-center justify-center border border-[var(--obsidian-600)] flex-shrink-0">
          <FileText className="w-6 h-6 text-[var(--powder-400)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-base text-[var(--powder-300)] mb-1">
            {chapterTitle}
          </h4>
          <p className="text-sm text-[var(--text-muted)]">
            PDF Document {fileSize && `• ${fileSize}`}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] mt-2 italic">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Download Button */}
      <Button
        variant={hasDownloaded ? 'secondary' : 'primary'}
        size="lg"
        onClick={handleDownload}
        disabled={isDownloading}
        className={cn(
          'w-full min-h-[52px] font-mono tracking-wide',
          hasDownloaded && 'bg-[var(--status-success)]/20 border-[var(--status-success)] text-[var(--status-success)]'
        )}
      >
        {isDownloading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        ) : hasDownloaded ? (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            {downloadedMessage}
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            {downloadCta}
          </>
        )}
      </Button>

      {/* Redownload Link */}
      {hasDownloaded && (
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-center text-sm text-[var(--text-muted)]"
        >
          <button
            onClick={handleDownload}
            className="underline hover:text-[var(--text-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mustard-500)] focus:ring-offset-2 focus:ring-offset-[var(--obsidian-900)] rounded"
          >
            Download again
          </button>
        </motion.p>
      )}
    </motion.div>
  );
};

export default DossierDownloadSection;
