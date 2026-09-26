import { prisma } from '../src/lib/prisma';
import { StockService } from '../src/services/StockService';

describe('Phase 5: Deliveries Integration', () => {
  let adminUserId: string;
  let locId: string;
  let prodId: string;
  let initialQty: number = 0;
  let doc0 = 'PRE-DELIVERY-SETUP-' + Date.now();
  let doc1 = 'TEST-DEL-1-' + Date.now();
  let docNeg = 'TEST-DEL-NEG-' + Date.now();
  let docDup = 'TEST-DEL-DUP-' + Date.now();

  beforeAll(async () => {
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

  test('TEST A - BASIC DELIVERY', async () => {
    const initialLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    initialQty = initialLevel?.quantity || 0;
    
    // First let's ensure we have enough stock for the basic test
    // Let's add 100 stock
    await StockService.createMovement({
      productId: prodId,
      toLocationId: locId,
      quantity: 100,
      type: 'RECEIPT',
      documentId: doc0,
      createdById: adminUserId
    });
    
    initialQty += 100;

    const mov = await StockService.createMovement({
      productId: prodId,
      fromLocationId: locId,
      quantity: 30,
      type: 'DELIVERY',
      documentId: doc1,
      createdById: adminUserId
    });

    expect(mov.quantity).toBe(30);
    expect(mov.type).toBe('DELIVERY');

    const newLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    expect(newLevel?.quantity).toBe(initialQty - 30);
  });

  test('TEST B - NEGATIVE STOCK PREVENTION', async () => {
    // Current stock is initialQty - 30
    const currentStock = initialQty - 30;
    const attemptQty = currentStock + 10; // Try to deliver more than we have
    
    await expect(StockService.createMovement({
      productId: prodId,
      fromLocationId: locId,
      quantity: attemptQty,
      type: 'DELIVERY',
      documentId: docNeg,
      createdById: adminUserId
    })).rejects.toThrow('Insufficient stock'); // Expecting this exact throw or similar
    
    const newLevel = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    // Stock must remain unchanged
    expect(newLevel?.quantity).toBe(currentStock);
  });

  test('TEST C - DUPLICATE / IDEMPOTENCY', async () => {
    // Deliver another 10
    const mov1 = await StockService.createMovement({
      productId: prodId,
      fromLocationId: locId,
      quantity: 10,
      type: 'DELIVERY',
      documentId: docDup, 
      createdById: adminUserId
    });
    
    const stockAfterFirst = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    
    const mov2 = await StockService.createMovement({
      productId: prodId,
      fromLocationId: locId,
      quantity: 10,
      type: 'DELIVERY',
      documentId: docDup, 
      createdById: adminUserId
    });
    
    const stockAfterSecond = await prisma.stockLevel.findUnique({
      where: { productId_locationId: { productId: prodId, locationId: locId }}
    });
    
    // Stock must remain the same as stockAfterFirst
    expect(stockAfterSecond?.quantity).toBe(stockAfterFirst?.quantity);
  });
});

