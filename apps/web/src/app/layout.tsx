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

export const metadata: Metadata = {
  title: 'F5 — Indústria no Digital',
  description:
    'Operação completa de marketplaces para indústrias brasileiras. Controle, KPIs e recebimentos em um só lugar.',
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
