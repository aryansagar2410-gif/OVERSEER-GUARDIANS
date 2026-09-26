import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const location = await prisma.stockLocation.findUnique({
      where: { id: params.id },
      include: { warehouse: true }
    });

    if (!location) return errorResponse('NOT_FOUND', 'Location not found', 404);

    return successResponse(location);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    if (!hasPermission(user.role, 'MANAGER')) return unauthorizedResponse();

    const { name, isActive, warehouseId } = await request.json();

    const location = await prisma.stockLocation.findUnique({ where: { id: params.id } });
    if (!location) return errorResponse('NOT_FOUND', 'Location not found', 404);

    if (warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
      if (!warehouse) return errorResponse('NOT_FOUND', 'Warehouse not found', 404);
    }

    const updated = await prisma.stockLocation.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(isActive !== undefined && { isActive }),
        ...(warehouseId !== undefined && { warehouseId }),
      }
    });

    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'UPDATE', entity: 'LOCATION', entityId: params.id, oldData: JSON.stringify(location), newData: JSON.stringify(updated) }
    });

    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    if (!hasPermission(user.role, 'ADMIN')) return unauthorizedResponse();

    const location = await prisma.stockLocation.findUnique({
      where: { id: params.id },
      include: { _count: { select: { stockLevels: true, movementsIn: true, movementsOut: true } } }
    });

    if (!location) return errorResponse('NOT_FOUND', 'Location not found', 404);

    if (location._count.stockLevels > 0 || location._count.movementsIn > 0 || location._count.movementsOut > 0) {
      const updated = await prisma.stockLocation.update({
        where: { id: params.id },
        data: { isActive: false }
      });
      await prisma.auditLog.create({
        data: { userId: user.userId, action: 'DEACTIVATE', entity: 'LOCATION', entityId: params.id }
      });
      return successResponse({ message: 'Location deactivated because it has stock or history', location: updated });
    }

    await prisma.stockLocation.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'DELETE', entity: 'LOCATION', entityId: params.id }
    });

    return successResponse({ message: 'Location deleted successfully' });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
