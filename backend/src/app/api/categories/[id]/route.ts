import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { categoryUpdateSchema } from '@/validators/category';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { products: true }
    });

    if (!category) {
      return errorResponse('CATEGORY_NOT_FOUND', 'Category not found', 404);
    }

    return successResponse(category);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    if (!hasPermission(user.role, 'MANAGER')) return unauthorizedResponse();

    const body = await request.json();
    const validation = categoryUpdateSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors[0].message);
    }
    const { name, description } = validation.data;

    const currentCategory = await prisma.category.findUnique({ where: { id: params.id } });
    if (!currentCategory) {
      return errorResponse('CATEGORY_NOT_FOUND', 'Category not found', 404);
    }

    if (name) {
      const existing = await prisma.category.findUnique({ where: { name } });
      if (existing && existing.id !== params.id) {
        return errorResponse('DUPLICATE_CATEGORY', 'Category with this name already exists', 409);
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description })
      }
    });

    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'UPDATE', entity: 'CATEGORY', entityId: category.id, oldData: JSON.stringify(currentCategory), newData: JSON.stringify(category) }
    });

    return successResponse(category);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();
    if (!hasPermission(user.role, 'ADMIN')) return unauthorizedResponse();

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      return errorResponse('CATEGORY_NOT_FOUND', 'Category not found', 404);
    }

    if (category._count.products > 0) {
      return errorResponse('CATEGORY_IN_USE', 'Cannot delete category with associated products', 400);
    }

    await prisma.category.delete({
      where: { id: params.id }
    });

    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'DELETE', entity: 'CATEGORY', entityId: params.id }
    });

    return successResponse({ message: 'Category deleted successfully' });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
