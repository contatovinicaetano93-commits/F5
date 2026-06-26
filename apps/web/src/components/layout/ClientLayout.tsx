'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '@/styles/client.module.css';
import { IconFinance, IconHome, IconInsights, IconProducts, IconProfile } from '@/components/client/icons';
import { ClientFreshnessBadge } from '@/components/client/ClientFreshnessBadge';
import { ClientRefreshProvider } from '@/components/client/ClientRefreshProvider';
import { CLIENT_POLL_INTERVAL_MS, fetchClientJson } from '@/lib/client/fetch';

const menuItems = [
  { label: 'Início', href: '/cliente', icon: IconHome, exact: true },
  { label: 'Produtos', href: '/cliente/produtos', icon: IconProducts, exact: false },
  { label: 'Financeiro', href: '/cliente/financeiro', icon: IconFinance, exact: false },
  { label: 'Insights', href: '/cliente/insights', icon: IconInsights, exact: false },
  { label: 'Perfil', href: '/cliente/perfil', icon: IconProfile, exact: false },
];

const pageTitles: Record<string, { title: string; eyebrow: string }> = {
  '/cliente': { title: 'Visão geral', eyebrow: 'Início' },
  '/cliente/produtos': { title: 'Performance por produto', eyebrow: 'Produtos' },
  '/cliente/financeiro': { title: 'Controle financeiro', eyebrow: 'Financeiro' },
  '/cliente/insights': { title: 'Insights da operação', eyebrow: 'Insights' },
  '/cliente/perfil': { title: 'Sua empresa', eyebrow: 'Perfil' },
};

function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [tenantName, setTenantName] = useState('Indústria Piloto');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const loadProfile = () =>
      fetchClientJson<{ company?: { displayName?: string } }>('/api/client/profile').then(
        (data) => {
          if (data?.company?.displayName) {
            setTenantName(data.company.displayName);
          }
        },
      );

    loadProfile();
    const profileTimer = setInterval(loadProfile, CLIENT_POLL_INTERVAL_MS);

    fetchClientJson<{ authenticated?: boolean; email?: string }>('/api/client/session').then(
      (data) => {
        if (data?.authenticated) {
          setAuthenticated(true);
          if (data.email) setUserEmail(data.email);
        }
      },
    );

    return () => clearInterval(profileTimer);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/client/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  };

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
            <p className={styles.tenantName}>{tenantName}</p>
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
            <ClientFreshnessBadge />
            {userEmail && (
              <p className={styles.headerMeta} style={{ marginTop: 4 }}>
                {userEmail}
              </p>
            )}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
              {authenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.headerLink}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Sair
                </button>
              )}
              <Link href="/" className={styles.headerLink}>
                Voltar ao site
              </Link>
            </div>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>

      <nav className={styles.bottomNav} aria-label="Navegação principal">
        {menuItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.bottomNavLink} ${active ? styles.bottomNavLinkActive : ''}`}
            >
              <Icon className={styles.bottomNavIcon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientRefreshProvider>
      <ClientLayoutShell>{children}</ClientLayoutShell>
    </ClientRefreshProvider>
  );
}
