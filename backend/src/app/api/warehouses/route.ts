import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        locations: {
          where: { isActive: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return successResponse({ data: warehouses });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    
    if (!hasPermission(user.role, 'ADMIN')) {
      return unauthorizedResponse();
    }

    const { name, code } = await request.json();

    if (!name || !code) {
      return errorResponse('VALIDATION_ERROR', 'Name and code are required', 422);
    }

    const existingCode = await prisma.warehouse.findUnique({ where: { code } });
    if (existingCode) {
      return errorResponse('DUPLICATE_CODE', 'Warehouse with this code already exists', 409);
    }

    const warehouse = await prisma.warehouse.create({
      data: { name, code }
    });

    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'CREATE', entity: 'WAREHOUSE', entityId: warehouse.id, newData: JSON.stringify(warehouse) }
    });

    return successResponse(warehouse, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
