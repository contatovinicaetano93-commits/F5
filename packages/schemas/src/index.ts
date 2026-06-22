// Export all schemas from F5
export * from './auth';
export * from './product';
export * from './order';

// Type-safe validation function
export function validateSchema<T>(schema: any, data: unknown): T {
  return schema.parse(data);
}
