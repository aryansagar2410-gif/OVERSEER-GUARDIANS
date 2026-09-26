import React, { useState } from 'react';
import { Product, MovementRecord, WarehouseNode } from '../types/inventory';

interface DashboardViewProps {
  warehouse: WarehouseNode;
  products: Product[];
  movements: MovementRecord[];
  onOpenQuickTransfer: () => void;
  onOpenNewReceipt: () => void;
  onInspectMovement: (ref: string) => void;
  onExportCsv: () => void;
  onDraftPO: () => void;
  onReconcile: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  warehouse,
  products,
  movements,
  onOpenQuickTransfer,
  onOpenNewReceipt,
  onInspectMovement,
  onExportCsv,
  onDraftPO,
  onReconcile,
}) => {
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'inbound' | 'outbound' | 'relocations'>('all');
  const [searchMovement, setSearchMovement] = useState('');
  const [hoveredDay, setHoveredDay] = useState<string | null>('Thu');
  const [activePage, setActivePage] = useState(1);

  // Compute live KPIs
  const totalStock = products.reduce((acc, p) => acc + p.onHand, 0);
  const lowStockCount = products.filter((p) => p.status === 'low-stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out-of-stock').length;

  const filteredMovements = movements.filter((m) => {
    if (ledgerFilter === 'inbound' && m.type !== 'Receipt') return false;
    if (ledgerFilter === 'outbound' && m.type !== 'Delivery') return false;
    if (ledgerFilter === 'relocations' && m.type !== 'Transfer' && m.type !== 'Adjustment') return false;
    if (searchMovement.trim()) {
      const q = searchMovement.toLowerCase();
      return (
        m.ref.toLowerCase().includes(q) ||
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q) ||
        m.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const daysData = [
    { day: 'Mon', inH: '55%', outH: '40%', inVal: 275, outVal: 200 },
    { day: 'Tue', inH: '70%', outH: '60%', inVal: 350, outVal: 300 },
    { day: 'Wed', inH: '65%', outH: '75%', inVal: 325, outVal: 375 },
    { day: 'Thu', inH: '96%', outH: '82%', inVal: 480, outVal: 395, isPeak: true },
    { day: 'Fri', inH: '78%', outH: '68%', inVal: 390, outVal: 340 },
    { day: 'Sat', inH: '42%', outH: '35%', inVal: 210, outVal: 175 },
    { day: 'Sun', inH: '25%', outH: '20%', inVal: 125, outVal: 100 },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Top Action & Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-semibold text-[#191c1e] tracking-tight">Dashboard</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e6e8ea] text-[#434655] text-[12px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-pulse"></span>
              {warehouse.name} ({warehouse.city} {warehouse.state} Node)
            </span>
          </div>
          <p className="text-[14px] text-[#434655] mt-1">
            Real-time telemetry and inventory velocity across all fulfillment nodes
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-center flex-wrap">
          <button
            type="button"
            onClick={onOpenQuickTransfer}
            className="h-9 px-3.5 bg-white text-[#191c1e] text-[13px] font-medium rounded-xl shadow-xs hover:bg-[#f2f4f6] border border-[#c3c6d7]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4d556b]">sync_alt</span>
            <span>Quick Transfer</span>
          </button>
          <button
            type="button"
            onClick={onDraftPO}
            className="h-9 px-3.5 bg-white text-[#191c1e] text-[13px] font-medium rounded-xl shadow-xs hover:bg-[#f2f4f6] border border-[#c3c6d7]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4d556b]">local_shipping</span>
            <span>+ New Delivery</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewReceipt}
            className="h-9 px-4 bg-[#2563eb] text-white text-[13px] font-semibold rounded-xl shadow-sm hover:bg-[#004ac6] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            <span>+ New Receipt</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Total Stock */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#c3c6d7]/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#4d556b] uppercase tracking-wider">
              Total On-Hand Stock
            </span>
            <span className="material-symbols-outlined text-[#737686] text-[20px]">inventory_2</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-[32px] text-[#191c1e] font-bold tracking-tight font-tabular">
                {(totalStock > 0 ? totalStock : 48920).toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#434655]">
                <span className="inline-flex items-center text-[#004ac6] font-semibold">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>+12.4%
                </span>
                <span>vs last month</span>
              </div>
            </div>
            {/* Sparkline SVG */}
            <div className="w-20 h-10 -mb-1">
              <svg className="w-full h-full text-[#004ac6]" fill="none" viewBox="0 0 100 40">
                <path
                  d="M0 32 L15 28 L30 31 L45 20 L60 24 L75 12 L90 16 L100 6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
                <path
                  d="M0 32 L15 28 L30 31 L45 20 L60 24 L75 12 L90 16 L100 6 L100 40 L0 40 Z"
                  fill="currentColor"
                  fillOpacity="0.08"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 2: Low Stock Alert */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#4d556b] uppercase tracking-wider">
              Reorder Thresholds
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#d0e1fb] text-[#38485d] text-[12px] font-semibold">
              Alerts
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] text-[#191c1e] font-bold tracking-tight font-tabular">
                {lowStockCount > 0 ? lowStockCount : 8}
              </span>
              <span className="text-[16px] font-semibold text-[#4d556b]">SKUs</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#fffbeb] text-[#b45309]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b45309] animate-ping"></span>
              <span className="text-[12px] font-semibold">3 at critical reorder point</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Out of Stock */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#4d556b] uppercase tracking-wider">
              Depleted Inventory
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[12px] font-semibold">
              Urgent
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] text-[#ba1a1a] font-bold tracking-tight font-tabular">
                {outOfStockCount > 0 ? outOfStockCount : 2}
              </span>
              <span className="text-[16px] font-semibold text-[#4d556b]">SKUs</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#fff1f2] text-[#be123c]">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span className="text-[12px] font-semibold">Immediate attention needed</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Operations */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#4d556b] uppercase tracking-wider">
              Pending Operations
            </span>
            <span className="text-[11px] text-[#4d556b] font-medium">Active Queues</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-[#f2f4f6] text-center">
              <span className="text-[20px] text-[#191c1e] font-bold block font-tabular">6</span>
              <span className="text-[10px] text-[#4d556b] uppercase font-semibold">Receipts</span>
            </div>
            <div className="p-2 rounded-lg bg-[#f2f4f6] text-center">
              <span className="text-[20px] text-[#191c1e] font-bold block font-tabular">9</span>
              <span className="text-[10px] text-[#4d556b] uppercase font-semibold">Deliveries</span>
            </div>
            <div className="p-2 rounded-lg bg-[#f2f4f6] text-center">
              <span className="text-[20px] text-[#191c1e] font-bold block font-tabular">4</span>
              <span className="text-[10px] text-[#4d556b] uppercase font-semibold">Transfers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Storage Density Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Velocity & Movement Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-semibold text-[#191c1e]">Stock Velocity & Movement</h2>
                <p className="text-[13px] text-[#434655]">Inbound vs Outbound volumetric flow (7-day window)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2563eb]"></span>
                  <span className="text-[12px] text-[#4d556b]">Inbound</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#505f76]"></span>
                  <span className="text-[12px] text-[#4d556b]">Outbound</span>
                </div>
              </div>
            </div>

            {/* Chart Visual Area with Peak Tooltip */}
            <div className="relative mt-6 pt-6 pb-2">
              {/* Simulated Peak Tooltip pinned to Thursday column or hovered day */}
              {hoveredDay && (
                <div
                  className="absolute -top-1 left-[56%] -translate-x-1/2 z-10 px-3 py-1.5 rounded-lg bg-[#2d3133] text-[#eff1f3] shadow-md pointer-events-none text-left animate-in fade-in"
                >
                  <div className="text-[11px] font-semibold text-[#d3e4fe]">{hoveredDay} Peak Flow</div>
                  <div className="text-[12px] whitespace-nowrap mt-0.5 font-tabular">
                    <span className="text-[#b4c5ff]">In: 480</span> · <span className="text-[#d3e4fe]">Out: 395</span>
                  </div>
                  <div className="w-2 h-2 bg-[#2d3133] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
              )}

              {/* Bar Group Representation */}
              <div className="h-44 w-full flex items-end justify-between gap-2 md:gap-4 px-2">
                {daysData.map((d) => (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredDay(d.day)}
                    className={`flex-1 flex flex-col items-center gap-2 cursor-pointer group ${
                      d.isPeak ? 'bg-[#f2f4f6]/70 rounded-lg pb-1' : ''
                    }`}
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        className={`w-3 sm:w-4 rounded-t-xs transition-all ${
                          d.isPeak ? 'bg-[#2563eb] shadow-xs' : 'bg-[#2563eb]/80 group-hover:bg-[#2563eb]'
                        }`}
                        style={{ height: d.inH }}
                        title={`${d.day} Inbound: ${d.inVal}`}
                      ></div>
                      <div
                        className={`w-3 sm:w-4 rounded-t-xs transition-all ${
                          d.isPeak ? 'bg-[#505f76] shadow-xs' : 'bg-[#505f76]/70 group-hover:bg-[#505f76]'
                        }`}
                        style={{ height: d.outH }}
                        title={`${d.day} Outbound: ${d.outVal}`}
                      ></div>
                    </div>
                    <span
                      className={`text-[11px] ${
                        d.isPeak ? 'text-[#004ac6] font-bold' : 'text-[#4d556b]'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[#434655] text-[13px] bg-[#f2f4f6] px-4 py-2.5 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#004ac6]">insights</span>
              <span>
                Turnover velocity increased by <strong className="text-[#191c1e]">14.2%</strong> across Bay-C & Cold Storage zones.
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-[#4d556b] font-semibold">
              Rolling 7D Metric
            </span>
          </div>
        </div>

        {/* Storage Density Capacity Utilization (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#191c1e]">Storage Capacity</h2>
              <span className="text-[14px] font-semibold text-[#004ac6] font-tabular">
                {warehouse.capacityPct}% Total
              </span>
            </div>
            <p className="text-[13px] text-[#434655] mt-0.5">{warehouse.name} Bay Utilization</p>

            {/* Main Bar */}
            <div className="mt-4">
              <div className="w-full bg-[#eceef0] h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-[#2563eb] h-full" style={{ width: `${warehouse.capacityPct}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[11px] text-[#4d556b] font-tabular">
                <span>Occupied: {warehouse.occupiedM3.toLocaleString()} m³</span>
                <span>Total: {warehouse.totalM3.toLocaleString()} m³</span>
              </div>
            </div>

            {/* Breakdown Categories */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex justify-between items-center text-[12px] mb-1">
                  <span className="text-[#191c1e]">General Racks (Zone A & B)</span>
                  <span className="font-semibold text-[#191c1e] font-tabular">{warehouse.zones.general}%</span>
                </div>
                <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10b981] h-full" style={{ width: `${warehouse.zones.general}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[12px] mb-1">
                  <span className="text-[#191c1e]">Cold Storage Units (Zone C)</span>
                  <span className="font-semibold text-[#191c1e] font-tabular">{warehouse.zones.coldStorage}%</span>
                </div>
                <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2563eb] h-full" style={{ width: `${warehouse.zones.coldStorage}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[12px] mb-1">
                  <span className="text-[#191c1e]">Hazmat Safe Vaults (Zone D)</span>
                  <span className="font-semibold text-[#191c1e] font-tabular">{warehouse.zones.hazmat}%</span>
                </div>
                <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#505f76] h-full" style={{ width: `${warehouse.zones.hazmat}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Fast Execution Action Cards */}
          <div className="mt-6 pt-4 bg-[#f2f4f6] p-3 rounded-lg">
            <div className="text-[11px] text-[#4d556b] uppercase tracking-wider mb-2 font-semibold">
              Fast Execution
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onDraftPO}
                className="bg-white p-2 rounded-lg text-center hover:bg-[#e6e8ea] transition-colors cursor-pointer flex flex-col items-center shadow-xs"
              >
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">post_add</span>
                <span className="text-[12px] font-medium mt-1 text-[#191c1e]">Create PO</span>
              </button>
              <button
                type="button"
                onClick={onOpenQuickTransfer}
                className="bg-white p-2 rounded-lg text-center hover:bg-[#e6e8ea] transition-colors cursor-pointer flex flex-col items-center shadow-xs"
              >
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">swap_horiz</span>
                <span className="text-[12px] font-medium mt-1 text-[#191c1e]">Transfer</span>
              </button>
              <button
                type="button"
                onClick={onReconcile}
                className="bg-white p-2 rounded-lg text-center hover:bg-[#e6e8ea] transition-colors cursor-pointer flex flex-col items-center shadow-xs"
              >
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">fact_check</span>
                <span className="text-[12px] font-medium mt-1 text-[#191c1e]">Reconcile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stock Movements Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d7]/20 overflow-hidden">
        {/* Toolbar & Tabs */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1 bg-[#f2f4f6] p-1 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setLedgerFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                ledgerFilter === 'all'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#434655] hover:text-[#191c1e]'
              }`}
            >
              All Ledger
            </button>
            <button
              type="button"
              onClick={() => setLedgerFilter('inbound')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                ledgerFilter === 'inbound'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#434655] hover:text-[#191c1e]'
              }`}
            >
              Inbound
            </button>
            <button
              type="button"
              onClick={() => setLedgerFilter('outbound')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                ledgerFilter === 'outbound'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#434655] hover:text-[#191c1e]'
              }`}
            >
              Outbound
            </button>
            <button
              type="button"
              onClick={() => setLedgerFilter('relocations')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                ledgerFilter === 'relocations'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#434655] hover:text-[#191c1e]'
              }`}
            >
              Internal Relocations
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#737686] text-[18px] pointer-events-none">
                filter_list
              </span>
              <input
                type="text"
                value={searchMovement}
                onChange={(e) => setSearchMovement(e.target.value)}
                placeholder="Filter movements..."
                className="h-8 pl-8 pr-3 bg-[#f2f4f6] rounded-lg text-[#191c1e] text-[13px] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#004ac6] w-48 border border-transparent focus:border-[#c3c6d7]"
              />
            </div>
            <button
              type="button"
              onClick={onExportCsv}
              className="h-8 px-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-[12px] font-medium hover:bg-[#eceef0] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#f2f4f6]/80 text-[#4d556b] text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4 font-semibold">Reference & Date</th>
                <th className="py-2.5 px-4 font-semibold">SKU & Description</th>
                <th className="py-2.5 px-4 font-semibold">Source → Target</th>
                <th className="py-2.5 px-4 font-semibold text-right">Delta Qty</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f6] text-[13px] text-[#191c1e]">
              {filteredMovements.slice(0, 5).map((row) => {
                const isPositive = row.numericDelta > 0;
                const isNegative = row.numericDelta < 0;

                return (
                  <tr
                    key={row.id}
                    onClick={() => onInspectMovement(row.ref)}
                    className="hover:bg-[#f2f4f6]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="text-[12px] font-semibold text-[#004ac6] font-mono">{row.ref}</div>
                      <div className="text-[11px] text-[#4d556b]">{row.timestamp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#191c1e]">{row.productName}</div>
                      <div className="text-[11px] text-[#4d556b] font-mono">{row.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-[#434655]">
                      <span className="text-[12px] text-[#191c1e]">{row.source}</span>
                      <span className="text-[#4d556b]"> → </span>
                      <span className="text-[12px] text-[#004ac6] font-medium">{row.destination}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold font-tabular ${
                          isPositive
                            ? 'bg-[#ecfdf5] text-[#047857]'
                            : isNegative
                            ? 'bg-[#fff1f2] text-[#be123c]'
                            : 'bg-[#f2f4f6] text-[#191c1e]'
                        }`}
                      >
                        {row.deltaQty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.status === 'Validated' || row.status === 'Done'
                            ? 'bg-[#ecfdf5] text-[#047857]'
                            : row.status === 'Ready'
                            ? 'bg-[#eff6ff] text-[#1d4ed8]'
                            : row.status === 'Waiting' || row.status === 'Pending'
                            ? 'bg-[#fffbeb] text-[#b45309]'
                            : 'bg-[#f1f5f9] text-[#334155]'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onInspectMovement(row.ref)}
                        className="p-1 hover:bg-[#e6e8ea] rounded text-[#4d556b] hover:text-[#191c1e] transition-colors"
                        title="View Ledger Proof & Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-3 bg-[#f2f4f6]/40 flex items-center justify-between text-[12px] text-[#434655]">
          <span>Showing {Math.min(5, filteredMovements.length)} of 148 recorded transactions</span>
          <div className="flex items-center gap-1 select-none">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-[#e6e8ea] text-[#4d556b] disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-2 py-0.5 rounded bg-white font-medium text-[#191c1e] shadow-xs">
              {activePage}
            </span>
            <button
              type="button"
              onClick={() => setActivePage(2)}
              className="px-2 py-0.5 rounded hover:bg-white text-[#4d556b]"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setActivePage(3)}
              className="px-2 py-0.5 rounded hover:bg-white text-[#4d556b]"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setActivePage((p) => Math.min(3, p + 1))}
              className="p-1 rounded hover:bg-[#e6e8ea] text-[#4d556b]"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
