'use client';

import styles from '@/styles/client.module.css';
import { useClientRefresh } from '@/components/client/ClientRefreshProvider';

export function ClientFreshnessBadge() {
  const { freshnessLabel } = useClientRefresh();

  return (
    <p className={styles.freshnessBadge} role="status" aria-live="polite">
      {freshnessLabel}
    </p>
  );
}
