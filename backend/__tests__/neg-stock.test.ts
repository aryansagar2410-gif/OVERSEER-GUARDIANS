import { prisma } from '../src/lib/prisma';
import { StockService } from '../src/services/StockService';

describe('Negative Stock Protection', () => {
  it('rejects delivery greater than stock', async () => {
    const product = await prisma.product.findFirst({ where: { sku: 'LP-PRO-01' } });
    const locs = await prisma.stockLocation.findMany();
    const locA = locs[0];
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    const initialStockA = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: product!.id, locationId: locA!.id } }
    });
    const startQtyA = initialStockA?.quantity || 0;

    await expect(StockService.createMovement({
      productId: product!.id,
      type: 'DELIVERY',
      quantity: startQtyA + 1,
      fromLocationId: locA!.id,
      toLocationId: null,
      createdById: admin!.id
    })).rejects.toThrow();

    const finalStockA = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: product!.id, locationId: locA!.id } }
    });
    expect(finalStockA?.quantity).toBe(startQtyA);
  });
});
