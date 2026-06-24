import { prisma } from '@/lib/prisma';
import {
  detectMarketplaceFromText,
  detectMarketplaceFromXml,
  type ParsedNFItem,
} from '@/lib/nf/parser';
import type { Marketplace } from '@/types/internal';

const VALID: Marketplace[] = [
  'mercado_livre',
  'amazon',
  'shopee',
  'tiktok',
  'outros',
];

function normalizeMarketplace(raw: string | null | undefined): Marketplace | null {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  if (VALID.includes(key as Marketplace)) return key as Marketplace;
  return detectMarketplaceFromText(key);
}

/** Resolve marketplace por item: override formulário → catálogo SKU → descrição → hint XML (NF única). */
export async function resolveNfItemMarketplaces(
  tenantId: string,
  items: ParsedNFItem[],
  xmlContent: string,
  overrideMarketplace?: string | null,
): Promise<{ item: ParsedNFItem; marketplace: Marketplace }[]> {
  const formOverride = normalizeMarketplace(overrideMarketplace);
  const globalHint = detectMarketplaceFromXml(xmlContent);

  if (items.length === 0) {
    const single =
      formOverride ?? (globalHint ? normalizeMarketplace(globalHint) : null);
    if (!single) {
      throw new Error(
        'NF-e sem itens — selecione o marketplace no upload ou use XML com itens.',
      );
    }
    return [];
  }

  const products = await prisma.product.findMany({
    where: { tenantId },
    select: { sku: true, marketplace: true },
  });
  const skuMap = new Map(products.map((p) => [p.sku, p.marketplace]));

  const resolved: { item: ParsedNFItem; marketplace: Marketplace }[] = [];

  for (const item of items) {
    let marketplace =
      formOverride ??
      normalizeMarketplace(skuMap.get(item.sku)) ??
      detectMarketplaceFromText(item.descricao) ??
      (items.length === 1 ? normalizeMarketplace(globalHint) : null);

    if (!marketplace) {
      throw new Error(
        `Canal não identificado para SKU ${item.sku}. Selecione o marketplace no upload ou cadastre o SKU no catálogo.`,
      );
    }

    resolved.push({ item, marketplace });
  }

  return resolved;
}

/** Marketplace único para NF manual (sem itens detalhados). */
export function requireMarketplace(raw: string | null | undefined): Marketplace {
  const mp = normalizeMarketplace(raw);
  if (!mp) {
    throw new Error('Selecione o marketplace (Mercado Livre, Amazon, etc.).');
  }
  return mp;
}
