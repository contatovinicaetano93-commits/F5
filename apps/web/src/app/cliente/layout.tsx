import { ClientLayout } from '@/components/layout/ClientLayout';

export default function ClienteRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
