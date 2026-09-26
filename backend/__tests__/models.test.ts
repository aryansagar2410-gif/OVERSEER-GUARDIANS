import { PrismaClient } from '@prisma/client';

describe('Database Models', () => {
  it('should instantiate Prisma client successfully', () => {
    const prisma = new PrismaClient();
    expect(prisma).toBeDefined();
  });

  it('should have correct model definitions generated', () => {
    const prisma = new PrismaClient();
    expect(prisma.user).toBeDefined();
    expect(prisma.product).toBeDefined();
    expect(prisma.stockMovement).toBeDefined();
    expect(prisma.auditLog).toBeDefined();
  });
});
