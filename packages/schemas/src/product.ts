import { z } from 'zod';

// Product schema
export const productSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  sku: z.string().min(1, 'SKU obrigatório'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  stock: z.number().int().nonnegative('Estoque não pode ser negativo'),
  image: z.string().url('URL de imagem inválida').optional(),
  marketplace: z.enum(['mercado_livre', 'amazon', 'shopee']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Product = z.infer<typeof productSchema>;

// Create product input
export const createProductSchema = productSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// Update product input
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
