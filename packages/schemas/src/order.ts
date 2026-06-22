import { z } from 'zod';

// Order status
export const orderStatusEnum = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;

// Order schema
export const orderSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  marketplaceOrderId: z.string().min(1, 'ID do pedido obrigatório'),
  status: orderStatusEnum,
  total: z.number().positive('Total deve ser positivo'),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  buyer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  address: z.object({
    street: z.string(),
    number: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Order = z.infer<typeof orderSchema>;

// Create order input
export const createOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
