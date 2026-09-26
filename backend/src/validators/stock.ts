import { z } from 'zod';

export const stockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  fromLocationId: z.string().uuid('Invalid location ID').nullable().optional(),
  toLocationId: z.string().uuid('Invalid location ID').nullable().optional(),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  type: z.enum(['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT']),
  documentId: z.string().uuid('Invalid document ID').nullable().optional(),
});
