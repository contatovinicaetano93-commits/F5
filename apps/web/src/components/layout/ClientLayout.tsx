'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/client.module.css';
import { IconFinance, IconHome, IconProducts, IconProfile } from '@/components/client/icons';

const menuItems = [
  { label: 'Início', href: '/cliente', icon: IconHome, exact: true },
  { label: 'Produtos', href: '/cliente/produtos', icon: IconProducts, exact: false },
  { label: 'Financeiro', href: '/cliente/financeiro', icon: IconFinance, exact: false },
  { label: 'Perfil', href: '/cliente/perfil', icon: IconProfile, exact: false },
];

const pageTitles: Record<string, { title: string; eyebrow: string }> = {
  '/cliente': { title: 'Visão geral', eyebrow: 'Início' },
  '/cliente/produtos': { title: 'Performance por produto', eyebrow: 'Produtos' },
  '/cliente/financeiro': { title: 'Controle financeiro', eyebrow: 'Financeiro' },
  '/cliente/perfil': { title: 'Sua empresa', eyebrow: 'Perfil' },
};

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const header = pageTitles[pathname] ?? {
    title: 'Portal do cliente',
    eyebrow: 'F5',
  };

  return (
    <div className={`${styles.shell} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarBrand}>
          <Link href="/cliente" className={styles.logoLink}>
            <div className={styles.logoMark}>F5</div>
            {!collapsed && (
              <div>
                <div className={styles.logoTitle}>F5</div>
                <div className={styles.logoSubtitle}>Indústria no digital</div>
              </div>
            )}
          </Link>
        </div>

        {!collapsed && (
          <div className={styles.tenantBadge}>
            <p className={styles.tenantLabel}>Cliente</p>
            <p className={styles.tenantName}>Indústria Piloto</p>
          </div>
        )}

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={styles.navIcon} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Expandir' : 'Recolher menu'}
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.headerEyebrow}>{header.eyebrow}</p>
            <h1 className={styles.headerTitle}>{header.title}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className={styles.headerMeta}>Dados consolidados pela F5</p>
            <Link href="/" className={styles.headerLink}>
              Voltar ao site
            </Link>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
