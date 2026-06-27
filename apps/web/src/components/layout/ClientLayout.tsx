'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '@/styles/client.module.css';
import { ClientFreshnessBadge } from '@/components/client/ClientFreshnessBadge';
import { ClientRefreshProvider } from '@/components/client/ClientRefreshProvider';
import { FloatingButtons } from '@/components/shared/FloatingButtons';
import { CLIENT_POLL_INTERVAL_MS, fetchClientJson } from '@/lib/client/fetch';

/* ── SVG Icons ── */
function IcHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}
function IcProducts({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" />
      <path d="M3.3 7.7L12 12.5l8.7-4.8M12 22.3V12.5" />
    </svg>
  );
}
function IcFinance({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" strokeLinecap="round" />
    </svg>
  );
}
function IcInsights({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 2a6 6 0 016 6c0 2.2-1.1 4.1-2.8 5.3l-.2.2V16a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.5l-.2-.2A6 6 0 0112 2z" strokeLinejoin="round" />
      <path d="M9 21h6" strokeLinecap="round" />
    </svg>
  );
}
function IcProfile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" strokeLinecap="round" />
    </svg>
  );
}
function IcChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Menu definition ── */
type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  children?: { label: string; href: string }[];
};

const menuItems: MenuItem[] = [
  { label: 'Início', href: '/cliente', icon: IcHome, exact: true },
  {
    label: 'Produtos',
    href: '/cliente/produtos',
    icon: IcProducts,
    children: [
      { label: 'Performance', href: '/cliente/produtos' },
      { label: 'Catálogo', href: '/cliente/produtos?tab=catalogo' },
    ],
  },
  {
    label: 'Financeiro',
    href: '/cliente/financeiro',
    icon: IcFinance,
    children: [
      { label: 'Recebimentos', href: '/cliente/financeiro' },
      { label: 'Extrato', href: '/cliente/financeiro?tab=extrato' },
    ],
  },
  {
    label: 'Insights',
    href: '/cliente/insights',
    icon: IcInsights,
    children: [
      { label: 'Operação F5', href: '/cliente/insights' },
      { label: 'Marketplace', href: '/cliente/insights?tab=marketplace' },
    ],
  },
  { label: 'Perfil', href: '/cliente/perfil', icon: IcProfile },
];

const pageTitles: Record<string, { title: string; eyebrow: string }> = {
  '/cliente': { title: 'Visão geral', eyebrow: 'Início' },
  '/cliente/produtos': { title: 'Performance por produto', eyebrow: 'Produtos' },
  '/cliente/financeiro': { title: 'Controle financeiro', eyebrow: 'Financeiro' },
  '/cliente/insights': { title: 'Insights da operação', eyebrow: 'Insights' },
  '/cliente/perfil': { title: 'Sua empresa', eyebrow: 'Perfil' },
};

/* ── Nav item with optional dropdown ── */
function SideNavItem({
  item,
  pathname,
  collapsed,
}: {
  item: MenuItem;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
  const hasChildren = !!item.children?.length;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isActive && hasChildren) setExpanded(true);
  }, [isActive, hasChildren]);

  const Icon = item.icon;

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          type="button"
          className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            width: '100%',
            textAlign: 'left',
            fontFamily: 'inherit',
          }}
        >
          <Icon className={styles.navIcon} />
          <span style={{ flex: 1 }}>{item.label}</span>
          <IcChevron open={expanded} />
        </button>

        {expanded && (
          <div style={{ marginBottom: 4 }}>
            {item.children!.map((child) => {
              const childActive = pathname === child.href.split('?')[0];
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  style={{
                    display: 'block',
                    padding: '6px 12px 6px 38px',
                    fontSize: 12,
                    color: childActive ? 'var(--cyan)' : 'rgba(255,255,255,0.5)',
                    textDecoration: 'none',
                    borderLeft: childActive ? '2px solid var(--cyan)' : '2px solid transparent',
                    marginLeft: 12,
                    fontWeight: childActive ? 600 : 400,
                    transition: 'color 0.15s',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon className={styles.navIcon} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

/* ── Bottom nav item (mobile) ── */
function BottomNavItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`${styles.bottomNavLink} ${active ? styles.bottomNavLinkActive : ''}`}
    >
      <Icon className={styles.bottomNavIcon} />
      <span>{item.label}</span>
    </Link>
  );
}

/* ── Shell ── */
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
          if (data?.company?.displayName) setTenantName(data.company.displayName);
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

  const header = pageTitles[pathname] ?? { title: 'Portal do cliente', eyebrow: 'F5' };

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
          {menuItems.map((item) => (
            <SideNavItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '→' : 'Recolher menu'}
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
        {menuItems.map((item) => (
          <BottomNavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <FloatingButtons />
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
