import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: {
        locations: {
          where: { isActive: true }
        }
      }
    });

    if (!warehouse) return errorResponse('NOT_FOUND', 'Warehouse not found', 404);

    return successResponse(warehouse);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    if (!hasPermission(user.role, 'ADMIN')) return unauthorizedResponse();

    const { name, code, isActive } = await request.json();

    const warehouse = await prisma.warehouse.findUnique({ where: { id: params.id } });
    if (!warehouse) return errorResponse('NOT_FOUND', 'Warehouse not found', 404);

    if (code) {
      const existingCode = await prisma.warehouse.findUnique({ where: { code } });
      if (existingCode && existingCode.id !== params.id) {
        return errorResponse('DUPLICATE_CODE', 'Another warehouse with this code already exists', 409);
      }
    }

    const updated = await prisma.warehouse.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'UPDATE', entity: 'WAREHOUSE', entityId: params.id, oldData: JSON.stringify(warehouse), newData: JSON.stringify(updated) }
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

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: { _count: { select: { locations: true } } }
    });

    if (!warehouse) return errorResponse('NOT_FOUND', 'Warehouse not found', 404);

    if (warehouse._count.locations > 0) {
      // Soft delete instead
      const updated = await prisma.warehouse.update({
        where: { id: params.id },
        data: { isActive: false }
      });
      await prisma.auditLog.create({
        data: { userId: user.userId, action: 'DEACTIVATE', entity: 'WAREHOUSE', entityId: params.id }
      });
      return successResponse({ message: 'Warehouse was deactivated because it has locations', warehouse: updated });
    }

    await prisma.warehouse.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'DELETE', entity: 'WAREHOUSE', entityId: params.id }
    });

    return successResponse({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
