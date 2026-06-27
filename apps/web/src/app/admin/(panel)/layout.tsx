'use client';

import { Suspense } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminPanelErrorBoundary } from '@/components/admin/AdminPanelErrorBoundary';

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPanelErrorBoundary>
      <Suspense fallback={null}>
        <AdminLayout>{children}</AdminLayout>
      </Suspense>
    </AdminPanelErrorBoundary>
  );
}
