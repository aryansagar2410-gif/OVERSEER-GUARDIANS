import React from 'react';
import { Product, MovementRecord, WarehouseNode } from '../types/inventory';

interface MobileDashboardViewProps {
  warehouse: WarehouseNode;
  products: Product[];
  movements: MovementRecord[];
  onOpenScanner: () => void;
  onOpenNewReceipt: () => void;
  onOpenQuickTransfer: () => void;
  onSelectTab: (tab: string) => void;
  onSwitchWarehouse: () => void;
}

export const MobileDashboardView: React.FC<MobileDashboardViewProps> = ({
  warehouse,
  products,
  movements,
  onOpenScanner,
  onOpenNewReceipt,
  onOpenQuickTransfer,
  onSelectTab,
  onSwitchWarehouse,
}) => {
  const totalStock = products.reduce((acc, p) => acc + p.onHand, 0);
  const lowStockCount = products.filter((p) => p.status === 'low-stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out-of-stock').length;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col px-4 pt-3 pb-24 gap-4">
      {/* Interactive Warehouse Switcher Context Pill */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-[#004ac6] flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">warehouse</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-[#737686] uppercase tracking-wider font-semibold">
              Active Terminal Zone
            </span>
            <button
              type="button"
              onClick={onSwitchWarehouse}
              className="flex items-center gap-1 text-[14px] font-semibold text-[#191c1e] hover:text-[#004ac6] transition-colors text-left truncate"
            >
              <span className="truncate">{warehouse.name} ({warehouse.city})</span>
              <span className="material-symbols-outlined text-[16px] text-gray-500">expand_more</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#eceef0] text-[#434655] flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-semibold">99.8% Sync</span>
        </div>
      </div>

      {/* Quick Action Velocity Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 bg-[#004ac6] text-white px-3.5 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-transform shadow-xs flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
          <span>Scan Barcode</span>
        </button>
        <button
          type="button"
          onClick={onOpenNewReceipt}
          className="flex items-center gap-1.5 bg-white text-[#191c1e] border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-transform flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] text-[#004ac6]">add_box</span>
          <span>New Receipt</span>
        </button>
        <button
          type="button"
          onClick={onOpenQuickTransfer}
          className="flex items-center gap-1.5 bg-white text-[#191c1e] border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-transform flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] text-[#505f76]">swap_horiz</span>
          <span>Transfer</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('history')}
          className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-[#191c1e] rounded-xl shadow-xs flex-shrink-0 active:scale-95 transition-transform"
          title="Filter Movements"
        >
          <span className="material-symbols-outlined text-[18px] text-[#505f76]">filter_list</span>
        </button>
      </div>

      {/* 2x2 Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Total Stock */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-semibold text-[#737686]">TOTAL UNITS</span>
            <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="text-[26px] font-bold text-[#191c1e] tracking-tight font-tabular">
              {(totalStock > 0 ? totalStock : 48920).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-emerald-600 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+12.4%</span>
              <span className="text-[#737686] font-normal text-[10px]">vs last wk</span>
            </div>
          </div>
        </div>

        {/* Card 2: Low Stock */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-semibold text-[#737686]">LOW STOCK</span>
            <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </div>
          </div>
          <div>
            <div className="text-[26px] font-bold text-[#191c1e] tracking-tight font-tabular">
              {lowStockCount > 0 ? lowStockCount : 8} <span className="text-sm font-normal text-[#737686]">SKUs</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-amber-700 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Buffer breach (≤15%)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Stockouts */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-semibold text-[#737686]">STOCKOUTS</span>
            <div className="w-6 h-6 rounded bg-rose-50 flex items-center justify-center text-rose-600">
              <span className="material-symbols-outlined text-[16px]">error_outline</span>
            </div>
          </div>
          <div>
            <div className="text-[26px] font-bold text-rose-600 tracking-tight font-tabular">
              {outOfStockCount > 0 ? outOfStockCount : 2} <span className="text-sm font-normal text-[#737686]">SKUs</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-rose-600 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">priority_high</span>
              <span>Requires fast PO</span>
            </div>
          </div>
        </div>

        {/* Card 4: Inbound Today */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-semibold text-[#737686]">INBOUND TODAY</span>
            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-[#505f76]">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            </div>
          </div>
          <div>
            <div className="text-[26px] font-bold text-[#191c1e] tracking-tight font-tabular">
              6 <span className="text-sm font-normal text-[#737686]">Pending</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[#505f76] text-[11px]">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>Next dock 14:30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Capacity Breakdown Card */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#004ac6]">pie_chart</span>
            <span className="text-xs font-semibold text-[#191c1e]">Warehouse Utilization</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eceef0] text-[#434655]">
            {warehouse.capacityPct}% Total
          </span>
        </div>

        {/* Primary Overall Gauge Bar */}
        <div className="flex flex-col gap-1">
          <div className="w-full bg-[#eceef0] rounded-full h-2.5 overflow-hidden flex">
            <div className="bg-[#004ac6] h-full" style={{ width: `${warehouse.zones.general}%` }}></div>
            <div className="bg-[#505f76] h-full" style={{ width: `${warehouse.zones.coldStorage}%` }}></div>
            <div className="bg-amber-500 h-full" style={{ width: `${warehouse.zones.hazmat}%` }}></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#737686]">
            <span>Available footprint: 18,400 sq ft</span>
            <span>Peak limit 95%</span>
          </div>
        </div>

        {/* Breakdown Sub-categories */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2 rounded-lg bg-[#f2f4f6] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#737686]">General</span>
              <span className="font-semibold text-[#004ac6] font-tabular">{warehouse.zones.general}%</span>
            </div>
            <div className="w-full bg-[#e6e8ea] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#004ac6] h-full" style={{ width: `${warehouse.zones.general}%` }}></div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#f2f4f6] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#737686]">Cold Store</span>
              <span className="font-semibold text-[#505f76] font-tabular">{warehouse.zones.coldStorage}%</span>
            </div>
            <div className="w-full bg-[#e6e8ea] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#505f76] h-full" style={{ width: `${warehouse.zones.coldStorage}%` }}></div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#f2f4f6] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#737686]">Hazmat</span>
              <span className="font-semibold text-amber-600 font-tabular">{warehouse.zones.hazmat}%</span>
            </div>
            <div className="w-full bg-[#e6e8ea] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${warehouse.zones.hazmat}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Stock Velocity Curve Card */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-[#191c1e]">Hourly Stock Velocity</h2>
            <p className="text-[11px] text-[#737686]">Inbound docks vs fulfillment rate</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded bg-[#004ac6]"></span>
              <span className="text-[10px] text-[#434655]">In</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded bg-[#505f76]"></span>
              <span className="text-[10px] text-[#434655]">Out</span>
            </div>
          </div>
        </div>

        {/* SVG Velocity Wave Chart */}
        <div className="w-full h-28 pt-1 relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 340 100">
            <defs>
              <linearGradient id="mobileBlueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#004ac6" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="20" x2="340" y2="20" stroke="#f2f4f6" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="0" y1="50" x2="340" y2="50" stroke="#f2f4f6" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="0" y1="80" x2="340" y2="80" stroke="#f2f4f6" strokeDasharray="3 3" strokeWidth="1" />

            <path
              d="M0,80 Q45,25 90,65 T180,30 T270,45 T340,15 L340,95 L0,95 Z"
              fill="url(#mobileBlueGradient)"
            />
            <path
              d="M0,80 Q45,25 90,65 T180,30 T270,45 T340,15"
              fill="none"
              stroke="#004ac6"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            <path
              d="M0,65 Q45,75 90,40 T180,55 T270,25 T340,40"
              fill="none"
              stroke="#505f76"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <circle cx="340" cy="15" r="4" fill="#004ac6" />
            <circle cx="340" cy="15" r="7" fill="#004ac6" opacity="0.3" className="animate-ping" />
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] text-[#737686] font-tabular pt-1">
          <span>08:00</span>
          <span>10:00</span>
          <span>12:00</span>
          <span>14:00</span>
          <span>16:00 (Now)</span>
        </div>
      </div>

      {/* Operational Visual Anchor: Live Fulfillment Bay Camera Preview */}
      <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-xs">
        <div
          className="bg-cover bg-center w-full h-full"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDS3aee27PDmfkWZvsrrDJnoaaATtUeXp4ZRNUjDCF75j3zXwkiJWlP8UqnSWHnHcAHFvywu6HJRkIKCVA00HTlx1XWqskMoPNaBQ7GXpZRmrQqkSFDwCiQasDrcK9bqQjJKbsJwjpw7rvYvOVS6gJ9ZzuMAuJGdOcNc16Qs9d95cQAVME5Dl72QPr8ML3TjfI6bv_3ODx4owRFrYLqPMCWRcx_n5UqHYf7jlnMqOgFlusZh7HJs128')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-semibold tracking-wide">BAY 04 / ACTIVE UNLOAD</span>
            </div>
            <span className="text-[11px] text-gray-300">Dock Gate 03</span>
          </div>
          <p className="text-[12px] text-gray-200 truncate">Carrier: Central Express - Trailer #TX-9021</p>
        </div>
      </div>

      {/* Recent Operations Feed */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#505f76]">pending_actions</span>
            <h2 className="text-xs font-semibold text-[#191c1e]">Recent Operations</h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className="text-[12px] text-[#004ac6] font-semibold hover:underline"
          >
            View Ledger
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {movements.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-lg bg-[#f2f4f6] flex items-center justify-between hover:bg-[#eceef0] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'Receipt'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.type === 'Delivery'
                      ? 'bg-blue-100 text-[#004ac6]'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {item.type === 'Receipt'
                      ? 'south_east'
                      : item.type === 'Delivery'
                      ? 'north_east'
                      : 'sync_alt'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#191c1e] truncate">{item.ref}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white text-gray-700">
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#737686] truncate">
                    {item.productName} • {item.timestamp}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-xs font-bold text-[#191c1e] block font-tabular">
                  {item.deltaQty}
                </span>
                <span className="text-[10px] text-[#737686]">WH-01</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
