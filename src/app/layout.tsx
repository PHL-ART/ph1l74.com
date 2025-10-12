import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ph1l74.com',
  description: 'Interactive landing page with Aceternity UI components',
  keywords: ['portfolio', 'art', 'dev', 'ph1l74'],
  authors: [{ name: 'ph1l74' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

