import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ThemeProvider from '@/components/providers/ThemeProvider';
import GSAPProvider from '@/components/providers/GSAPProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'A daily Next.js coding challenge | A dayly Next.js',
  description:
    'Practicing Next.js by building a daily coding challenge project every day for 100 days.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <GSAPProvider>
            <Header />
            {children}
            <Footer />
          </GSAPProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
