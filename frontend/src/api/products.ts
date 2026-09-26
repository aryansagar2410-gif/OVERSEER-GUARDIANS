import { apiClient } from './client';
import { Product } from '../types/inventory';

// Matches the backend Prisma model shape returned by GET /api/products
interface BackendProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: string;
  uom: string;
  minimumStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  stockLevels: Array<{
    id: string;
    quantity: number;
    locationId: string;
    location?: {
      name: string;
      warehouse?: {
        name: string;
      }
    }
  }>;
}

const mapBackendProductToFrontend = (bp: BackendProduct): Product => {
  const onHand = bp.stockLevels?.reduce((sum, level) => sum + level.quantity, 0) || 0;
  
  let status: 'healthy' | 'low-stock' | 'out-of-stock' = 'healthy';
  let deficit = 0;
  
  if (onHand <= 0) {
    status = 'out-of-stock';
  } else if (onHand <= bp.minimumStock || onHand <= bp.reorderLevel) {
    status = 'low-stock';
    const target = Math.max(bp.minimumStock, bp.reorderLevel);
    deficit = target - onHand;
  }

  // Best effort location string
  let locationStr = 'Unassigned';
  if (bp.stockLevels && bp.stockLevels.length === 1 && bp.stockLevels[0].location) {
    locationStr = bp.stockLevels[0].location.name;
    if (bp.stockLevels[0].location.warehouse) {
      locationStr = `${bp.stockLevels[0].location.warehouse.name} - ${locationStr}`;
    }
  } else if (bp.stockLevels && bp.stockLevels.length > 1) {
    locationStr = 'Multiple Locations';
  }

  return {
    id: bp.id,
    sku: bp.sku,
    barcode: bp.barcode,
    name: bp.name,
    // Safely cast or fallback category
    category: (bp.category?.name || 'Hardware') as any,
    location: locationStr,
    onHand,
    unit: bp.uom || 'pcs',
    status,
    bufferTriggerText: `Min ${bp.minimumStock} | RO ${bp.reorderLevel}`,
    reorderPoint: bp.reorderLevel,
    deficit,
    // Generate a placeholder image based on name or ID to avoid breaking UI
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(bp.name)}&background=random`,
    imageAlt: bp.name
  };
};

export const getProducts = async (page = 1, limit = 100, search = '', categoryId = ''): Promise<{ data: Product[]; meta: any }> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) query.append('search', search);
  if (categoryId) query.append('categoryId', categoryId);

  // successResponse format: { success: true, data: { data: BackendProduct[], meta: any } }
  const res = await apiClient<{ data: BackendProduct[]; meta: any }>(`/products?${query.toString()}`, {
    method: 'GET',
  });

  return {
    data: (res.data || []).map(mapBackendProductToFrontend),
    meta: res.meta,
  };
};

export const getProductById = async (id: string): Promise<Product> => {
  // successResponse format: { success: true, data: BackendProduct }
  const res = await apiClient<BackendProduct>(`/products/${id}`, {
    method: 'GET',
  });
  return mapBackendProductToFrontend(res);
};

export interface CreateProductPayload {
  name: string;
  sku: string;
  categoryId: string;
  uom: string;
  minimumStock: number;
}

export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await apiClient<BackendProduct>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapBackendProductToFrontend(res);
};

export const updateProduct = async (id: string, payload: Partial<CreateProductPayload>): Promise<Product> => {
  const res = await apiClient<BackendProduct>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapBackendProductToFrontend(res);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient(`/products/${id}`, {
    method: 'DELETE',
  });
};
