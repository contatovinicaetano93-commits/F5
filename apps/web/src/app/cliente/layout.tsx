import type { Metadata } from 'next';
import { ClientLayout } from '@/components/layout/ClientLayout';

export const metadata: Metadata = {
  title: 'Portal do cliente — F5',
  robots: { index: false, follow: false },
};

export default function ClienteRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
