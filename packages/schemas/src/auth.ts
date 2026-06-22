import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  role: z.enum(['admin', 'operator', 'cliente']).default('operator'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// JWT Payload
export const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'operator', 'cliente']),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof jwtPayloadSchema>;

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
