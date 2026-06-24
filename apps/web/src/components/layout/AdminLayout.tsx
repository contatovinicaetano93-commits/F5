'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, spacing, typography, borderRadius } from '@f5/ui';

const menuItems = [
  { label: 'Central', href: '/admin', icon: '🏠' },
  { label: 'Clientes', href: '/admin/clientes', icon: '🏭' },
  { label: 'Lançamentos', href: '/admin/lancamentos', icon: '📈' },
  { label: 'NF-e', href: '/admin/nfe', icon: '📄' },
  { label: 'Insights', href: '/admin/insights', icon: '💡' },
  { label: 'Catálogo', href: '/admin/catalogo', icon: '📦' },
  { label: 'Auditoria', href: '/admin/auditoria', icon: '📋' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.offWhite }}>
      <aside
        style={{
          width: open ? 260 : 72,
          backgroundColor: colors.navy,
          color: colors.white,
          transition: 'width 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: spacing[6], borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <Link href="/admin" style={{ color: colors.white, textDecoration: 'none' }}>
            <div style={{ fontWeight: typography.fontWeight.extraBold, fontSize: typography.fontSize.xl }}>
              {open ? 'F5 Admin' : 'F5'}
            </div>
            {open && (
              <div style={{ fontSize: typography.fontSize.xs, color: colors.cyan, marginTop: spacing[1] }}>
                Operação interna
              </div>
            )}
          </Link>
        </div>

        <nav style={{ flex: 1, padding: spacing[4], display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
          {menuItems.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRadius: borderRadius.md,
                  textDecoration: 'none',
                  color: colors.white,
                  backgroundColor: active ? colors.blue : 'transparent',
                  fontSize: typography.fontSize.sm,
                  fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.regular,
                }}
              >
                <span>{item.icon}</span>
                {open && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: spacing[4], borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{
              width: '100%',
              padding: spacing[2],
              background: 'transparent',
              border: `1px solid rgba(255,255,255,0.2)`,
              borderRadius: borderRadius.md,
              color: colors.white,
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
            }}
          >
            {open ? '◀ Recolher' : '▶'}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
            <div style={{ fontSize: typography.fontSize.sm, color: colors.gray }}>
              F5 — Contador digital
            </div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.navy }}>
              Painel do operador
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
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
              ← Site público
            </Link>
          </div>
        </header>
        <main style={{ flex: 1, padding: spacing[8], overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
