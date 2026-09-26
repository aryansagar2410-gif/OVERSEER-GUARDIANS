import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { productUpdateSchema } from '@/validators/product';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { 
        category: true, 
        stockLevels: { include: { location: { include: { warehouse: true } } } }
      }
    });

    if (!product) {
      return errorResponse('PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    return successResponse(product);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    if (!hasPermission(user.role, 'MANAGER')) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors[0].message);
    }

    const data = validation.data;

    const currentProduct = await prisma.product.findUnique({ where: { id: params.id } });
    if (!currentProduct) {
      return errorResponse('PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        return errorResponse('CATEGORY_NOT_FOUND', 'Category not found', 404);
      }
    }

    if (data.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existingSku && existingSku.id !== params.id) {
        return errorResponse('DUPLICATE_SKU', 'Another product with this SKU already exists', 409);
      }
    }

    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode && existingBarcode.id !== params.id) {
        return errorResponse('DUPLICATE_BARCODE', 'Another product with this barcode already exists', 409);
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.uom !== undefined && { uom: data.uom }),
        ...(data.minimumStock !== undefined && { minimumStock: data.minimumStock }),
        ...(data.reorderLevel !== undefined && { reorderLevel: data.reorderLevel }),
        ...(data.reorderQuantity !== undefined && { reorderQuantity: data.reorderQuantity }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'UPDATE',
        entity: 'PRODUCT',
        entityId: product.id,
        oldData: JSON.stringify(currentProduct),
        newData: JSON.stringify(product)
      }
    });

    return successResponse(product);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    if (!hasPermission(user.role, 'ADMIN')) {
      return unauthorizedResponse();
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { 
        _count: { select: { stockLevels: true, stockMovements: true } } 
      }
    });

    if (!product) {
      return errorResponse('PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    if (product._count.stockMovements > 0 || product._count.stockLevels > 0) {
      // Deactivate instead of delete
      const updated = await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false }
      });
      
      await prisma.auditLog.create({
        data: { userId: user.userId, action: 'DEACTIVATE', entity: 'PRODUCT', entityId: params.id }
      });

      return successResponse({ message: 'Product has history and was deactivated instead of deleted', product: updated });
    }

    await prisma.product.delete({
      where: { id: params.id }
    });
    
    await prisma.auditLog.create({
      data: { userId: user.userId, action: 'DELETE', entity: 'PRODUCT', entityId: params.id }
    });

    return successResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
