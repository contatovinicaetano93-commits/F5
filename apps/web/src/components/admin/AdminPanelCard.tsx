'use client';

import React, { useId, useState } from 'react';
import { Card } from '@f5/ui';
import { colors, spacing, typography } from '@f5/ui';

type AdminPanelCardProps = {
  title: string;
  variant?: 'default' | 'elevated' | 'outlined';
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function AdminPanelCard({
  title,
  variant = 'default',
  defaultOpen = true,
  children,
}: AdminPanelCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <Card variant={variant} style={{ padding: spacing[4] }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[3],
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: typography.fontFamily.primary,
        }}
      >
        <span
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.navy,
          }}
        >
          {title}
        </span>
        <span
          aria-hidden
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.blue,
            fontWeight: typography.fontWeight.semibold,
            flexShrink: 0,
          }}
        >
          {open ? 'Recolher ▲' : 'Expandir ▼'}
        </span>
      </button>
      {open && (
        <div id={panelId} style={{ marginTop: spacing[4] }}>
          {children}
        </div>
      )}
    </Card>
  );
}
