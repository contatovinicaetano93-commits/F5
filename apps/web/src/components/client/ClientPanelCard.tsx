'use client';

import React from 'react';
import { CollapsiblePanel } from '@/components/ui/CollapsiblePanel';
import styles from '@/components/ui/CollapsiblePanel.module.css';

type ClientPanelCardProps = {
  title: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
  compact?: boolean;
  children: React.ReactNode;
};

export function ClientPanelCard({
  title,
  defaultOpen = true,
  collapsible = true,
  compact = false,
  children,
}: ClientPanelCardProps) {
  return (
    <CollapsiblePanel
      title={title}
      defaultOpen={defaultOpen}
      collapsible={collapsible}
      compact={compact}
      className={styles.panel}
      style={
        {
          '--panel-bg': '#ffffff',
          '--panel-border': 'rgba(13, 27, 42, 0.08)',
          '--panel-shadow': '0 1px 2px rgba(10, 22, 40, 0.04)',
          '--panel-radius': '18px',
          '--panel-title-size': '15px',
          '--panel-title-color': '#1a2332',
          '--panel-chevron-color': '#0066ff',
          '--panel-chevron-bg': 'rgba(0, 102, 255, 0.08)',
        } as React.CSSProperties
      }
    >
      {children}
    </CollapsiblePanel>
  );
}
