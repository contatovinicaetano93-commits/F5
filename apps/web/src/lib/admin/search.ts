import { hasDatabase, prisma } from '@/lib/prisma';
import { internalStore } from '@/lib/internal/store';

export type AdminSearchResultKind = 'tenant' | 'product' | 'nf';

export interface AdminSearchResult {
  kind: AdminSearchResultKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const LIMIT_PER_KIND = 8;

function normalizeQuery(q: string) {
  return q.trim();
}

function matches(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function searchAdmin(q: string): Promise<AdminSearchResult[]> {
  const query = normalizeQuery(q);
  if (query.length < 2) return [];

  if (!hasDatabase()) {
    const results: AdminSearchResult[] = [];

    for (const tenant of internalStore.tenants.list()) {
      if (
        matches(tenant.name, query) ||
        (tenant.cnpj && matches(tenant.cnpj, query))
      ) {
        results.push({
          kind: 'tenant',
          id: tenant.id,
          title: tenant.name,
          subtitle: tenant.cnpj ?? tenant.segment,
          href: `/admin/clientes/${tenant.id}`,
        });
      }
    }

    for (const product of internalStore.products.list()) {
      if (matches(product.sku, query) || matches(product.name, query)) {
        const tenant = internalStore.tenants.get(product.tenantId);
        results.push({
          kind: 'product',
          id: product.id,
          title: product.sku,
          subtitle: `${product.name}${tenant ? ` · ${tenant.name}` : ''}`,
          href: `/admin/catalogo`,
        });
      }
    }

    for (const nf of internalStore.nfs.list()) {
      if (matches(nf.nfNumber, query)) {
        results.push({
          kind: 'nf',
          id: nf.id,
          title: `NF ${nf.nfNumber}`,
          subtitle: `R$ ${nf.valorTotal.toFixed(2)}`,
          href: `/admin/nfe`,
        });
      }
    }

    return results.slice(0, LIMIT_PER_KIND * 3);
  }

  const [tenants, products, nfs] = await Promise.all([
    prisma.tenant.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { cnpj: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: LIMIT_PER_KIND,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, cnpj: true, segment: true },
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { sku: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: LIMIT_PER_KIND,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        sku: true,
        name: true,
        tenant: { select: { name: true } },
      },
    }),
    prisma.notaFiscal.findMany({
      where: { nfNumber: { contains: query, mode: 'insensitive' } },
      take: LIMIT_PER_KIND,
      orderBy: { nfDate: 'desc' },
      select: { id: true, nfNumber: true, valorTotal: true },
    }),
  ]);

  return [
    ...tenants.map((t) => ({
      kind: 'tenant' as const,
      id: t.id,
      title: t.name,
      subtitle: t.cnpj ?? t.segment,
      href: `/admin/clientes/${t.id}`,
    })),
    ...products.map((p) => ({
      kind: 'product' as const,
      id: p.id,
      title: p.sku,
      subtitle: `${p.name} · ${p.tenant.name}`,
      href: `/admin/catalogo`,
    })),
    ...nfs.map((nf) => ({
      kind: 'nf' as const,
      id: nf.id,
      title: `NF ${nf.nfNumber}`,
      subtitle: `R$ ${Number(nf.valorTotal).toFixed(2)}`,
      href: `/admin/nfe`,
    })),
  ];
}
