import { apiClient } from './client';

export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  totalInventory: number;
  warehouses: number;
  locations: number;
  todayMovements: {
    RECEIPT: number;
    DELIVERY: number;
    TRANSFER: number;
    ADJUSTMENT: number;
  };
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await apiClient<DashboardSummary>('/dashboard/summary', {
    method: 'GET',
  });
  return res;
};
