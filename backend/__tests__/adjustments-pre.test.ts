import { prisma } from '../src/lib/prisma';
import { StockService } from '../src/services/StockService';

describe('Phase 7: Adjustments Pre-requisites', () => {
  let adminUserId: string;
  let locId: string;
  let prodId: string;
  
  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@stocksense.local' }});
    adminUserId = admin!.id;
    
    const locs = await prisma.stockLocation.findMany({ take: 1 });
    locId = locs[0].id;

    const prod = await prisma.product.findUnique({ where: { sku: 'LP-PRO-01' }});
    prodId = prod!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Document type collision should be prevented', async () => {
    const docId = 'COLLISION-DOC-' + Date.now();
    
    // Create a receipt
    await StockService.createMovement({
      productId: prodId,
      toLocationId: locId,
      quantity: 10,
      type: 'RECEIPT',
      documentId: docId,
      createdById: adminUserId
    });
    
    // Try to create an adjustment with the same documentId
    await expect(StockService.createMovement({
      productId: prodId,
      toLocationId: locId, // positive adjustment
      quantity: 5,
      type: 'ADJUSTMENT',
      documentId: docId,
      createdById: adminUserId
    })).rejects.toThrow('Document collision');
  });

  test('Adjustment retry is idempotent (identical payload)', async () => {
    const docId = 'ADJ-RETRY-' + Date.now();
    
    // Create an adjustment
    const mov1 = await StockService.createMovement({
      productId: prodId,
      toLocationId: locId, // positive adjustment
      quantity: 10,
      type: 'ADJUSTMENT',
      documentId: docId,
      createdById: adminUserId
    });
    
    // Retry exact same adjustment
    const mov2 = await StockService.createMovement({
      productId: prodId,
      toLocationId: locId,
      quantity: 10,
      type: 'ADJUSTMENT',
      documentId: docId,
      createdById: adminUserId
    });
    
    // Should return the identical movement
    expect(mov1.id).toBe(mov2.id);
  });
});

