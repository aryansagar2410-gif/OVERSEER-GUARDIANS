import { prisma } from '../src/lib/prisma';
import { StockService } from '../src/services/StockService';

describe('E2E Reconciliation', () => {
  it('balances perfectly', async () => {
    const product = await prisma.product.findFirst({
      where: { sku: 'LP-PRO-01' }
    });
    if (!product) throw new Error('Product not found');

    const locations = await prisma.stockLocation.findMany({ take: 2 });
    
    if (locations.length < 2) throw new Error('Locations not found');
    const locA = locations[0];
    const locB = locations[1];

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    // Fetch initial stock in LocA
    const initialStockA = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: product.id, locationId: locA.id } }
    });
    const startQtyA = initialStockA?.quantity || 0;

    const initialStockB = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: product.id, locationId: locB.id } }
    });
    const startQtyB = initialStockB?.quantity || 0;

    // 1. Receipt +50 to LocA
    await StockService.createMovement({
      productId: product.id,
      type: 'RECEIPT',
      quantity: 50,
      fromLocationId: null,
      toLocationId: locA.id,
      createdById: admin!.id
    });

    // 2. Delivery -10 from LocA
    await StockService.createMovement({
      productId: product.id,
      type: 'DELIVERY',
      quantity: 10,
      fromLocationId: locA.id,
      toLocationId: null,
      createdById: admin!.id
    });

    // 3. Transfer 15 from LocA to LocB
    await StockService.createMovement({
      productId: product.id,
      type: 'TRANSFER',
      quantity: 15,
      fromLocationId: locA.id,
      toLocationId: locB.id,
      createdById: admin!.id
    });

    // 4. Adjustment +5 to LocA
    await StockService.createMovement({
      productId: product.id,
      type: 'ADJUSTMENT',
      quantity: 5,
      fromLocationId: null,
      toLocationId: locA.id,
      createdById: admin!.id
    });

    // 5. Adjustment -2 from LocB
    await StockService.createMovement({
      productId: product.id,
      type: 'ADJUSTMENT',
      quantity: 2,
      fromLocationId: locB.id,
      toLocationId: null,
      createdById: admin!.id
    });
    
    const finalStockA = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: product.id, locationId: locA.id } }
    });
    const finalQtyA = finalStockA?.quantity || 0;

    const finalStockB = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: product.id, locationId: locB.id } }
    });
    const finalQtyB = finalStockB?.quantity || 0;

    const expectedA = startQtyA + 50 - 10 - 15 + 5;
    const expectedB = startQtyB + 15 - 2;

    expect(finalQtyA).toBe(expectedA);
    expect(finalQtyB).toBe(expectedB);
  });
});
