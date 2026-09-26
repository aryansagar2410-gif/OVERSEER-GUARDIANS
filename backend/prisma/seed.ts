import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.auditLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.stockLocation.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: { email: 'admin@stocksense.local', password, name: 'Admin User', role: 'ADMIN' }
  });
  const manager = await prisma.user.create({
    data: { email: 'manager@stocksense.local', password, name: 'Manager User', role: 'MANAGER' }
  });
  const staff = await prisma.user.create({
    data: { email: 'staff@stocksense.local', password, name: 'Staff User', role: 'STAFF' }
  });
  const viewer = await prisma.user.create({
    data: { email: 'viewer@stocksense.local', password, name: 'Viewer User', role: Role.VIEWER }
  });

  console.log('Seeding Categories...');
  const catElectronics = await prisma.category.create({ data: { name: 'Electronics', description: 'Electronic items' } });
  const catOffice = await prisma.category.create({ data: { name: 'Office', description: 'Office supplies' } });
  const catHardware = await prisma.category.create({ data: { name: 'Hardware', description: 'Hardware tools' } });
  const catAccessories = await prisma.category.create({ data: { name: 'Accessories', description: 'Tech Accessories' } });

  console.log('Seeding Warehouses and Locations...');
  const whMain = await prisma.warehouse.create({
    data: { name: 'Main Warehouse', code: 'MAIN' }
  });
  const whSec = await prisma.warehouse.create({
    data: { name: 'Secondary Warehouse', code: 'SEC' }
  });

  const locA01 = await prisma.stockLocation.create({ data: { name: 'A-01', warehouseId: whMain.id } });
  const locA02 = await prisma.stockLocation.create({ data: { name: 'A-02', warehouseId: whMain.id } });
  const locB01 = await prisma.stockLocation.create({ data: { name: 'B-01', warehouseId: whSec.id } });
  const locB02 = await prisma.stockLocation.create({ data: { name: 'B-02', warehouseId: whSec.id } });

  console.log('Seeding Products...');
  const prod1 = await prisma.product.create({
    data: { name: 'Laptop Pro', sku: 'LP-PRO-01', barcode: '123456789012', categoryId: catElectronics.id, uom: 'pcs', minimumStock: 10, reorderLevel: 15, reorderQuantity: 20 }
  });
  const prod2 = await prisma.product.create({
    data: { name: 'Office Chair', sku: 'OF-CH-01', barcode: '234567890123', categoryId: catOffice.id, uom: 'pcs', minimumStock: 5, reorderLevel: 5, reorderQuantity: 10 }
  });
  const prod3 = await prisma.product.create({
    data: { name: 'Wireless Mouse', sku: 'WL-MS-01', barcode: '345678901234', categoryId: catAccessories.id, uom: 'pcs', minimumStock: 20, reorderLevel: 25, reorderQuantity: 50 }
  });

  console.log('Seeding Stock Movements and Levels...');
  // Since we cannot easily import StockService here without potential Next.js module issues, we'll manually seed levels.
  
  await prisma.stockLevel.create({
    data: { productId: prod1.id, locationId: locA01.id, quantity: 50 }
  });
  await prisma.stockMovement.create({
    data: { productId: prod1.id, toLocationId: locA01.id, quantity: 50, type: 'RECEIPT', createdById: admin.id }
  });

  await prisma.stockLevel.create({
    data: { productId: prod2.id, locationId: locB01.id, quantity: 4 } // Low stock
  });
  await prisma.stockMovement.create({
    data: { productId: prod2.id, toLocationId: locB01.id, quantity: 4, type: 'RECEIPT', createdById: admin.id }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

