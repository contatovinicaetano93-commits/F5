import { z } from 'zod';

export const notaFiscalSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  nfNumber: z.string(),
  nfSeries: z.string(),
  nfDate: z.date(),
  emitente: z.string(),
  destinatario: z.string(),
  valorTotal: z.number().positive(),
  valorBaseIcms: z.number().nonnegative(),
  valorIcms: z.number().nonnegative(),
  uploadedAt: z.date(),
  processedAt: z.date().optional(),
});

export const notaFiscalItemSchema = z.object({
  sku: z.string(),
  descricao: z.string(),
  quantidade: z.number().positive(),
  valorUnitario: z.number().positive(),
  valorTotal: z.number().positive(),
  marketplace: z.string().optional(),
});

export const uploadNFSchema = z.object({
  file: z.instanceof(File).refine((f) => f.type === 'application/xml', {
    message: 'Apenas arquivos XML são aceitos',
  }),
});

export type NotaFiscal = z.infer<typeof notaFiscalSchema>;
export type NotaFiscalItem = z.infer<typeof notaFiscalItemSchema>;
export type UploadNF = z.infer<typeof uploadNFSchema>;
