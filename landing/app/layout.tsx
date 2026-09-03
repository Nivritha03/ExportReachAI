import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'ExportReach AI — AI-Powered International Buyer Discovery',
  description:
    'ExportReach AI discovers qualified international buyers, understands their business, and automatically starts personalized conversations. Find importers, distributors, and wholesalers with AI.',
  keywords: 'export marketing, buyer discovery, international trade, AI sales automation, export outreach',
  openGraph: {
    title: 'ExportReach AI — Turn Global Markets Into Your Next Customer',
    description: 'AI-powered international buyer discovery and export outreach automation platform.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-x-hidden theme-transition">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
