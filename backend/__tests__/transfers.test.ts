import { prisma } from '../src/lib/prisma';
import { StockService } from '../src/services/StockService';

describe('Phase 6: Transfers Integration', () => {
  let adminUserId: string;
  let locA: string;
  let locB: string;
  let locC: string;
  let prodId: string;
  let doc1 = 'TRF-TEST-1-' + Date.now();
  let doc2 = 'TRF-TEST-2-' + Date.now();
  let docDup = 'TRF-TEST-DUP-' + Date.now();
  let doc0 = 'TRF-SETUP-' + Date.now();

  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@stocksense.local' }});
    adminUserId = admin!.id;
    
    const locs = await prisma.stockLocation.findMany({ take: 3 });
    locA = locs[0].id;
    locB = locs[1].id;
    locC = locs[2].id;

    const prod = await prisma.product.findUnique({ where: { sku: 'LP-PRO-01' }});
    prodId = prod!.id;

    // Set up initial stock at locA and locB
    await StockService.createMovement({
      productId: prodId,
      toLocationId: locA,
      quantity: 100,
      type: 'RECEIPT',
      documentId: doc0 + '-A',
      createdById: adminUserId
    });

    await StockService.createMovement({
      productId: prodId,
      toLocationId: locB,
      quantity: 50,
      type: 'RECEIPT',
      documentId: doc0 + '-B',
      createdById: adminUserId
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('STEP 4 — CRITICAL STOCK FLOW / STEP 9 — LOCATION CORRECTNESS', async () => {
    const startA = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locA }}}))?.quantity || 0;
    const startB = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locB }}}))?.quantity || 0;
    const startC = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locC }}}))?.quantity || 0;

    const mov = await StockService.createMovement({
      productId: prodId,
      fromLocationId: locA,
      toLocationId: locB,
      quantity: 20,
      type: 'TRANSFER',
      documentId: doc1,
      createdById: adminUserId
    });

    expect(mov.quantity).toBe(20);
    expect(mov.type).toBe('TRANSFER');

    const endA = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locA }}}))?.quantity;
    const endB = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locB }}}))?.quantity;
    const endC = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locC }}}))?.quantity || 0;

    expect(endA).toBe(startA - 20);
    expect(endB).toBe(startB + 20);
    expect(endC).toBe(startC); // C remains unchanged
  });

  test('STEP 5 — ATOMICITY TEST (Insufficient stock)', async () => {
    const startA = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locA }}}))?.quantity || 0;
    const startB = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locB }}}))?.quantity || 0;

    const attemptQty = startA + 10;
    
    await expect(StockService.createMovement({
      productId: prodId,
      fromLocationId: locA,
      toLocationId: locB,
      quantity: attemptQty,
      type: 'TRANSFER',
      documentId: doc2,
      createdById: adminUserId
    })).rejects.toThrow('Insufficient stock');
    
    const endA = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locA }}}))?.quantity;
    const endB = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locB }}}))?.quantity;

    expect(endA).toBe(startA);
    expect(endB).toBe(startB);
  });

  test('STEP 6 — SAME-LOCATION VALIDATION', async () => {
    await expect(StockService.createMovement({
      productId: prodId,
      fromLocationId: locA,
      toLocationId: locA,
      quantity: 10,
      type: 'TRANSFER',
      documentId: 'SAME-LOC',
      createdById: adminUserId
    })).rejects.toThrow('cannot be the same');
  });

  test('STEP 7 — IDEMPOTENCY', async () => {
    const startA = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locA }}}))?.quantity || 0;
    const startB = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locB }}}))?.quantity || 0;

    await StockService.createMovement({
      productId: prodId,
      fromLocationId: locA,
      toLocationId: locB,
      quantity: 10,
      type: 'TRANSFER',
      documentId: docDup,
      createdById: adminUserId
    });

    const midA = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locA }}}))?.quantity;
    
    expect(midA).toBe(startA - 10);

    await StockService.createMovement({
      productId: prodId,
      fromLocationId: locA,
      toLocationId: locB,
      quantity: 10,
      type: 'TRANSFER',
      documentId: docDup, // Same ID
      createdById: adminUserId
    });

    const endA = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locA }}}))?.quantity;
    const endB = (await prisma.stockLevel.findUnique({ where: { productId_locationId: { productId: prodId, locationId: locB }}}))?.quantity;

    expect(endA).toBe(startA - 10); // NOT startA - 20
    expect(endB).toBe(startB + 10); // NOT startB + 20
  });

  test('STEP 8 — INVALID INPUT TESTS', async () => {
    await expect(StockService.createMovement({
      productId: prodId,
      fromLocationId: locA,
      toLocationId: locB,
      quantity: 0,
      type: 'TRANSFER',
      documentId: 'INV-QTY',
      createdById: adminUserId
    })).rejects.toThrow('Quantity must be greater than zero');
  });
});

