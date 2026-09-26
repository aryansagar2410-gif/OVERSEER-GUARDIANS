import { apiClient } from './client';
import { MovementRecord } from '../types/inventory';

interface BackendMovement {
  id: string;
  productId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  type: 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';
  documentId: string | null;
  createdById: string;
  createdAt: string;
  product?: { name: string; sku: string };
  fromLocation?: { name: string; warehouse?: { name: string } };
  toLocation?: { name: string; warehouse?: { name: string } };
  createdBy?: { name: string; email: string };
}

const formatLocation = (loc?: { name: string; warehouse?: { name: string } }) => {
  if (!loc) return 'System / External';
  if (loc.warehouse) return loc.warehouse.name + ' / ' + loc.name;
  return loc.name;
};

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const mapBackendMovementToFrontend = (bm: BackendMovement): MovementRecord => {
  const dateObj = new Date(bm.createdAt);
  const isToday = dateObj.toDateString() === new Date().toDateString();
  const dateStr = isToday ? 'Today' : dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let uiType: 'Receipt' | 'Delivery' | 'Transfer' | 'Adjustment' = 'Adjustment';
  if (bm.type === 'RECEIPT') uiType = 'Receipt';
  if (bm.type === 'DELIVERY') uiType = 'Delivery';
  if (bm.type === 'TRANSFER') uiType = 'Transfer';

  // For adjustments, figure out if it was positive or negative
  let isPositive = true;
  if (bm.type === 'ADJUSTMENT' && bm.fromLocationId && !bm.toLocationId) isPositive = false;
  if (bm.type === 'DELIVERY') isPositive = false;
  
  const sign = isPositive ? '+' : '-';
  const numericDelta = isPositive ? bm.quantity : -bm.quantity;
  const deltaQty = sign + bm.quantity;

  return {
    id: bm.id,
    ref: bm.documentId || 'MOV-' + bm.id.slice(-6).toUpperCase(),
    date: dateStr,
    time: timeStr,
    timestamp: dateStr + ' at ' + timeStr,
    productName: bm.product?.name || 'Unknown Product',
    sku: bm.product?.sku || 'UNKNOWN',
    type: uiType,
    deltaQty: deltaQty,
    qtyRaw: deltaQty,
    numericDelta,
    source: formatLocation(bm.fromLocation),
    destination: formatLocation(bm.toLocation),
    operator: bm.createdBy?.name || bm.createdBy?.email || 'System',
    operatorInitials: getInitials(bm.createdBy?.name || bm.createdBy?.email || 'System'),
    status: 'Done', // all movements returned are completed
    batch: 'N/A',
    serials: 'N/A',
    hash: '0x' + bm.id.slice(0, 8)
  };
};

export const getMovements = async (page = 1, limit = 100): Promise<{ data: MovementRecord[]; meta: any }> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await apiClient<{ data: BackendMovement[]; meta: any }>('/stock-movements?' + query.toString(), {
    method: 'GET',
  });

  return {
    data: (res.data || []).map(mapBackendMovementToFrontend),
    meta: res.meta,
  };
};
