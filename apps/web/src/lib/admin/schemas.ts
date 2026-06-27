import { z } from 'zod';

const marketplaceEnum = z.enum(['mercado_livre', 'amazon', 'shopee', 'tiktok', 'outros']);

export const CreateProductSchema = z.object({
  tenantId: z.string().min(1, 'tenantId é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório').trim(),
  name: z.string().min(1, 'Nome é obrigatório').trim(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  marketplace: marketplaceEnum.default('mercado_livre'),
  active: z.boolean().optional(),
});

export const UpdateProductSchema = z
  .object({
    name: z.string().min(1).trim().optional(),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    marketplace: marketplaceEnum.optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Nenhum campo para atualizar',
  });

export const CreateManualNfSchema = z.object({
  tenantId: z.string().min(1, 'tenantId é obrigatório'),
  nfNumber: z.string().min(1, 'Número NF é obrigatório').trim(),
  nfSeries: z.string().trim().default('1'),
  nfDate: z.string().optional(),
  valorTotal: z.number().min(0, 'Valor deve ser ≥ 0'),
  itemsCount: z.number().int().min(1).default(1),
  marketplace: marketplaceEnum,
});

export const PatchInsightSchema = z.object({
  id: z.string().min(1, 'id é obrigatório'),
  title: z.string().min(1).trim().optional(),
  body: z.string().min(1).trim().optional(),
  visibleToClient: z.boolean().optional(),
  productId: z.string().nullable().optional(),
  weekOf: z.string().optional(),
});

export function zodErrorMessage(error: z.ZodError): string {
  return error.errors[0]?.message ?? 'Dados inválidos';
}
