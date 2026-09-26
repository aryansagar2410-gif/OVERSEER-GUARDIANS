import { PrismaClient } from '@prisma/client';
import { StockService } from './src/services/StockService';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { sku: 'LP-PRO-01' }
  });

  if (!product) throw new Error('Product not found');

  const locA = await prisma.stockLocation.findFirst({ where: { name: { contains: 'Dock' } } });
  const locB = await prisma.stockLocation.findFirst({ where: { name: { contains: 'Staging' } } });
  
  if (!locA || !locB) throw new Error('Locations not found');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  console.log(`Starting E2E Reconciliation for Product: ${product.sku}`);

  // Fetch initial stock in LocA
  const initialStockA = await prisma.stockLevel.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locA.id } }
  });
  const startQtyA = initialStockA?.quantity || 0;
  console.log(`Initial Stock (LocA): ${startQtyA}`);

  const initialStockB = await prisma.stockLevel.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locB.id } }
  });
  const startQtyB = initialStockB?.quantity || 0;
  console.log(`Initial Stock (LocB): ${startQtyB}`);

  console.log('--- EXECUTING TRANSACTIONS ---');
  
  // 1. Receipt +50 to LocA
  await StockService.createMovement({
    productId: product.id,
    type: 'RECEIPT',
    quantity: 50,
    fromLocationId: null,
    toLocationId: locA.id,
    createdById: admin!.id
  });
  console.log('+50 Receipt to LocA');

  // 2. Delivery -10 from LocA
  await StockService.createMovement({
    productId: product.id,
    type: 'DELIVERY',
    quantity: 10,
    fromLocationId: locA.id,
    toLocationId: null,
    createdById: admin!.id
  });
  console.log('-10 Delivery from LocA');

  // 3. Transfer 15 from LocA to LocB
  await StockService.createMovement({
    productId: product.id,
    type: 'TRANSFER',
    quantity: 15,
    fromLocationId: locA.id,
    toLocationId: locB.id,
    createdById: admin!.id
  });
  console.log('Transfer 15 from LocA -> LocB');

  // 4. Adjustment +5 to LocA
  await StockService.createMovement({
    productId: product.id,
    type: 'ADJUSTMENT',
    quantity: 5,
    fromLocationId: null,
    toLocationId: locA.id,
    createdById: admin!.id
  });
  console.log('+5 Adjustment to LocA');

  // 5. Adjustment -2 from LocB
  await StockService.createMovement({
    productId: product.id,
    type: 'ADJUSTMENT',
    quantity: 2,
    fromLocationId: locB.id,
    toLocationId: null,
    createdById: admin!.id
  });
  console.log('-2 Adjustment from LocB');

  console.log('--- FINAL STATE ---');
  
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

  console.log(`Expected LocA: ${expectedA}, Actual DB: ${finalQtyA}`);
  console.log(`Expected LocB: ${expectedB}, Actual DB: ${finalQtyB}`);

  if (expectedA === finalQtyA && expectedB === finalQtyB) {
    console.log('RECONCILIATION SUCCESS: EQUATION BALANCES PERFECTLY.');
  } else {
    console.error('RECONCILIATION FAILED.');
  }

}

main().catch(console.error);
