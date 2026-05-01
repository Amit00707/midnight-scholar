import type { Metadata } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Midnight Scholar - AI-Powered E-Book Library',
  description: 'An intelligent e-reading platform that adapts to your learning style.',
};

import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { AuthProvider } from '@/lib/auth-context';
import { GlassNavbar } from '@/components/layout/GlassNavbar';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/layout/CookieBanner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
        <ReactQueryProvider>
          <AuthProvider>
            <GlassNavbar />
            <main className="flex-1 shrink-0">
              {children}
            </main>
            <Footer />
            <CookieBanner />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
