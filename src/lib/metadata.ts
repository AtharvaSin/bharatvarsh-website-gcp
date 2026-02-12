import type { Metadata } from 'next';

/**
 * Site-wide configuration for metadata
 */
export const siteConfig = {
  name: 'Bharatvarsh',
  url: 'https://bharatvarsh-website.vercel.app',
  defaultImage: '/images/novel-cover.png',
  description:
    'A military prince is given a case of national importance whose investigation forces him to cross boundaries of nations and generations, uncovering deep dark secrets about the military and himself.',
  twitter: {
    site: '@bharatvarsh',
    creator: '@bharatvarsh',
  },
} as const;

/**
 * Page-specific metadata configuration
 */
export interface PageMetadataOptions {
  /** Page title (will be appended with site name via template) */
  title: string;
  /** Page description for SEO and social sharing */
  description: string;
  /** OG image path (relative to public directory) */
  image?: string;
  /** Page path for canonical URL (e.g., '/lore') */
  path?: string;
  /** OpenGraph type - defaults to 'website' */
  type?: 'website' | 'book' | 'article';
}

/**
 * Creates complete metadata object for a page
 */
export function createPageMetadata({
  title,
  description,
  image,
  path = '',
  type = 'website',
}: PageMetadataOptions): Metadata {
  const ogImage = image || siteConfig.defaultImage;
  const pageUrl = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - ${siteConfig.name}`,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.creator,
    },
  };
}

/**
 * Page-specific metadata configurations
 */
export const pageMetadata = {
  home: createPageMetadata({
    title: 'An Alternate Reality Thriller',
    description: siteConfig.description,
    image: '/images/landing/bharatvarsh.webp',
    path: '',
  }),

  lore: createPageMetadata({
    title: 'Lore Archive',
    description:
      'Explore the world of Bharatvarsh - characters, factions, locations, and technology from an alternate history where India refused the East India Company.',
    image: '/images/landing/lore-card.webp',
    path: '/lore',
  }),

  timeline: createPageMetadata({
    title: 'Timeline',
    description:
      'Journey through 300 years of alternate history - from the EIC Charter Denial in 1717 to the 20-10 Bombings in 2022.',
    image: '/images/landing/timeline-card.webp',
    path: '/timeline',
  }),

  novel: createPageMetadata({
    title: 'The Novel',
    description:
      'Bharatvarsh: An alternate reality thriller where a military prince uncovers deep dark secrets about the military and himself.',
    image: '/images/landing/novel-card.webp',
    path: '/novel',
    type: 'book',
  }),
} as const;
