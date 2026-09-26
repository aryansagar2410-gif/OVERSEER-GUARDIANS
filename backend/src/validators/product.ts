import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  uom: z.string().min(1, 'Unit of Measure is required'),
  minimumStock: z.number().int().nonnegative().optional().default(0),
  reorderLevel: z.number().int().nonnegative().optional().default(0),
  reorderQuantity: z.number().int().nonnegative().optional().default(0),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});
