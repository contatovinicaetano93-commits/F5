import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

export const metadata = {
  title: 'Dashboard - F5',
};

export default function Layout({ children, params }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <DashboardLayout tenant={params.tenant}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
