import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/layout/Navigation';
import './globals.css';

// Note: Google Fonts (Playfair Display & DM Sans) are configured in tailwind.config.js
// They will load via CDN link in production. Using fallback fonts for build.

export const metadata: Metadata = {
  title: 'Flower Shop - Fresh Flowers Delivered Daily',
  description: 'Beautiful, fresh flowers for every occasion. Elegant arrangements delivered with care.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="floral-bg min-h-screen font-body">
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
