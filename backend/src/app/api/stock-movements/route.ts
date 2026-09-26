import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { StockService } from '@/services/StockService';
import { stockMovementSchema } from '@/validators/stock';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const locationId = searchParams.get('locationId');
    const type = searchParams.get('type');
    const createdBy = searchParams.get('createdBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (createdBy) where.createdById = createdBy;
    if (locationId) {
      where.OR = [
        { fromLocationId: locationId },
        { toLocationId: locationId }
      ];
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { name: true, sku: true, barcode: true } },
          fromLocation: { select: { name: true, warehouse: { select: { name: true } } } },
          toLocation: { select: { name: true, warehouse: { select: { name: true } } } },
          createdBy: { select: { name: true, email: true } },
          document: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    return successResponse({
      data: movements,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    
    // STAFF, MANAGER, ADMIN can do this
    if (!hasPermission(user.role, 'STAFF')) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = stockMovementSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors[0].message);
    }
    
    const data = validation.data;

    const movement = await StockService.createMovement({
      productId: data.productId,
      fromLocationId: data.fromLocationId,
      toLocationId: data.toLocationId,
      quantity: data.quantity,
      type: data.type,
      documentId: data.documentId,
      createdById: user.userId
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE_MOVEMENT',
        entity: 'STOCK_MOVEMENT',
        entityId: movement.id,
        newData: JSON.stringify(movement)
      }
    });

    return successResponse(movement, 201);
  } catch (error: any) {
    return errorResponse('MOVEMENT_ERROR', error.message || 'Failed to create stock movement', 400);
  }
}
