import { StockService } from '../src/services/StockService';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    product: { findUnique: jest.fn() },
    stockLocation: { findUnique: jest.fn() },
    stockMovement: { create: jest.fn(), findFirst: jest.fn() },
    stockLevel: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('StockService (Stock Ledger)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProduct = { id: 'prod-1', name: 'Product 1' };
  const mockLocation = { id: 'loc-1', name: 'Location 1' };
  const mockLocation2 = { id: 'loc-2', name: 'Location 2' };

  it('should process a Receipt (stock increase)', async () => {
    (prisma.stockMovement.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    (prisma.stockLocation.findUnique as jest.Mock).mockResolvedValue(mockLocation);
    (prisma.stockMovement.create as jest.Mock).mockResolvedValue({ id: 'mov-1' });

    await StockService.createMovement({
      productId: 'prod-1',
      toLocationId: 'loc-1',
      quantity: 5,
      type: 'RECEIPT',
      createdById: 'user-1',
    });

    expect(prisma.stockLevel.upsert).toHaveBeenCalledWith({
      where: {
        productId_locationId: { productId: 'prod-1', locationId: 'loc-1' },
      },
      update: { quantity: { increment: 5 } },
      create: { productId: 'prod-1', locationId: 'loc-1', quantity: 5 },
    });
  });

  it('should be idempotent if movement with same documentId exists', async () => {
    (prisma.stockMovement.findFirst as jest.Mock).mockResolvedValue({ id: 'mov-existing' });

    const result = await StockService.createMovement({
      productId: 'prod-1',
      toLocationId: 'loc-1',
      quantity: 5,
      type: 'RECEIPT',
      documentId: 'doc-123',
      createdById: 'user-1',
    });

    expect(result.id).toBe('mov-existing');
    expect(prisma.stockMovement.create).not.toHaveBeenCalled();
    expect(prisma.stockLevel.upsert).not.toHaveBeenCalled();
  });

  it('should process a Delivery (stock decrease)', async () => {
    (prisma.stockMovement.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    (prisma.stockLocation.findUnique as jest.Mock).mockResolvedValue(mockLocation);
    (prisma.stockMovement.create as jest.Mock).mockResolvedValue({ id: 'mov-2' });
    (prisma.stockLevel.findUnique as jest.Mock).mockResolvedValue({ id: 'sl-1', quantity: 10 });
    (prisma.stockLevel.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await StockService.createMovement({
      productId: 'prod-1',
      fromLocationId: 'loc-1',
      quantity: 3,
      type: 'DELIVERY',
      createdById: 'user-1',
    });

    expect(prisma.stockLevel.updateMany).toHaveBeenCalledWith({
      where: { id: 'sl-1', quantity: { gte: 3 } },
      data: { quantity: { decrement: 3 } },
    });
  });

  it('should fail Delivery if stock is insufficient', async () => {
    (prisma.stockMovement.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    (prisma.stockLocation.findUnique as jest.Mock).mockResolvedValue(mockLocation);
    (prisma.stockLevel.findUnique as jest.Mock).mockResolvedValue({ id: 'sl-1', quantity: 5 });

    await expect(
      StockService.createMovement({
        productId: 'prod-1',
        fromLocationId: 'loc-1',
        quantity: 10,
        type: 'DELIVERY',
        createdById: 'user-1',
      })
    ).rejects.toThrow('Insufficient stock at source location');
  });

  it('should process an Internal Transfer', async () => {
    (prisma.stockMovement.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    (prisma.stockLocation.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockLocation)
      .mockResolvedValueOnce(mockLocation2);
    (prisma.stockLevel.findUnique as jest.Mock).mockResolvedValue({ id: 'sl-1', quantity: 10 });
    (prisma.stockLevel.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.stockMovement.create as jest.Mock).mockResolvedValue({ id: 'mov-3' });

    await StockService.createMovement({
      productId: 'prod-1',
      fromLocationId: 'loc-1',
      toLocationId: 'loc-2',
      quantity: 4,
      type: 'TRANSFER',
      createdById: 'user-1',
    });

    expect(prisma.stockLevel.updateMany).toHaveBeenCalled();
    expect(prisma.stockLevel.upsert).toHaveBeenCalled();
  });

  it('should reject transfer to same location', async () => {
    await expect(
      StockService.createMovement({
        productId: 'prod-1',
        fromLocationId: 'loc-1',
        toLocationId: 'loc-1',
        quantity: 4,
        type: 'TRANSFER',
        createdById: 'user-1',
      })
    ).rejects.toThrow('Source and destination locations cannot be the same');
  });

  it('should not allow negative quantities', async () => {
    await expect(
      StockService.createMovement({
        productId: 'prod-1',
        toLocationId: 'loc-1',
        quantity: -5,
        type: 'RECEIPT',
        createdById: 'user-1',
      })
    ).rejects.toThrow('Quantity must be greater than zero');
  });
});
