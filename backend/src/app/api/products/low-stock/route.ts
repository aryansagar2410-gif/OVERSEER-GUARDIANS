import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, serverErrorResponse, unauthenticatedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // A product is low stock if the sum of its stock levels across all locations
    // is less than or equal to its reorderLevel or minimumStock, and it is active.
    
    // We can do this safely by querying products and aggregating their stock.
    // However, for efficiency, let's fetch products with their stock levels, then filter in memory
    // if the logic is complex, or we can use Prisma groupBy if we only need aggregate quantities.
    
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        stockLevels: {
          include: {
            location: { include: { warehouse: true } }
          }
        }
      }
    });

    const lowStockProducts = activeProducts.map(product => {
      const currentTotalStock = product.stockLevels.reduce((sum, level) => sum + level.quantity, 0);
      return { ...product, currentTotalStock };
    }).filter(p => p.currentTotalStock <= Math.max(p.reorderLevel, p.minimumStock));

    const paginated = lowStockProducts.slice(skip, skip + limit);
    const total = lowStockProducts.length;

    return successResponse({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
