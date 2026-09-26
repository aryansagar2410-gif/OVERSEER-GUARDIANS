import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, unauthenticatedResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const product = await prisma.product.findUnique({
      where: { barcode: params.barcode },
      include: {
        category: true,
        stockLevels: {
          include: {
            location: { include: { warehouse: true } }
          }
        }
      }
    });

    if (!product) {
      return errorResponse('PRODUCT_NOT_FOUND', 'Product with given barcode not found', 404);
    }

    const currentTotalStock = product.stockLevels.reduce((sum, level) => sum + level.quantity, 0);

    return successResponse({
      ...product,
      currentTotalStock
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
