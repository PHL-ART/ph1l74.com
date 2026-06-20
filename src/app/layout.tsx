// src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://ph1l74.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
