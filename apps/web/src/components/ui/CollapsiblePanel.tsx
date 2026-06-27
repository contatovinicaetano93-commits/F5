'use client';

import React, { useEffect, useId, useState } from 'react';
import styles from './CollapsiblePanel.module.css';

type CollapsiblePanelProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      aria-hidden
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3.5 5.25L7 8.75L10.5 5.25"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function CollapsiblePanel({
  title,
  children,
  defaultOpen = true,
  collapsible = true,
  compact = false,
  className,
  style,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const isOpen = collapsible ? open : true;

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const rootClass = [
    styles.panel,
    compact ? styles.compact : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={rootClass} style={style}>
      {collapsible ? (
        <button
          type="button"
          className={styles.header}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span className={styles.title}>{title}</span>
          <ChevronIcon open={isOpen} />
        </button>
      ) : (
        <div className={`${styles.header} ${styles.headerStatic}`}>
          <span className={styles.title}>{title}</span>
        </div>
      )}
      {isOpen && (
        <div
          id={panelId}
          className={`${styles.body} ${collapsible ? styles.bodyFlush : ''}`}
        >
          {children}
        </div>
      )}
    </section>
  );
}
