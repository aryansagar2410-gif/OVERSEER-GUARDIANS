import { apiClient } from './client';
import { OutboundDelivery } from '../types/inventory';

interface BackendStockMovement {
  id: string;
  productId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  type: string;
  documentId: string | null;
  createdAt: string;
  product: { name: string; sku: string; };
  fromLocation?: { name: string; warehouse?: { name: string; } };
  createdBy: { name: string; email: string; };
}

const mapMovementToDelivery = (mov: BackendStockMovement): OutboundDelivery => {
  return {
    id: mov.id,
    ref: mov.documentId || `MOV-${mov.id.substring(0, 8).toUpperCase()}`,
    customer: mov.createdBy?.name || 'System Admin',
    productName: mov.product?.name || 'Unknown Product',
    sku: mov.product?.sku || 'UNKNOWN-SKU',
    status: 'done',
    quantity: mov.quantity,
    unit: 'pcs',
    dock: 'N/A',
    sourceBay: mov.fromLocation?.name || 'Unknown Location',
    verifiedBy: mov.createdBy?.name || 'System',
    verifiedTime: new Date(mov.createdAt).toLocaleString(),
  };
};

export const getDeliveries = async (page = 1, limit = 100): Promise<{ data: OutboundDelivery[]; meta: any }> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: 'DELIVERY'
  });
  const res = await apiClient<{ data: BackendStockMovement[]; meta: any }>(`/stock-movements?${query.toString()}`, { method: 'GET' });
  return {
    data: (res.data || []).map(mapMovementToDelivery),
    meta: res.meta,
  };
};

export interface CreateDeliveryPayload {
  productId: string;
  fromLocationId: string;
  quantity: number;
  documentId?: string;
}

export const createDelivery = async (payload: CreateDeliveryPayload): Promise<OutboundDelivery> => {
  const body = {
    ...payload,
    type: 'DELIVERY'
  };
  const res = await apiClient<BackendStockMovement>('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapMovementToDelivery(res);
};
