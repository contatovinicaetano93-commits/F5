'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { AdminDemoBanner } from '@/components/admin/AdminDemoBanner';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { FloatingButtons } from '@/components/shared/FloatingButtons';
import { colors, spacing, typography } from '@f5/ui';

/* ── SVG Icons ── */
function IcHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}
function IcClients() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinejoin="round" />
      <path d="M12 12v5M9.5 14.5h5" strokeLinecap="round" />
    </svg>
  );
}
function IcLaunch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points="16 7 22 7 22 13" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function IcNFe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" />
      <line x1="8" y1="17" x2="12" y2="17" strokeLinecap="round" />
    </svg>
  );
}
function IcInsights() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2a6 6 0 016 6c0 2.2-1.1 4.1-2.8 5.3l-.2.2V16a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.5l-.2-.2A6 6 0 0112 2z" strokeLinejoin="round" />
      <path d="M9 21h6" strokeLinecap="round" />
    </svg>
  );
}
function IcCatalog() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" />
      <path d="M3.3 7.7L12 12.5l8.7-4.8M12 22.3V12.5" />
    </svg>
  );
}
function IcChecklist() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinejoin="round" />
    </svg>
  );
}
function IcAudit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Menu definition ── */
type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
};

const menuItems: MenuItem[] = [
  { label: 'Central', href: '/admin', icon: <IcHome /> },
  {
    label: 'Clientes',
    href: '/admin/clientes',
    icon: <IcClients />,
    children: [
      { label: 'Lista de clientes', href: '/admin/clientes' },
      { label: 'Novo cliente', href: '/admin/clientes?novo=1' },
    ],
  },
  {
    label: 'Lançamentos',
    href: '/admin/lancamentos',
    icon: <IcLaunch />,
    children: [
      { label: 'Ver lançamentos', href: '/admin/lancamentos' },
      { label: 'Importar métricas', href: '/admin/lancamentos?import=1' },
    ],
  },
  {
    label: 'NF-e',
    href: '/admin/nfe',
    icon: <IcNFe />,
    children: [
      { label: 'Notas fiscais', href: '/admin/nfe' },
      { label: 'Upload NF-e', href: '/admin/nfe?upload=1' },
    ],
  },
  {
    label: 'Insights',
    href: '/admin/insights',
    icon: <IcInsights />,
    children: [
      { label: 'Ver insights', href: '/admin/insights' },
      { label: 'Novo insight', href: '/admin/insights?novo=1' },
    ],
  },
  {
    label: 'Catálogo',
    href: '/admin/catalogo',
    icon: <IcCatalog />,
    children: [
      { label: 'Produtos', href: '/admin/catalogo' },
      { label: 'Importar produtos', href: '/admin/catalogo?import=1' },
    ],
  },
  { label: 'Checklist', href: '/admin/checklist', icon: <IcChecklist /> },
  { label: 'Auditoria', href: '/admin/auditoria', icon: <IcAudit /> },
];

/* ── Hook ── */
function useSafePathname() {
  const routerPath = usePathname();
  const [pathname, setPathname] = useState('');
  useEffect(() => {
    const next =
      typeof routerPath === 'string' && routerPath.length > 0
        ? routerPath
        : window.location.pathname;
    setPathname(next);
  }, [routerPath]);
  return pathname;
}

/* ── Sidebar nav item ── */
function NavItem({ item, pathname, currentHref, sidebarOpen }: {
  item: MenuItem;
  pathname: string;
  currentHref: string;
  sidebarOpen: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = !!item.children?.length;
  const isActive =
    item.href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(item.href);

  // Auto-expand if current section
  useEffect(() => {
    if (isActive && hasChildren) setExpanded(true);
  }, [isActive, hasChildren]);

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
    background: isActive ? 'rgba(0,102,255,0.85)' : 'transparent',
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.15s, color 0.15s',
    fontFamily: typography.fontFamily.primary,
    letterSpacing: '0.01em',
  };

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          style={itemStyle}
          onClick={() => setExpanded(!expanded)}
          onMouseEnter={(e) => {
            if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <span style={{ flexShrink: 0, opacity: 0.9 }}>{item.icon}</span>
          {sidebarOpen && (
            <>
              <span style={{ flex: 1 }}>{item.label}</span>
              <IcChevron open={expanded} />
            </>
          )}
        </button>

        {sidebarOpen && expanded && (
          <div style={{ marginTop: 2, marginBottom: 4 }}>
            {item.children!.map((child) => {
              const childActive = currentHref === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  style={{
                    display: 'block',
                    padding: '7px 14px 7px 40px',
                    fontSize: 12,
                    color: childActive ? '#00D4FF' : 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                    borderRadius: 6,
                    fontWeight: childActive ? 600 : 400,
                    transition: 'color 0.15s',
                    borderLeft: childActive ? '2px solid #00D4FF' : '2px solid transparent',
                    marginLeft: 14,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = childActive ? '#00D4FF' : 'rgba(255,255,255,0.55)';
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
      style={itemStyle}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
      }}
    >
      <span style={{ flexShrink: 0, opacity: 0.9 }}>{item.icon}</span>
      {sidebarOpen && <span>{item.label}</span>}
    </Link>
  );
}

/* ── Main layout ── */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = useSafePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentHref = search ? `${pathname}?${search}` : pathname;
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.offWhite }}>
      {/* Sidebar */}
      <aside
        style={{
          width: open ? 240 : 60,
          background: 'linear-gradient(180deg, #0A1628 0%, #0D1B2A 100%)',
          color: '#fff',
          transition: 'width 0.22s ease',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: open ? '24px 20px 18px' : '24px 0 18px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
          }}
        >
          <Link href="/admin" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0,
                letterSpacing: '-0.03em',
              }}
            >
              F5
            </div>
            {open && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>F5 Admin</div>
                <div style={{ fontSize: 10, color: '#00D4FF', letterSpacing: '0.06em', marginTop: 2 }}>
                  OPERAÇÃO INTERNA
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: open ? '16px 10px' : '16px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
              currentHref={currentHref}
              sidebarOpen={open}
            />
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{
              width: '100%',
              padding: '9px 0',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 7,
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              letterSpacing: '0.03em',
              transition: 'border-color 0.2s, color 0.2s',
              fontFamily: typography.fontFamily.primary,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          >
            {open ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Recolher
              </>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminDemoBanner />
        <header
          style={{
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.offWhite}`,
            padding: `${spacing[4]} ${spacing[8]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: colors.gray, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              F5 — Consultoria digital
            </div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.navy }}>
              Painel do operador
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4], flex: 1, justifyContent: 'flex-end' }}>
            <AdminSearchBar />
            <button
              type="button"
              onClick={handleLogout}
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: typography.fontFamily.primary,
              }}
            >
              Sair
            </button>
            <Link href="/" style={{ fontSize: typography.fontSize.sm, color: colors.blue }}>
              Site público
            </Link>
          </div>
        </header>
        <main style={{ flex: 1, padding: spacing[8], overflow: 'auto' }}>{children}</main>
      </div>

      <FloatingButtons />
    </div>
  );
}
