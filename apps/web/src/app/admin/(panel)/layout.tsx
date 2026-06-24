'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminPanelErrorBoundary } from '@/components/admin/AdminPanelErrorBoundary';

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPanelErrorBoundary>
      <AdminLayout>{children}</AdminLayout>
    </AdminPanelErrorBoundary>
  );
}
