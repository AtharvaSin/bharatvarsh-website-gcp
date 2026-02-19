/**
 * JSON-LD Structured Data Components for SEO
 * 
 * These components inject schema.org structured data into pages
 * for rich search results (knowledge panels, book info, breadcrumbs).
 */

interface JsonLdProps {
    data: Record<string, unknown>;
}

/**
 * Generic JSON-LD script injector
 */
function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

/**
 * WebSite + Organization schema for root layout
 * Enables sitelinks search box and org knowledge panel
 */
export function WebSiteJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': 'https://welcometobharatvarsh.com/#website',
                url: 'https://welcometobharatvarsh.com',
                name: 'Bharatvarsh',
                description:
                    'The official website for Mahabharatvarsh — an alternate-reality political thriller novel set in a reimagined India that was never colonized.',
                publisher: {
                    '@id': 'https://welcometobharatvarsh.com/#organization',
                },
                inLanguage: 'en-US',
            },
            {
                '@type': 'Organization',
                '@id': 'https://welcometobharatvarsh.com/#organization',
                name: 'Bharatvarsh',
                url: 'https://welcometobharatvarsh.com',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://welcometobharatvarsh.com/images/novel-cover.png',
                },
                description:
                    'Bharatvarsh is an immersive alternate-history universe created by Atharva Singh, exploring themes of surveillance, freedom, and truth in a reimagined India.',
            },
        ],
    };

    return <JsonLd data={data} />;
}

/**
 * Book schema for the novel page
 * Enables rich book results with author, genre, purchase links
 */
export function BookJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: 'Mahabharatvarsh',
        alternateName: 'Mahabharatvarsh: Price of Harmony, paid by Freedom',
        description:
            'In an alternate India that was never colonized, a decorated military officer hunts a vanished legend after synchronized bombings resurrect a banned resistance group — uncovering a dark conspiracy at the core of the nation\'s military dictatorship.',
        author: {
            '@type': 'Person',
            name: 'Atharva Singh',
            url: 'https://welcometobharatvarsh.com',
        },
        genre: [
            'Alternate History',
            'Political Thriller',
            'Dystopian Fiction',
            'Military Science Fiction',
            'Techno-Thriller',
        ],
        inLanguage: 'en',
        numberOfPages: 374,
        bookFormat: 'https://schema.org/Hardcover',
        url: 'https://welcometobharatvarsh.com/novel',
        image: 'https://welcometobharatvarsh.com/images/landing/novel-card.webp',
        offers: [
            {
                '@type': 'Offer',
                url: 'https://www.amazon.in/dp/B0GHS8127Z',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'Amazon India' },
            },
            {
                '@type': 'Offer',
                url: 'https://dl.flipkart.com/s/zo1xOSuuuN',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'Flipkart' },
            },
            {
                '@type': 'Offer',
                url: 'https://direct.notionpress.com/in/read/mahabharatvarsh-hardcover/',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'Notion Press' },
            },
        ],
        aggregateRating: undefined,
    };

    // Remove undefined fields
    const cleanData = JSON.parse(JSON.stringify(data));
    return <JsonLd data={cleanData} />;
}

/**
 * BreadcrumbList schema for any page
 * Enables breadcrumb trail in search results
 */
export function BreadcrumbJsonLd({
    items,
}: {
    items: { name: string; url: string }[];
}) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return <JsonLd data={data} />;
}
