import React, { useState } from 'react';
import { Product } from '../types/inventory';

interface ProductsViewProps {
  products: Product[];
  onOpenNewSku: () => void;
  onOpenScanner: () => void;
  onAdjustProduct: (product: Product) => void;
  onTransferProduct: (product: Product) => void;
  onDraftPO: (product?: Product) => void;
  onViewMovementLog: (sku: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onOpenNewSku,
  onOpenScanner,
  onAdjustProduct,
  onTransferProduct,
  onDraftPO,
  onViewMovementLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'stock-desc' | 'stock-asc' | 'reorder' | 'sku'>('stock-desc');
  const [showLowStockBanner, setShowLowStockBanner] = useState(true);

  const categories = [
    { id: 'all', label: `All (${products.length + 120})` },
    { id: 'low-stock', label: 'Low Stock (8)', isAlert: true },
    { id: 'Motors', label: 'Motors' },
    { id: 'Sensors', label: 'Sensors' },
    { id: 'Controllers', label: 'Controllers' },
    { id: 'Power / Cells', label: 'Power / Cells' },
    { id: 'Hardware', label: 'Hardware' },
    { id: 'Fasteners', label: 'Fasteners' },
    { id: 'Fluids', label: 'Fluids' },
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'low-stock') {
      return p.status === 'low-stock' || p.status === 'out-of-stock';
    }
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'stock-desc') return b.onHand - a.onHand;
    if (sortBy === 'stock-asc') return a.onHand - b.onHand;
    if (sortBy === 'sku') return a.sku.localeCompare(b.sku);
    if (sortBy === 'reorder') {
      const aUrgent = a.status === 'out-of-stock' ? 2 : a.status === 'low-stock' ? 1 : 0;
      const bUrgent = b.status === 'out-of-stock' ? 2 : b.status === 'low-stock' ? 1 : 0;
      return bUrgent - aUrgent;
    }
    return 0;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Search & Filter Header Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#c3c6d7]/20 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar with barcode icon */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#737686] text-[18px]">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, barcode, name..."
              className="w-full h-10 pl-9 pr-12 rounded-xl bg-[#f2f4f6] text-[#191c1e] text-[13px] border border-transparent focus:bg-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all"
            />
            <button
              type="button"
              onClick={onOpenScanner}
              title="Scan Barcode / QR"
              className="absolute right-2 top-2 w-6 h-6 rounded bg-white text-[#004ac6] flex items-center justify-center shadow-2xs hover:bg-blue-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">barcode_scanner</span>
            </button>
          </div>

