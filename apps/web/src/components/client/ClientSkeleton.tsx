import styles from '@/styles/client.module.css';

export function ClientSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.skeletonWrap} aria-busy="true" aria-label="Carregando">
      <div className={styles.skeletonHero} />
      <div className={styles.kpiGrid}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skeletonBlock} />
      ))}
    </div>
  );
}
