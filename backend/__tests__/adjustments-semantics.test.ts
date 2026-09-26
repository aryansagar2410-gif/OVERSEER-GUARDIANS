import { prisma } from '../src/lib/prisma';
import { StockService } from '../src/services/StockService';

describe('Phase 7: Adjustment Semantics', () => {
  let adminUserId: string;
  let locId: string;
  let prodId: string;

  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@stocksense.local' }});
    adminUserId = admin!.id;
    
    const locs = await prisma.stockLocation.findMany({ take: 3 });
    locId = locs[2].id; // isolated location to prevent concurrent test collision

    const prod = await prisma.product.findUnique({ where: { sku: 'LP-PRO-01' }});
    prodId = prod!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Negative Adjustment (100 -> 92 produces -8 effect)', async () => {
    const start = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locId }}}))?.quantity || 0;
    
    const mov = await StockService.createMovement({
      productId: prodId,
      fromLocationId: locId, // using fromLocationId causes decrement
      toLocationId: null,
      quantity: 8,
      type: 'ADJUSTMENT',
      documentId: 'ADJ-NEG-' + Date.now(),
      createdById: adminUserId
    });

    const end = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locId }}}))?.quantity || 0;
    
    expect(mov.type).toBe('ADJUSTMENT');
    expect(mov.quantity).toBe(8);
    expect(mov.fromLocationId).toBe(locId);
    expect(mov.toLocationId).toBeNull();
    expect(end).toBe(start - 8);
  });

  test('Positive Adjustment (Current -> +8 effect)', async () => {
    const start = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locId }}}))?.quantity || 0;
    
    const mov = await StockService.createMovement({
      productId: prodId,
      fromLocationId: null,
      toLocationId: locId, // using toLocationId causes increment
      quantity: 8,
      type: 'ADJUSTMENT',
      documentId: 'ADJ-POS-' + Date.now(),
      createdById: adminUserId
    });

    const end = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locId }}}))?.quantity || 0;
    
    expect(mov.type).toBe('ADJUSTMENT');
    expect(mov.quantity).toBe(8);
    expect(mov.fromLocationId).toBeNull();
    expect(mov.toLocationId).toBe(locId);
    expect(end).toBe(start + 8);
  });
});
