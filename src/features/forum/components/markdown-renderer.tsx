'use client';

import { FC } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/shared/utils';

/**
 * Classified Chronicle markdown renderer — single source of truth for
 * how forum bodies (threads + replies) render. Consumed by ThreadDetail
 * and PostCard so visual language stays identical across list → detail →
 * replies.
 *
 * - remark-gfm: GitHub Flavored Markdown (tables, strikethrough, task lists, autolinks)
 * - rehype-sanitize: strip unsafe HTML from user-submitted content before render
 *
 * Density presets tune font sizes, margins, and header weight:
 * - 'thread': main post body. Larger type, wider spacing.
 * - 'reply':  nested reply card. Compact type, tighter spacing.
 *
 * Custom treatments:
 * - `h3` keeps the mustard-dossier accent (Ground Rules idiom from the seed threads)
 * - Inline `code` → mono chip; fenced ```code``` → dossier block with mustard stripe
 * - `em` → Fraunces italic in powder-signal (pullquote voice)
 * - blockquote → mustard-dossier left stripe + obsidian-deep ground
 * - `~~strikethrough~~` → black [REDACTED] bar (on-brand Easter egg)
 * - `<hr>` → dashed mustard rule at 40% opacity
 */

type Density = 'thread' | 'reply';

interface DossierMarkdownProps {
  body: string;
  density?: Density;
  className?: string;
}

