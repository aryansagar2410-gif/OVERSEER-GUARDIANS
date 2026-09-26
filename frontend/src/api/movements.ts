import { apiClient } from './client';

export interface CreateMovementPayload {
  productId: string;
  type: 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  fromLocationId?: string;
  toLocationId?: string;
  documentId?: string;
}

export const createMovement = async (payload: CreateMovementPayload) => {
  return apiClient<any>('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getMovements = async (type?: string, productId?: string) => {
  const query = new URLSearchParams();
  if (type) query.append('type', type);
  if (productId) query.append('productId', productId);

  return apiClient<{ movements: any[]; meta: any }>(`/stock-movements?${query.toString()}`, {
    method: 'GET',
  });
};
