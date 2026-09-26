import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { categoryCreateSchema } from '@/validators/category';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return successResponse({ data: categories });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    if (!hasPermission(user.role, 'MANAGER')) return unauthorizedResponse();

    const body = await request.json();
    const validation = categoryCreateSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors[0].message);
    }
    const { name, description } = validation.data;

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return errorResponse('DUPLICATE_CATEGORY', 'Category with this name already exists', 409);
    }

    const category = await prisma.category.create({
      data: { name, description }
    });

    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'CREATE', entity: 'CATEGORY', entityId: category.id, newData: JSON.stringify(category) }
    });

    return successResponse(category, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
