'use client';

import { useEffect } from 'react';
import styles from '@/styles/client.module.css';

export default function ClienteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[F5 Portal]', error);
  }, [error]);

  return (
    <div className={styles.page} style={{ textAlign: 'center', paddingTop: 80 }}>
      <h2 className={styles.pageTitle}>Algo deu errado</h2>
      <p className={styles.pageSubtitle}>
        Não conseguimos carregar esta página. Tente novamente ou entre em contato com a F5.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 24,
          padding: '10px 24px',
          background: '#0066FF',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
