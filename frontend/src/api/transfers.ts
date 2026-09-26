import { apiClient } from './client';
import { MovementRecord } from '../types/inventory';

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
  fromLocation?: {
    name: string;
  };
  toLocation?: {
    name: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
}

const mapMovementToTransfer = (mov: BackendStockMovement): MovementRecord => {
  return {
    id: mov.id,
    ref: mov.documentId || `TRF-${mov.id.substring(0, 8).toUpperCase()}`,
    date: new Date(mov.createdAt).toLocaleDateString(),
    time: new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date(mov.createdAt).toLocaleString(),
    productName: mov.product?.name || 'Unknown Product',
    sku: mov.product?.sku || 'UNKNOWN-SKU',
    type: 'Transfer',
    qtyRaw: String(mov.quantity),
    deltaQty: String(mov.quantity) + ' moved (Net 0)',
    numericDelta: 0,
    source: mov.fromLocation?.name || 'Unknown Source',
    destination: mov.toLocation?.name || 'Unknown Dest',
    status: 'Validated',
    operator: mov.createdBy?.name || 'System',
    operatorInitials: mov.createdBy?.name?.substring(0,2).toUpperCase() || 'SY',
    batch: 'API-TRF',
    serials: 'N/A',
    hash: '0x' + mov.id.substring(0, 8),
  };
};

export const getTransfers = async (page = 1, limit = 100): Promise<{ data: MovementRecord[]; meta: any }> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: 'TRANSFER'
  });

  const res = await apiClient<{ data: BackendStockMovement[]; meta: any }>(`/stock-movements?${query.toString()}`, {
    method: 'GET',
  });

  return {
    data: (res.data || []).map(mapMovementToTransfer),
    meta: res.meta,
  };
};

export interface CreateTransferPayload {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  documentId?: string;
}

export const createTransfer = async (payload: CreateTransferPayload): Promise<MovementRecord> => {
  const body = {
    ...payload,
    type: 'TRANSFER'
  };

  const res = await apiClient<BackendStockMovement>('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return mapMovementToTransfer(res);
};




