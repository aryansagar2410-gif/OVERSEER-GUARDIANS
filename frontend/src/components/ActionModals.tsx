import React, { useState } from 'react';
import { Product, InboundReceipt } from '../types/inventory';
import { apiClient } from '../api/client';

interface QuickTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onConfirmTransfer: (data: {
    sku: string;
    productName: string;
    quantity: number;
    source: string;
    destination: string;
  }) => void;
}

export const QuickTransferModal: React.FC<QuickTransferModalProps> = ({
  isOpen,
  onClose,
  products,
  onConfirmTransfer,
}) => {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [qty, setQty] = useState(10);
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [locations, setLocations] = React.useState<{id: string, name: string}[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      apiClient<{data: {id: string, name: string}[]}>('/locations').then(res => {
        setLocations(res.data);
        if (res.data.length >= 2) {
          setSource(res.data[0].id);
          setDest(res.data[1].id);
        } else if (res.data.length === 1) {
          setSource(res.data[0].id);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.sku === selectedSku) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;
    onConfirmTransfer({
      sku: currentProduct.sku,
      productName: currentProduct.name,
      quantity: Number(qty),
      source,
      destination: dest,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Execute Quick Transfer</h3>
              <p className="text-[11px] text-gray-500">Internal warehouse relocation & staging</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Select SKU & Item</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.sku}>
                  {p.sku} — {p.name} ({p.onHand} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity to Relocate</label>
            <input
              type="number"
              min={1}
              max={currentProduct ? Math.max(currentProduct.onHand, 100) : 500}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              required
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Origin Source</label>
              <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                  className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Destination</label>
              <select
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  required
                  className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 text-[11px] text-gray-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[16px]">verified</span>
            <span>Generates cryptographic movement entry on the immutable ledger.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AdjustStockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdjust: (sku: string, locationId: string, delta: number, reason: string) => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmAdjust,
}) => {
  const [delta, setDelta] = React.useState<number>(-2);
  const [reason, setReason] = React.useState('Cycle count discrepancy');
  const [locationId, setLocationId] = React.useState('');
  const [locations, setLocations] = React.useState<{id: string, name: string}[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      import('../api/client').then(({ apiClient }) => {
        apiClient<{data: {id: string, name: string}[]}>('/locations').then(res => {
          setLocations(res.data);
          if (res.data.length > 0 && !locationId) {
            setLocationId(res.data[0].id);
          }
        }).catch(console.error);
      });
    }
  }, [isOpen, locationId]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) return;
    onConfirmAdjust(product.sku, locationId, delta, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Physical Stock Adjustment</h3>
              <p className="text-[11px] text-gray-500">{product.sku} • {product.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Location</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select location...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 block">Current On-Hand</span>
              <span className="text-lg font-bold text-gray-900">{product.onHand} {product.unit}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-500 block">New Adjusted Level</span>
              <span className={`text-lg font-bold ${product.onHand + delta < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {Math.max(0, product.onHand + delta)} {product.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity Delta (+ or -)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDelta((prev) => prev - 1)}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
              >
                -
              </button>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-center font-mono text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setDelta((prev) => prev + 1)}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Root Cause / Reason Code</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="Cycle count discrepancy">Cycle count discrepancy</option>
              <option value="Damaged packaging / write-off">Damaged packaging / write-off</option>
              <option value="Found in bin relocation">Found in bin relocation (+found)</option>
              <option value="Supplier short-shipment">Supplier short-shipment discrepancy</option>
              <option value="Engineering lab sample pull">Engineering lab sample pull</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              Save & Sign Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReceipt: (receipt: Partial<InboundReceipt>) => void;
}

export const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  isOpen,
  onClose,
  onAddReceipt,
}) => {
  const [vendor, setVendor] = useState('Apex Industrial Supplies Ltd.');
  const [productName, setProductName] = useState('Industrial High-Torque Servo Motor 48V');
  const [sku, setSku] = useState('SKU-SRV-9021');
  const [quantity, setQuantity] = useState(120);
  const [dock, setDock] = useState('Dock Bay 01 (North)');
  const [targetBay, setTargetBay] = useState('Bay 04');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRef = `REC-2023-${Math.floor(1000 + Math.random() * 9000)}`;
    onAddReceipt({
      ref: newRef,
      vendor,
      productName,
      sku,
      quantity,
      unit: 'pcs',
      dock,
      targetBay,
      status: 'ready',
      preCleared: true,
      palletLot: `PL-${Math.floor(1000 + Math.random() * 9000)}`,
      weightKg: quantity * 4,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Create Inbound Receipt</h4>
              <p className="text-[11px] text-gray-500">Manually register expected vendor shipment</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor / Supplier</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-lg bg-[#f2f4f6] text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product Description</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-lg bg-[#f2f4f6] text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU Reference</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-lg bg-[#f2f4f6] text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (pcs)</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full h-9 px-3 rounded-lg bg-[#f2f4f6] text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Receiving Dock</label>
              <select
                value={dock}
                onChange={(e) => setDock(e.target.value)}
                className="w-full h-9 px-2 rounded-lg bg-[#f2f4f6] text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
              >
                <option value="Dock Bay 01 (North)">Dock Bay 01 (North)</option>
                <option value="Dock Bay 02 (Heavy)">Dock Bay 02 (Heavy)</option>
                <option value="Dock Bay 03 (Refrigerated)">Dock Bay 03 (Refrigerated)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Bay</label>
              <input
                type="text"
                value={targetBay}
                onChange={(e) => setTargetBay(e.target.value)}
                required
                className="w-full h-9 px-2.5 rounded-lg bg-[#f2f4f6] text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg bg-[#f2f4f6] text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Initialize Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreateSkuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSku: (product: Partial<Product>) => void;
}

export const CreateSkuModal: React.FC<CreateSkuModalProps> = ({
  isOpen,
  onClose,
  onAddSku,
}) => {
  const [sku, setSku] = useState('SKU-MOT-');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Motors');
  const [location, setLocation] = useState('Bay 01 / Dock B');
  const [initialStock, setInitialStock] = useState(100);
  const [unit, setUnit] = useState('units');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;
    onAddSku({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      location,
      onHand: initialStock,
      unit,
      status: initialStock > 20 ? 'healthy' : initialStock > 0 ? 'low-stock' : 'out-of-stock',
      bufferTriggerText: '25 min',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaYyLihBQspR75kBuJwBPpOtNyRUZyNbxSxDkY5WUkpHmSfHLpy7ad2kPEnt1wNDwn_bPvohj94LqqUcOAZWPHygMf_xdgx9VBlRYCg3MO1lg8VBkvL3GVf0oACiZ4L4t-pYf-3I89lNAjEBysAWU047tOsGCmzbLpYRHVoyQZuKo-Tyuvz-QMmJZIOAUXQ9F6XwjuWC1y9GPv1v8L39JM5y_dgUoCbarAxfVv01bT1WgfLvrEdRXd',
      imageAlt: name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_box</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Register New Inventory SKU</h3>
              <p className="text-[11px] text-gray-500">Assign category, baseline safety buffers and bin</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">SKU Code</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              placeholder="e.g. SKU-MOT-9912"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Brushless Stepper Actuator 12V"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full h-9 px-2 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Motors">Motors</option>
                <option value="Sensors">Sensors</option>
                <option value="Controllers">Controllers</option>
                <option value="Power / Cells">Power / Cells</option>
                <option value="Hardware">Hardware</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Fluids">Fluids</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bin / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Initial On-Hand Count</label>
              <input
                type="number"
                min={0}
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit of Measure</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="units">units</option>
                <option value="pcs">pcs</option>
                <option value="rolls">rolls</option>
                <option value="meters">meters</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              Register SKU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
