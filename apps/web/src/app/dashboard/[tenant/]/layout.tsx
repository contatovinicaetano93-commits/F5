'use client';

import React from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardTenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardLayout tenant={params.tenant}>{children}</DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}
