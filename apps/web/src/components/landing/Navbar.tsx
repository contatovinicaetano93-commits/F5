'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '@/styles/landing.module.css';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const onPitch = pathname === '/pitch';
  const prefix = onPitch ? '/' : '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`${styles.nav} ${scrolled || onPitch ? styles.navScrolled : ''}`}
    >
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>F5</div>
          <div>
            <div className={styles.logoText}>F5</div>
            <div className={styles.logoTag}>Indústria no digital</div>
          </div>
        </Link>

        <div className={styles.navLinks}>
          <Link href={`${prefix}#plataforma`} className={styles.navLink}>
            Plataforma
          </Link>
          <Link href={`${prefix}#modelos`} className={styles.navLink}>
            Modelos
          </Link>
          <Link href={`${prefix}#processo`} className={styles.navLink}>
            Processo
          </Link>
          <Link
            href="/pitch"
            className={`${styles.navLink} ${onPitch ? styles.navLinkActive : ''}`}
          >
            Apresentação
          </Link>
          <Link href="/cliente" className={styles.navLink}>
            Demo cliente
          </Link>
          <Link href="/login" className={styles.navCta}>
            Área do cliente
          </Link>
        </div>
      </div>
    </nav>
  );
}
