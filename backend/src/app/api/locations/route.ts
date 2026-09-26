import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');

    const locations = await prisma.stockLocation.findMany({
      where: {
        isActive: true,
        ...(warehouseId && { warehouseId })
      },
      include: { warehouse: true },
      orderBy: { name: 'asc' }
    });

    return successResponse({ data: locations });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    if (!hasPermission(user.role, 'MANAGER')) return unauthorizedResponse();

    const { name, warehouseId } = await request.json();

    if (!name || !warehouseId) {
      return errorResponse('VALIDATION_ERROR', 'Name and warehouseId are required', 422);
    }

    const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      return errorResponse('WAREHOUSE_NOT_FOUND', 'Warehouse not found', 404);
    }

    const location = await prisma.stockLocation.create({
      data: { name, warehouseId }
    });

    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'CREATE', entity: 'LOCATION', entityId: location.id, newData: JSON.stringify(location) }
    });

    return successResponse(location, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
