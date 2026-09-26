import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { productCreateSchema } from '@/validators/product';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
          { barcode: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {})
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, stockLevels: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return successResponse({
      data: products,
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
    
    // Only ADMIN or MANAGER can create products
    if (!hasPermission(user.role, 'MANAGER')) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = productCreateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors[0].message);
    }

    const data = validation.data;

    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return errorResponse('DUPLICATE_SKU', 'Product with this SKU already exists', 409);
    }

    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) {
        return errorResponse('DUPLICATE_BARCODE', 'Product with this barcode already exists', 409);
      }
    }

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      return errorResponse('CATEGORY_NOT_FOUND', 'Category not found', 404);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        categoryId: data.categoryId,
        uom: data.uom,
        minimumStock: data.minimumStock,
        reorderLevel: data.reorderLevel,
        reorderQuantity: data.reorderQuantity,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE',
        entity: 'PRODUCT',
        entityId: product.id,
        newData: JSON.stringify(product)
      }
    });

    return successResponse(product, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
