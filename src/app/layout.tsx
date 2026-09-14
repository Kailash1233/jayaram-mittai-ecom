import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jayaram Mittai | Sweet · Savoury · Celebration (Since 1978)',
  description:
    'Artisanal handcrafted South Indian sweets, savouries, chaats, and snacks from Chromepet & Nanganallur, Chennai. Real-time ordering, live kitchen preparation, and doorstep delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#f8f6f0] dark:bg-[#121214] text-[#1f2937] dark:text-[#f3f4f6]">
        {children}
      </body>
    </html>
  );
}
