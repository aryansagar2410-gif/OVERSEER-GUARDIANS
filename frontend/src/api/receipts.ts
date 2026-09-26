import { apiClient } from './client';
import { InboundReceipt } from '../types/inventory';
import { Product } from '../types/inventory';

// Backend response from /api/stock-movements
interface BackendStockMovement {
  id: string;
  productId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  type: string;
  documentId: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
  toLocation?: {
    name: string;
    warehouse?: {
      name: string;
    }
  };
  createdBy: {
    name: string;
    email: string;
  };
}

const mapMovementToReceipt = (mov: BackendStockMovement): InboundReceipt => {
  return {
    id: mov.id,
    ref: mov.documentId || `MOV-${mov.id.substring(0, 8).toUpperCase()}`,
    vendor: mov.createdBy?.name || 'System Admin',
    productName: mov.product?.name || 'Unknown Product',
    sku: mov.product?.sku || 'UNKNOWN-SKU',
    status: 'done',
    quantity: mov.quantity,
    unit: 'pcs',
    dock: 'N/A',
    targetBay: mov.toLocation?.name || 'Unknown Location',
    verifiedBy: mov.createdBy?.name || 'System',
    verifiedTime: new Date(mov.createdAt).toLocaleString(),
  };
};

export const getReceipts = async (page = 1, limit = 100): Promise<{ data: InboundReceipt[]; meta: any }> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: 'RECEIPT'
  });

  // Expected double-wrapper: { success: true, data: { data: [...], meta: {...} } }
  const res = await apiClient<{ data: BackendStockMovement[]; meta: any }>(`/stock-movements?${query.toString()}`, {
    method: 'GET',
  });

  return {
    data: (res.data || []).map(mapMovementToReceipt),
    meta: res.meta,
  };
};

export interface CreateReceiptPayload {
  productId: string;
  toLocationId: string;
  quantity: number;
  documentId?: string;
}

export const createReceipt = async (payload: CreateReceiptPayload): Promise<InboundReceipt> => {
  const body = {
    ...payload,
    type: 'RECEIPT'
  };

  const res = await apiClient<BackendStockMovement>('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return mapMovementToReceipt(res);
};
