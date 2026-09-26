import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, serverErrorResponse, unauthenticatedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const locationId = searchParams.get('locationId');
    const warehouseId = searchParams.get('warehouseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (locationId) where.locationId = locationId;
    if (warehouseId) {
      where.location = { warehouseId };
    }

    const [stockLevels, total] = await Promise.all([
      prisma.stockLevel.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, sku: true, barcode: true, uom: true } },
          location: { include: { warehouse: true } }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.stockLevel.count({ where })
    ]);

    return successResponse({
      data: stockLevels,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
