'use client';

import React from 'react';
import { Card } from '@f5/ui';
import { colors, typography } from '@f5/ui';
import { CollapsiblePanel } from '@/components/ui/CollapsiblePanel';
import panelStyles from '@/components/ui/CollapsiblePanel.module.css';

type AdminPanelCardProps = {
  title: string;
  variant?: 'default' | 'elevated' | 'outlined';
  defaultOpen?: boolean;
  collapsible?: boolean;
  compact?: boolean;
  children: React.ReactNode;
};

export function AdminPanelCard({
  title,
  variant = 'default',
  defaultOpen = true,
  collapsible = true,
  compact = false,
  children,
}: AdminPanelCardProps) {
  return (
    <Card
      variant={variant}
      style={{
        padding: 0,
        overflow: 'hidden',
        ...(variant === 'outlined' ? { borderWidth: 2 } : {}),
      }}
    >
      <CollapsiblePanel
        title={title}
        defaultOpen={defaultOpen}
        collapsible={collapsible}
        compact={compact}
        className={panelStyles.panel}
        style={
          {
            '--panel-bg': 'transparent',
            '--panel-border': 'transparent',
            '--panel-shadow': 'none',
            '--panel-radius': '0',
            '--panel-title-size': typography.fontSize.lg,
            '--panel-title-color': colors.navy,
            '--panel-chevron-color': colors.blue,
            '--panel-chevron-bg': 'rgba(0, 102, 255, 0.08)',
            '--panel-chevron-hover-bg': 'rgba(0, 102, 255, 0.14)',
          } as React.CSSProperties
        }
      >
        {children}
      </CollapsiblePanel>
    </Card>
  );
}
