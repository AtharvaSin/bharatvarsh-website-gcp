import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue, Crimson_Pro, Noto_Sans_Devanagari } from 'next/font/google';
import { Toaster } from 'sonner';
import { Header } from '@/shared/layout/header';
import { Footer } from '@/shared/layout/footer';
import { LayoutProvider } from '@/shared/layout/LayoutProvider';
import { Providers } from './providers';
import { BhoomiWidget } from '@/components/bhoomi/BhoomiWidget';
import { EventTrackingProvider } from '@/components/tracking/EventTrackingProvider';
import { WebSiteJsonLd } from '@/components/seo/json-ld';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-crimson',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-devanagari',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // Enables safe area insets for notched devices
  themeColor: '#0F1419', // Obsidian-900
};

export const metadata: Metadata = {
  metadataBase: new URL('https://welcometobharatvarsh.com'),
  title: {
    default: 'Bharatvarsh - An Alternate Reality Thriller',
    template: '%s | Bharatvarsh',
  },
  description:
    'A military prince is given a case of national importance whose investigation forces him to cross boundaries of nations and generations, uncovering deep dark secrets about the military and himself.',
  keywords: [
    'Bharatvarsh',
    'Mahabharatvarsh',
    'alternate history',
    'alternate history India',
    'Indian thriller novel',
    'political thriller',
    'dystopian India novel',
    'military sci-fi',
    'techno-thriller',
    'cyberpunk India',
    'speculative fiction India',
    'what if India was never colonized',
    'Atharva Singh',
    'Kahaan Arshad',
    'surveillance thriller',
    'Indian military fiction',
  ],
  authors: [{ name: 'Atharva Singh', url: 'https://welcometobharatvarsh.com' }],
  openGraph: {
    title: 'Bharatvarsh - An Alternate Reality Thriller',
    description:
      'A military prince is given a case of national importance whose investigation forces him to cross boundaries of nations and generations.',
    url: 'https://welcometobharatvarsh.com',
    siteName: 'Bharatvarsh',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/novel-cover.png',
        width: 1200,
        height: 630,
        alt: 'Bharatvarsh - An Alternate Reality Thriller Novel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bharatvarsh - An Alternate Reality Thriller',
    description:
      'A military prince is given a case of national importance whose investigation forces him to cross boundaries of nations and generations.',
    site: '@bharatvarsh',
    creator: '@bharatvarsh',
    images: ['/images/novel-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebasNeue.variable} ${crimsonPro.variable} ${notoSansDevanagari.variable} overflow-x-hidden w-full`}
    >
      <body
        className="min-h-screen bg-[var(--obsidian-900)] text-[var(--text-primary)] antialiased overflow-x-hidden w-full"
        suppressHydrationWarning
      >
        <Providers>
          <EventTrackingProvider>
            <WebSiteJsonLd />
            <LayoutProvider
              header={<Header />}
              atmosphericEffects={{
                enableGrain: true,
                enableParticles: true,
                enableScanlines: true,
                grainOpacity: 0.04,
                particleCount: 40,
              }}
              pageTransition={{
                enableLoadingIndicator: true,
                enableMeshScan: false,
                duration: 0.35,
              }}
            >
              <main className="pt-16 md:pt-20">
                {children}
              </main>
              <Footer />
              <Toaster
                position="bottom-center"
                theme="dark"
                toastOptions={{
                  style: {
                    background: 'var(--obsidian-800)',
                    border: '1px solid var(--obsidian-600)',
                    color: 'var(--text-primary)',
                  },
                }}
              />
            </LayoutProvider>
            <BhoomiWidget />
          </EventTrackingProvider>
        </Providers>
      </body>
    </html>
  );
}
