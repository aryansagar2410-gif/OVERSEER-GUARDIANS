import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, serverErrorResponse, unauthenticatedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    const [
      totalProducts,
      activeProducts,
      warehouses,
      locations,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.warehouse.count({ where: { isActive: true } }),
      prisma.stockLocation.count({ where: { isActive: true } }),
      prisma.document.count({ where: { type: 'RECEIPT', status: 'DRAFT' } }),
      prisma.document.count({ where: { type: 'DELIVERY', status: 'DRAFT' } }),
      prisma.document.count({ where: { type: 'TRANSFER', status: 'DRAFT' } })
    ]);

    // Aggregate inventory quantity
    const stockResult = await prisma.stockLevel.aggregate({
      _sum: { quantity: true }
    });
    
    // Today's movements
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const movements = await prisma.stockMovement.groupBy({
      by: ['type'],
      where: { createdAt: { gte: today } },
      _count: { _all: true }
    });

    const todayMovements = {
      RECEIPT: 0,
      DELIVERY: 0,
      TRANSFER: 0,
      ADJUSTMENT: 0
    };

    for (const mov of movements) {
      if (mov.type in todayMovements) {
        todayMovements[mov.type as keyof typeof todayMovements] = mov._count._all;
      }
    }

    return successResponse({
      totalProducts,
      activeProducts,
      totalInventory: stockResult._sum.quantity || 0,
      warehouses,
      locations,
      todayMovements,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
