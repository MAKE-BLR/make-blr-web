import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MAKE-BLR — Build things. Find your people.',
  description: 'A community in the making for Bengaluru’s makers, tinkerers, engineers, designers, and founders. Starting with people. Building the rest together.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://make-blr.com'),
  openGraph: { title: 'MAKE-BLR — Build things. Find your people.', description: 'The city is our workshop. Join Bengaluru’s early community for people who love making things.', type:'website' },
  robots: { index: true, follow: true },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
