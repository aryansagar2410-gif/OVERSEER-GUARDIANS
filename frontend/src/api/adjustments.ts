import { apiClient } from './client';
import { MovementRecord } from '../types/inventory';

export interface CreateAdjustmentPayload {
  productId: string;
  locationId: string;
  quantity: number;
  isPositive: boolean;
  documentId?: string;
  reason?: string;
}

export const createAdjustment = async (payload: CreateAdjustmentPayload): Promise<MovementRecord> => {
  const body = {
    productId: payload.productId,
    fromLocationId: payload.isPositive ? null : payload.locationId,
    toLocationId: payload.isPositive ? payload.locationId : null,
    quantity: payload.quantity,
    documentId: payload.documentId,
    type: 'ADJUSTMENT'
  };

  const res = await apiClient<any>('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return {
    id: res.id,
    ref: res.documentId || `ADJ-${res.id.substring(0, 8).toUpperCase()}`,
    date: new Date(res.createdAt).toLocaleDateString(),
    time: new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date(res.createdAt).toLocaleString(),
    productName: res.product?.name || 'Unknown Product',
    sku: res.product?.sku || 'UNKNOWN-SKU',
    type: 'Adjustment',
    qtyRaw: String(res.quantity),
    deltaQty: ``,
    numericDelta: payload.isPositive ? res.quantity : -res.quantity,
    source: payload.isPositive ? 'System' : (res.fromLocation?.name || 'Unknown'),
    destination: payload.isPositive ? (res.toLocation?.name || 'Unknown') : 'System',
    status: 'Validated',
    operator: res.createdBy?.name || 'System',
    operatorInitials: res.createdBy?.name?.substring(0,2).toUpperCase() || 'SY',
    batch: payload.reason || 'N/A',
    serials: 'N/A',
    hash: `0x${res.id.substring(0, 8)}`
  };
};
