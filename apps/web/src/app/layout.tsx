import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const SITE_DESCRIPTION =
  'Operação completa de marketplaces para indústrias brasileiras. KPIs, recebimentos e prestação de contas — sem expor painéis técnicos.';

export const metadata: Metadata = {
  title: {
    default: 'F5 — Indústria no Digital',
    template: '%s | F5',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'marketplace',
    'indústria',
    'operação digital',
    'Amazon',
    'Mercado Livre',
    'KPIs',
    'contador digital',
    'recebimentos',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'F5 — Indústria no Digital',
    title: 'F5 — Indústria no Digital',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'F5 — Indústria no Digital',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
