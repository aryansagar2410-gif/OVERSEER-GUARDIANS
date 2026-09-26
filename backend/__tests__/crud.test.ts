import { NextRequest } from 'next/server';
import { GET, POST } from '../src/app/api/products/route';
import { prisma } from '../src/lib/prisma';
import { getUserFromRequest } from '../src/lib/auth';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    }
  },
}));

jest.mock('../src/lib/auth', () => ({
  getUserFromRequest: jest.fn(),
}));

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should list products with pagination and filtering', async () => {
      (getUserFromRequest as jest.Mock).mockReturnValue({ userId: 'user-1', role: 'STAFF' });
      
      const mockProducts = [{ id: 'prod-1', name: 'Product 1' }];
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/products?page=1&limit=10&search=prod');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.data).toEqual(mockProducts);
      expect(json.data.meta.total).toBe(1);
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 if not authenticated', async () => {
      (getUserFromRequest as jest.Mock).mockReturnValue(null);
      
      const request = new NextRequest('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Prod', sku: 'SKU1', categoryId: 'cat-1', uom: 'pcs' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