/** Build the component override map for a given density. */
function buildComponents(density: Density): Components {
  const isThread = density === 'thread';

  // Body paragraph + list text
  const pSize = isThread ? 'text-base' : 'text-sm';
  const pLead = isThread ? 'leading-[1.7]' : 'leading-relaxed';
  const pMb = isThread ? 'mb-4' : 'mb-3';

  // Heading scale (markdown h1 demoted so it doesn't conflict with page h1)
  const h1Size = isThread ? 'text-3xl' : 'text-2xl';
  const h2Size = isThread ? 'text-2xl' : 'text-xl';
  const h3Size = isThread ? 'text-xl' : 'text-lg';
  const h4Size = isThread ? 'text-lg' : 'text-base';

  return {
    // Demoted h1 — markdown-authored h1 becomes a visual h2 to avoid collision
    // with the page-level h1 already rendered by ThreadDetail.
    h1: ({ children }) => (
      <h2 className={cn('font-display uppercase tracking-tight mt-8 mb-4', h1Size)} style={{ color: 'var(--bone-text)' }}>
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2 className={cn('font-display uppercase tracking-tight mt-8 mb-4', h2Size)} style={{ color: 'var(--bone-text)' }}>
        {children}
      </h2>
    ),
    // h3 → Ground Rules idiom from the seed threads: mustard accent, semibold sans
    h3: ({ children }) => (
      <h3 className={cn('font-sans font-semibold uppercase tracking-wider mt-6 mb-3', h3Size)} style={{ color: 'var(--mustard-dossier)' }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={cn('font-sans font-semibold mt-5 mb-2', h4Size)} style={{ color: 'var(--bone-text)' }}>
        {children}
      </h4>
    ),

    // Paragraph
    p: ({ children }) => (
      <p className={cn('font-sans', pSize, pLead, pMb)} style={{ color: 'var(--steel-text)' }}>
        {children}
      </p>
    ),

    // Emphasis
    strong: ({ children }) => (
      <strong className="font-semibold" style={{ color: 'var(--bone-text)' }}>
        {children}
      </strong>
    ),
    // Fraunces italic — pullquote voice, powder-signal
    em: ({ children }) => (
      <em className="font-serif italic" style={{ color: 'var(--powder-signal)' }}>
        {children}
      </em>
    ),

    // GFM strikethrough → black [REDACTED] bar
    del: ({ children }) => (
      <span
        className="inline-block px-1 select-none"
        style={{
          backgroundColor: 'var(--bone-text)',
          color: 'transparent',
        }}
        aria-label="redacted"
      >
        {children}
      </span>
    ),

    // Blockquote — mustard-dossier left stripe, obsidian-deep ground, body italic
    blockquote: ({ children }) => (
      <blockquote
        className={cn('border-l-4 pl-5 pr-4 py-3 my-5 font-serif italic')}
        style={{
          borderColor: 'var(--mustard-dossier)',
          backgroundColor: 'var(--obsidian-deep)',
          color: 'var(--powder-signal)',
        }}
      >
        {children}
      </blockquote>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className={cn('list-disc pl-6 space-y-1', pMb, pSize, pLead)} style={{ color: 'var(--steel-text)' }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className={cn('list-decimal pl-6 space-y-1', pMb, pSize, pLead)} style={{ color: 'var(--steel-text)' }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className={cn(pSize, pLead)} style={{ color: 'var(--steel-text)' }}>
        {children}
      </li>
    ),

    // Code — inline chip vs fenced block dossier panel
    code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode } & Record<string, unknown>) => {
      if (inline) {
        return (
          <code
            className="font-mono text-[0.9em] px-1.5 py-0.5"
            style={{
              backgroundColor: 'var(--obsidian-deep)',
              color: 'var(--mustard-dossier)',
              border: '1px solid var(--navy-signal)',
            }}
          >
            {children}
          </code>
        );
      }
      // Fenced block — unstyled here; pre override wraps the dossier frame
      return (
        <code className="font-mono text-xs block" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre
        className="font-mono text-xs p-4 my-5 overflow-x-auto border-l-4"
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderLeftColor: 'var(--mustard-dossier)',
          color: 'var(--bone-text)',
        }}
      >
        {children}
      </pre>
    ),

    // Horizontal rule — dashed mustard at 40%
    hr: () => (
      <hr
        className="my-8 border-t border-dashed"
        style={{ borderColor: 'var(--mustard-dossier)', opacity: 0.4 }}
      />
    ),

    // External links — powder-signal default, mustard-hot on hover (via group)
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--powder-signal)', textDecorationColor: 'var(--mustard-dossier)' }}
      >
        {children}
      </a>
    ),

    // Images — max width, navy hairline frame, optional figcaption from alt
    img: ({ src, alt }) => (
      <span className="block my-5">
        <img
          src={src}
          alt={alt ?? ''}
          className="max-w-full h-auto block"
          style={{ border: '1px solid var(--navy-signal)' }}
        />
        {alt && (
          <span
            className="block font-mono text-[10px] uppercase tracking-[0.18em] mt-2"
            style={{ color: 'var(--shadow-text)' }}
          >
            {alt}
          </span>
        )}
      </span>
    ),

    // GFM tables — thin navy-signal borders, mono uppercase column headers
    table: ({ children }) => (
      <div className="my-5 overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          style={{ borderColor: 'var(--navy-signal)' }}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead
        style={{
          backgroundColor: 'var(--obsidian-deep)',
          borderBottom: '1px solid var(--mustard-dossier)',
        }}
      >
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr style={{ borderBottom: '1px solid var(--navy-signal)' }}>{children}</tr>
    ),
    th: ({ children }) => (
      <th
        className="text-left font-mono uppercase text-[10px] tracking-[0.18em] px-3 py-2"
        style={{ color: 'var(--mustard-dossier)' }}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-sm" style={{ color: 'var(--steel-text)' }}>
        {children}
      </td>
    ),
  };
}

/**
 * DossierMarkdown — Classified Chronicle markdown renderer for the forum.
 * Centralises remark-gfm + rehype-sanitize + component overrides so every
 * forum body renders with the same voice.
 */
export const DossierMarkdown: FC<DossierMarkdownProps> = ({
  body,
  density = 'thread',
  className,
}) => {
  const components = buildComponents(density);

  return (
    <div className={cn('dossier-markdown max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
};

export default DossierMarkdown;
