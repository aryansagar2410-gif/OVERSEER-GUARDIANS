import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type MovementType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';

export interface CreateMovementParams {
  productId: string;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  quantity: number;
  type: MovementType;
  documentId?: string | null;
  createdById: string;
}

export class StockService {
  /**
   * Centralized method to create a stock movement and update stock levels.
   * Everything runs in a single database transaction to ensure integrity.
   */
  static async createMovement(params: CreateMovementParams) {
    // 1. Basic Validations
    if (params.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    if (params.type === 'RECEIPT' && !params.toLocationId) {
      throw new Error('Receipts must have a destination location');
    }
    if (params.type === 'DELIVERY' && !params.fromLocationId) {
      throw new Error('Deliveries must have a source location');
    }
    if (params.type === 'TRANSFER' && (!params.fromLocationId || !params.toLocationId)) {
      throw new Error('Transfers must have both source and destination locations');
    }
    if (params.type === 'TRANSFER' && params.fromLocationId === params.toLocationId) {
      throw new Error('Source and destination locations cannot be the same');
    }
    if (params.type === 'ADJUSTMENT' && !params.fromLocationId && !params.toLocationId) {
      throw new Error('Adjustments must have at least one location');
    }

    // 2. Execute Transaction
    return await prisma.$transaction(async (tx) => {
      // Idempotency check: If documentId is provided, check if exact movement already exists
      if (params.documentId) {
        const existingMovement = await tx.stockMovement.findFirst({
          where: {
            productId: params.productId,
            fromLocationId: params.fromLocationId || null,
            toLocationId: params.toLocationId || null,
            quantity: params.quantity,
            type: params.type,
            documentId: params.documentId,
          }
        });
        if (existingMovement) {
          return existingMovement; // Idempotent response
        }
      }

      // Validate Product and Locations exist
      const product = await tx.product.findUnique({ where: { id: params.productId } });
      if (!product) throw new Error('Product not found');

      if (params.fromLocationId) {
        const fromLoc = await tx.stockLocation.findUnique({ where: { id: params.fromLocationId } });
        if (!fromLoc) throw new Error('Source location not found');
      }
      if (params.toLocationId) {
        const toLoc = await tx.stockLocation.findUnique({ where: { id: params.toLocationId } });
        if (!toLoc) throw new Error('Destination location not found');
      }

      // 3. Create the Movement (The Ledger Entry)
      const movement = await tx.stockMovement.create({
        data: {
          productId: params.productId,
          fromLocationId: params.fromLocationId || null,
          toLocationId: params.toLocationId || null,
          quantity: params.quantity,
          type: params.type,
          documentId: params.documentId || null,
          createdById: params.createdById,
        },
      });

      // 4. Update Stock Levels safely using conditional atomic updates to prevent negative stock
      if (params.fromLocationId) {
        const currentLevel = await tx.stockLevel.findUnique({
          where: {
            productId_locationId: {
              productId: params.productId,
              locationId: params.fromLocationId,
            }
          }
        });

        if (!currentLevel || currentLevel.quantity < params.quantity) {
          throw new Error('Insufficient stock at source location');
        }

        const updateResult = await tx.stockLevel.updateMany({
          where: { 
            id: currentLevel.id,
            quantity: { gte: params.quantity }
          },
          data: { quantity: { decrement: params.quantity } }
        });

        if (updateResult.count === 0) {
          throw new Error('Insufficient stock at source location due to a concurrent transaction');
        }
      }

      if (params.toLocationId) {
        await tx.stockLevel.upsert({
          where: {
            productId_locationId: {
              productId: params.productId,
              locationId: params.toLocationId,
            }
          },
          update: { quantity: { increment: params.quantity } },
          create: {
            productId: params.productId,
            locationId: params.toLocationId,
            quantity: params.quantity
          }
        });
      }

      return movement;
    });
  }
}
