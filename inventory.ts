export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Motors' | 'Sensors' | 'Controllers' | 'Power / Cells' | 'Hardware' | 'Fasteners' | 'Fluids';
  location: string;
  onHand: number;
  unit: string;
  status: 'healthy' | 'low-stock' | 'out-of-stock';
  bufferTriggerText: string;
  reorderPoint?: number;
  deficit?: number;
  image: string;
  imageAlt: string;
}

export interface MovementRecord {
  id: string;
  ref: string;
  date: string;
  time: string;
  timestamp: string;
  productName: string;
  sku: string;
  type: 'Receipt' | 'Delivery' | 'Transfer' | 'Adjustment';
  deltaQty: string;
  qtyRaw: string;
  numericDelta: number;
  source: string;
  destination: string;
  operator: string;
  operatorInitials: string;
  status: 'Validated' | 'Done' | 'Ready' | 'Waiting' | 'Draft' | 'Pending';
  batch: string;
  serials: string;
  hash: string;
  qaInspection?: string;
  parentDoc?: string;
  image?: string;
}

export interface InboundReceipt {
  id: string;
  ref: string;
  vendor: string;
  productName: string;
  sku: string;
  status: 'ready' | 'waiting' | 'done' | 'draft';
  quantity: number;
  unit: string;
  dock: string;
  targetBay: string;
  weightKg?: number;
  palletLot?: string;
  preCleared?: boolean;
  eta?: string;
  carrier?: string;
  storedBin?: string;
  verifiedBy?: string;
  verifiedTime?: string;
  image?: string;
}

export interface WarehouseNode {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  status: 'online' | 'maintenance' | 'syncing';
  capacityPct: number;
  occupiedM3: number;
  totalM3: number;
  zones: {
    general: number;
    coldStorage: number;
    hazmat: number;
  };
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type?: 'success' | 'info' | 'warning';
}
