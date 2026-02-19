import type { MetadataRoute } from 'next';

const BASE_URL = 'https://welcometobharatvarsh.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Static pages with priorities
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/novel`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/lore`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/timeline`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/forum`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ];

    return staticPages;
}
