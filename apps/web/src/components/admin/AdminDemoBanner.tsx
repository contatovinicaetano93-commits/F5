'use client';

import React, { useEffect, useState } from 'react';
import { spacing, typography } from '@f5/ui';
import { fetchAdminJson } from '@/lib/admin/fetch';
import type { AdminSystemStatus } from '@/lib/admin/system-status';

export function AdminDemoBanner() {
  const [status, setStatus] = useState<AdminSystemStatus | null>(null);

  useEffect(() => {
    fetchAdminJson<AdminSystemStatus>('/api/admin/system-status').then((result) => {
      if (result.ok) setStatus(result.data);
    });
  }, []);

  if (!status || status.mode === 'production') return null;

  return (
    <div
      role="status"
      style={{
        backgroundColor: '#FEF3C7',
        borderBottom: '1px solid #F59E0B',
        color: '#92400E',
        padding: `${spacing[3]} ${spacing[8]}`,
        fontSize: typography.fontSize.sm,
        lineHeight: 1.5,
      }}
    >
      <strong>Modo demonstração</strong> — dados em memória (
      {status.persistence}). Cadastros não persistem após reiniciar o servidor.
      {status.writesBlocked
        ? ' Em produção, gravações estão bloqueadas até configurar DATABASE_URL.'
        : ' Configure DATABASE_URL para usar PostgreSQL (Neon).'}
    </div>
  );
}
