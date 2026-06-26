'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { colors, spacing, typography, borderRadius } from '@f5/ui';
import { fetchAdminJson } from '@/lib/admin/fetch';
import type { AdminSearchResult } from '@/lib/admin/search';

const KIND_LABELS = {
  tenant: 'Cliente',
  product: 'SKU',
  nf: 'NF-e',
} as const;

export function AdminSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await fetchAdminJson<{ results: AdminSearchResult[] }>(
        `/api/admin/search?q=${encodeURIComponent(query.trim())}`,
      );
      setLoading(false);
      if (result.ok) {
        setResults(result.data.results);
        setOpen(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', minWidth: 220, flex: 1, maxWidth: 360 }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Buscar cliente, SKU ou NF…"
        aria-label="Buscar no admin"
        style={{
          width: '100%',
          padding: `${spacing[2]} ${spacing[3]}`,
          borderRadius: borderRadius.md,
          border: `1px solid ${colors.gray}`,
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontFamily.primary,
        }}
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: spacing[1],
            backgroundColor: colors.white,
            border: `1px solid ${colors.offWhite}`,
            borderRadius: borderRadius.md,
            boxShadow: '0 8px 24px rgba(13,27,42,0.12)',
            zIndex: 50,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <p style={{ padding: spacing[3], margin: 0, fontSize: typography.fontSize.sm, color: colors.gray }}>
              Buscando…
            </p>
          ) : results.length === 0 ? (
            <p style={{ padding: spacing[3], margin: 0, fontSize: typography.fontSize.sm, color: colors.gray }}>
              Nenhum resultado
            </p>
          ) : (
            results.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
                style={{
                  display: 'block',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${colors.offWhite}`,
                }}
              >
                <div style={{ fontSize: typography.fontSize.xs, color: colors.blue, fontWeight: 600 }}>
                  {KIND_LABELS[item.kind]}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.navy, fontWeight: 600 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.gray }}>{item.subtitle}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
