import { prisma } from '../src/lib/prisma';
import { StockService } from '../src/services/StockService';
import { stockMovementSchema } from '../src/validators/stock';

describe('Phase 4: Receipts Integration', () => {
  let adminUserId: string;
  let locId: string;
  let prodId: string;
  let initialQty: number = 0;
  let doc1 = 'TEST-DOC-1-' + Date.now();
  let doc2 = 'TEST-DOC-2-' + Date.now();

  beforeAll(async () => {
    // get seeded data
    const admin = await prisma.user.findUnique({ where: { email: 'admin@stocksense.local' }});
    adminUserId = admin!.id;
    
    const loc = await prisma.stockLocation.findFirst({ where: { name: 'A-01' }});
    locId = loc!.id;

    const prod = await prisma.product.findUnique({ where: { sku: 'LP-PRO-01' }});
    prodId = prod!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('TEST A - BASIC RECEIPT', async () => {
    // Initial stock is 50 from seed
    const initialLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    initialQty = initialLevel?.quantity || 0;

    const mov = await StockService.createMovement({
      productId: prodId,
      toLocationId: locId,
      quantity: 50,
      type: 'RECEIPT',
      documentId: doc1,
      createdById: adminUserId
    });

    expect(mov.quantity).toBe(50);
    expect(mov.type).toBe('RECEIPT');

    const newLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    // Expected 50 + 50 = 100
    expect(newLevel?.quantity).toBe(initialQty + 50);
  });

  test('TEST B - SECOND RECEIPT', async () => {
    const mov = await StockService.createMovement({
      productId: prodId,
      toLocationId: locId,
      quantity: 25,
      type: 'RECEIPT',
      documentId: doc2,
      createdById: adminUserId
    });
    
    expect(mov.quantity).toBe(25);

    const newLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    // Expected 100 + 25 = 125
    expect(newLevel?.quantity).toBe(initialQty + 75);
  });

  test('TEST C - DUPLICATE REQUEST', async () => {
    const mov = await StockService.createMovement({
      productId: prodId,
      toLocationId: locId,
      quantity: 25,
      type: 'RECEIPT',
      documentId: doc2, // Same document ID
      createdById: adminUserId
    });
    
    const newLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    // Stock must NOT change, should remain 125
    expect(newLevel?.quantity).toBe(initialQty + 75);
  });

  test('TEST D - INVALID QUANTITY', async () => {
    await expect(StockService.createMovement({
      productId: prodId,
      toLocationId: locId,
      quantity: 0,
      type: 'RECEIPT',
      documentId: 'TEST-DOC-3',
      createdById: adminUserId
    })).rejects.toThrow('Quantity must be greater than zero');
  });

  test('TEST E - INVALID PRODUCT', async () => {
    await expect(StockService.createMovement({
      productId: 'invalid-id',
      toLocationId: locId,
      quantity: 10,
      type: 'RECEIPT',
      documentId: 'TEST-DOC-4',
      createdById: adminUserId
    })).rejects.toThrow('Product not found');
  });
});