          {/* Action cluster: Add SKU & Sorting */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={onOpenNewSku}
              className="h-9 px-3.5 rounded-lg bg-[#2563eb] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#004ac6] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New SKU</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 pl-3 pr-8 bg-[#f2f4f6] text-[#434655] text-[12px] font-medium rounded-lg appearance-none focus:outline-none focus:bg-white cursor-pointer border border-transparent focus:border-[#c3c6d7]"
              >
                <option value="stock-desc">Sort: Stock High-Low</option>
                <option value="stock-asc">Sort: Stock Low-High</option>
                <option value="reorder">Sort: Reorder Urgency</option>
                <option value="sku">Sort: SKU Code</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-[#737686] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#004ac6] text-white shadow-xs'
                    : 'bg-[#e6e8ea] text-[#434655] hover:bg-[#eceef0] hover:text-[#191c1e]'
                }`}
              >
                {cat.isAlert ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    {cat.label}
                  </span>
                ) : (
                  cat.label
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operational Alert Banner */}
      {showLowStockBanner && (
        <div className="p-3.5 rounded-xl bg-[#ffdad6]/40 text-[#93000a] border border-[#ffdad6] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] flex-shrink-0 mt-0.5">
              warning
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#93000a] leading-tight">
                Priority Reorder Run Required
              </p>
              <p className="text-[12px] text-[#93000a]/90 mt-0.5 truncate">
                8 critical stock lines are depleted or past safety buffers in WH-01.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('low-stock')}
              className="px-3 py-1 rounded bg-[#ba1a1a] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity"
            >
              Review
            </button>
            <button
              type="button"
              onClick={() => setShowLowStockBanner(false)}
              className="text-[#93000a] hover:text-black p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Catalog Stream */}
      <div className="space-y-4">
        {sortedProducts.map((p) => {
          const isHealthy = p.status === 'healthy';
          const isLow = p.status === 'low-stock';
          const isOut = p.status === 'out-of-stock';

          return (
            <article
              key={p.id}
              className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-[#c3c6d7]/30 transition-all flex flex-col gap-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex gap-3.5 min-w-0">
                  <img
                    alt={p.imageAlt}
                    src={p.image}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0 border border-gray-200"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-[#f2f4f6] text-[11px] font-mono text-[#434655]">
                        {p.sku}
                      </span>
                      <span className="text-[12px] text-[#505f76] font-medium">{p.category}</span>
                    </div>
                    <h2 className="text-[16px] font-semibold text-[#191c1e] mt-1">{p.name}</h2>
                    <div className="flex items-center gap-1.5 text-[#434655] text-[12px] mt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-[#004ac6]">location_on</span>
                      <span>{p.location}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-start sm:self-center">
                  {isHealthy && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-700">
                      Healthy
                    </span>
                  )}
                  {isLow && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-800 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      Low Stock
                    </span>
                  )}
                  {isOut && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-rose-50 text-rose-800">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Meter and Figures */}
              <div
                className={`rounded-xl p-3 flex items-center justify-between ${
                  isOut
                    ? 'bg-rose-50/80 text-rose-950'
                    : isLow
                    ? 'bg-amber-50/70 text-amber-950'
                    : 'bg-[#f2f4f6] text-[#191c1e]'
                }`}
              >
                <div>
                  <span className="text-[11px] opacity-80 block font-medium">
                    {isOut ? 'Physical Stock' : isLow ? 'Available Units' : 'On-Hand Stock'}
                  </span>
                  <span className="text-[26px] font-bold leading-tight font-tabular">
                    {p.onHand.toLocaleString()}{' '}
                    <span className="text-xs font-normal opacity-80">{p.unit}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] opacity-80 block font-medium">
                    {isOut ? 'Min Baseline' : isLow ? 'Deficit vs Safe (25)' : 'Buffer Trigger'}
                  </span>
                  <span
                    className={`text-[14px] font-bold font-tabular ${
                      isOut ? 'text-rose-700' : isLow ? 'text-[#ba1a1a]' : 'text-[#191c1e]'
                    }`}
                  >
                    {isLow && p.deficit ? `${p.deficit} units` : p.bufferTriggerText}
                  </span>
                </div>
              </div>

              {/* Thumb-Friendly Quick Action Cluster */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                {isOut ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onDraftPO(p)}
                      className="h-9 rounded-lg bg-[#ba1a1a] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-red-800 shadow-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">bolt</span>
                      <span>Expedite PO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewMovementLog(p.sku)}
                      className="h-9 rounded-lg bg-[#eceef0] text-[#191c1e] text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-[#e0e3e5] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#505f76]">history</span>
                      <span>Movement Log</span>
                    </button>
                  </>
                ) : isLow ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onDraftPO(p)}
                      className="h-9 rounded-lg bg-[#004ac6] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-800 shadow-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">shopping_cart_checkout</span>
                      <span>Draft PO Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustProduct(p)}
                      className="h-9 rounded-lg bg-[#eceef0] text-[#191c1e] text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-[#e0e3e5] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#505f76]">tune</span>
                      <span>Fast Adjust</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onAdjustProduct(p)}
                      className="h-9 rounded-lg bg-[#eceef0] text-[#191c1e] text-[12px] font-medium flex items-center justify-center gap-1 hover:bg-[#e0e3e5] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#505f76]">edit_note</span>
                      <span>Adjust</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTransferProduct(p)}
                      className="h-9 rounded-lg bg-[#eceef0] text-[#191c1e] text-[12px] font-medium flex items-center justify-center gap-1 hover:bg-[#e0e3e5] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#505f76]">swap_horiz</span>
                      <span>Transfer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Bar-tag print queued for SKU: ${p.sku} (Zebra ZT411 Terminal)`);
                      }}
                      className="h-9 rounded-lg bg-[#d0e1fb] text-[#004ac6] text-[12px] font-semibold flex items-center justify-center gap-1 hover:bg-blue-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
                      <span>Tag / Print</span>
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Operational Footnote Status Indicator */}
      <div className="p-3.5 rounded-xl bg-white border border-[#c3c6d7]/30 flex flex-col sm:flex-row items-center justify-between text-[#434655] shadow-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[12px]">Showing {sortedProducts.length} active inventory items</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
          <span className="material-symbols-outlined text-[14px]">info</span>
          <span>8 low stock warnings registered in WH-01 telemetry</span>
        </div>
      </div>
    </div>
  );
};
