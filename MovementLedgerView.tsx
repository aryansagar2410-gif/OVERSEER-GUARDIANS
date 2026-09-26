import React, { useState } from 'react';
import { MovementRecord } from '../types/inventory';

interface MovementLedgerViewProps {
  movements: MovementRecord[];
  onExportCsv: () => void;
  onVerifyIntegrity: () => void;
  activeMovementRef?: string | null;
  onSelectMovement: (ref: string | null) => void;
}

export const MovementLedgerView: React.FC<MovementLedgerViewProps> = ({
  movements,
  onExportCsv,
  onVerifyIntegrity,
  activeMovementRef,
  onSelectMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('30D');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const filteredMovements = movements.filter((row) => {
    if (typeFilter !== 'ALL' && row.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
    if (facilityFilter !== 'ALL') {
      if (!row.source.includes(facilityFilter) && !row.destination.includes(facilityFilter)) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        row.ref.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q) ||
        row.operator.toLowerCase().includes(q) ||
        row.source.toLowerCase().includes(q) ||
        row.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeMovement = movements.find((m) => m.ref === activeMovementRef) || movements[0];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredMovements.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyRef = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopyFeedback(ref);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setDateFilter('30D');
    setFacilityFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
              OPERATIONS
            </span>
            <span className="text-[#c3c6d7] text-xs">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
              AUDIT & COMPLIANCE
            </span>
          </div>
          <h1 className="text-[24px] font-semibold text-[#191c1e] tracking-tight">
            Stock Movement & History
          </h1>
          <p className="text-[13px] text-[#505f76] max-w-3xl">
            Unified immutable stock ledger tracking all receipts, customer dispatches, location transfers, and
            physical cycle reconciliations with cryptographic integrity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f2f4f6] text-[#505f76] text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
            <span>Ledger Sync: Realtime</span>
          </div>
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-[#191c1e] text-[13px] font-medium border border-gray-200 shadow-xs hover:bg-[#f2f4f6] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[#505f76]">file_download</span>
            <span>Export Audit Log</span>
          </button>
          <button
            type="button"
            onClick={onVerifyIntegrity}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2563eb] text-white text-[13px] font-semibold shadow-xs hover:bg-[#004ac6] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Verify Integrity</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#505f76]">
              Total Transactions
            </span>
            <span className="p-1.5 rounded-lg bg-[#f2f4f6] text-[#004ac6] material-symbols-outlined text-[18px]">
              receipt_long
            </span>
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#191c1e] font-tabular">1,428</span>
            <span className="text-xs text-[#505f76]">events</span>
          </div>
          <div className="flex items-center justify-between text-[#505f76] text-xs">
            <span className="flex items-center gap-1 text-[#047857] font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>+12.4%
            </span>
            <span className="text-[11px] text-[#737686]">Rolling 30 Days</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e6e8ea]">
            <div className="h-full bg-[#2563eb] w-[78%]"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#505f76]">
              Inbound Units (Receipts)
            </span>
            <span className="p-1.5 rounded-lg bg-[#ecfdf5] text-[#047857] material-symbols-outlined text-[18px]">
              south_west
            </span>
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#047857] font-tabular">+14,250</span>
            <span className="text-xs text-[#505f76]">pcs</span>
          </div>
          <div className="flex items-center justify-between text-[#505f76] text-xs">
            <span>24 shipments cleared</span>
            <span className="text-[11px] text-[#047857] font-semibold">100% Inspected</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e6e8ea]">
            <div className="h-full bg-[#10b981] w-[88%]"></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#505f76]">
              Outbound Units (Deliveries)
            </span>
            <span className="p-1.5 rounded-lg bg-[#eff6ff] text-[#2563eb] material-symbols-outlined text-[18px]">
              north_east
            </span>
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#191c1e] font-tabular">-9,810</span>
            <span className="text-xs text-[#505f76]">pcs</span>
          </div>
          <div className="flex items-center justify-between text-[#505f76] text-xs">
            <span>86 outbound manifests</span>
            <span className="text-[11px] text-[#2563eb] font-semibold">99.4% On Time</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e6e8ea]">
            <div className="h-full bg-[#2563eb] w-[65%]"></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#505f76]">
              Net Stock Variance
            </span>
            <span className="p-1.5 rounded-lg bg-[#fffbeb] text-[#b45309] material-symbols-outlined text-[18px]">
              balance
            </span>
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#b45309] font-tabular">+48</span>
            <span className="text-xs text-[#505f76]">net delta</span>
          </div>
          <div className="flex items-center justify-between text-[#505f76] text-xs">
            <span>Cycle count accuracy</span>
            <span className="text-[11px] text-[#047857] font-semibold">99.82% SLA</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e6e8ea]">
            <div className="h-full bg-[#f59e0b] w-[22%]"></div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table and Filters Section */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-[#c3c6d7]/20 overflow-hidden">
        {/* Filter controls toolbar */}
        <div className="p-4 bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SKU, movement ref, product name, or operator..."
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#737686] text-xs focus:outline-none focus:bg-white border border-transparent focus:border-[#c3c6d7]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] hover:text-black"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs focus:outline-none cursor-pointer hover:bg-[#e6e8ea] border border-transparent focus:border-[#c3c6d7]"
              >
                <option value="ALL">Type: All Transactions</option>
                <option value="Receipt">Receipts (Inbound)</option>
                <option value="Delivery">Deliveries (Outbound)</option>
                <option value="Transfer">Internal Transfers</option>
                <option value="Adjustment">Discrepancy Adjustments</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#737686] text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs focus:outline-none cursor-pointer hover:bg-[#e6e8ea] border border-transparent focus:border-[#c3c6d7]"
              >
                <option value="30D">Range: Last 30 Days</option>
                <option value="TODAY">Today</option>
                <option value="7D">Last 7 Days</option>
                <option value="Q4">Quarter to Date</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#737686] text-[16px] pointer-events-none">
                calendar_month
              </span>
            </div>

            <div className="relative">
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs focus:outline-none cursor-pointer hover:bg-[#e6e8ea] border border-transparent focus:border-[#c3c6d7]"
              >
                <option value="ALL">Facility: All Warehouses</option>
                <option value="WH-01">WH-01 Main (Austin)</option>
                <option value="WH-02">WH-02 West Bay (Reno)</option>
                <option value="WH-03">WH-03 East Hub (Chicago)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#737686] text-[16px] pointer-events-none">
                warehouse
              </span>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs focus:outline-none cursor-pointer hover:bg-[#e6e8ea] border border-transparent focus:border-[#c3c6d7]"
              >
                <option value="ALL">Status: All States</option>
                <option value="Validated">Validated</option>
                <option value="Done">Done</option>
                <option value="Pending">Pending Audit</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#737686] text-[16px] pointer-events-none">
                filter_list
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="h-9 px-2.5 rounded-lg text-[#505f76] hover:text-[#191c1e] hover:bg-[#f2f4f6] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Copy Toast notice */}
        {copyFeedback && (
          <div className="bg-blue-50 text-blue-700 px-4 py-1.5 text-xs flex items-center justify-between border-b border-blue-100">
            <span>Copied movement reference {copyFeedback} to clipboard</span>
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </div>
        )}

        {/* Ledger Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] text-[#505f76] text-[11px] uppercase tracking-wider select-none h-9 font-semibold">
                <th className="px-4 py-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 && selectedIds.length === filteredMovements.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded cursor-pointer accent-[#2563eb]"
                  />
                </th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Movement Ref</th>
                <th className="px-4 py-2">Product & SKU</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                <th className="px-4 py-2">Origin (From)</th>
                <th className="px-4 py-2">Destination (To)</th>
                <th className="px-4 py-2">Recorded By</th>
                <th className="px-4 py-2 text-center">Audit Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#191c1e] divide-y divide-gray-100">
              {filteredMovements.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                const isReceipt = row.type === 'Receipt';
                const isDelivery = row.type === 'Delivery';
                const isTransfer = row.type === 'Transfer';
                const isAdj = row.type === 'Adjustment';

                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectMovement(row.ref)}
                    className={`hover:bg-[#f2f4f6]/70 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => handleToggleRow(row.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded cursor-pointer accent-[#2563eb]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#191c1e] text-xs font-tabular">
                          {row.date}
                        </span>
                        <span className="text-[11px] text-[#505f76]">{row.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#004ac6] text-xs font-mono">{row.ref}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyRef(row.ref, e)}
                          title="Copy Movement Ref"
                          className="opacity-0 group-hover:opacity-100 text-[#737686] hover:text-[#191c1e] transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#f2f4f6] flex items-center justify-center flex-shrink-0 text-[#004ac6]">
                          <span className="material-symbols-outlined text-[16px]">
                            {isReceipt
                              ? 'precision_manufacturing'
                              : isDelivery
                              ? 'sensors'
                              : isTransfer
                              ? 'memory'
                              : 'tune'}
                          </span>
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-[#191c1e] truncate text-xs">
                            {row.productName}
                          </span>
                          <span className="text-[11px] text-[#505f76] font-mono">{row.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isReceipt && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ecfdf5] text-[#047857] text-xs font-medium">
                          <span className="material-symbols-outlined text-[14px]">call_received</span>
                          <span>Receipt</span>
                        </span>
                      )}
                      {isDelivery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8] text-xs font-medium">
                          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                          <span>Delivery</span>
                        </span>
                      )}
                      {isTransfer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f5f3ff] text-[#6d28d9] text-xs font-medium">
                          <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                          <span>Transfer</span>
                        </span>
                      )}
                      {isAdj && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fffbeb] text-[#b45309] text-xs font-medium">
                          <span className="material-symbols-outlined text-[14px]">tune</span>
                          <span>Adjustment</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold text-xs font-tabular ${
                          row.numericDelta > 0
                            ? 'text-[#047857]'
                            : row.numericDelta < 0
                            ? 'text-[#ba1a1a]'
                            : 'text-[#4d556b]'
                        }`}
                      >
                        {row.deltaQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="flex items-center gap-1 truncate text-[#505f76]" title={row.source}>
                        <span className="material-symbols-outlined text-[14px] text-[#737686] flex-shrink-0">
                          storefront
                        </span>
                        <span className="truncate text-xs">{row.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="flex items-center gap-1 truncate text-[#191c1e] font-medium" title={row.destination}>
                        <span className="material-symbols-outlined text-[14px] text-[#004ac6] flex-shrink-0">
                          domain
                        </span>
                        <span className="truncate text-xs">{row.destination}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#2563eb] text-white text-[10px] font-bold flex items-center justify-center">
                          {row.operatorInitials}
                        </span>
                        <span className="text-xs text-[#191c1e]">{row.operator}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.status === 'Validated' || row.status === 'Done'
                            ? 'bg-[#ecfdf5] text-[#047857]'
                            : 'bg-[#fef3c7] text-[#92400e]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectMovement(row.ref)}
                        className="p-1.5 rounded-lg text-[#505f76] hover:text-[#004ac6] hover:bg-[#eceef0] transition-colors"
                        title="Open Deep Inspector Drawer"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-[#f2f4f6] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#505f76] text-xs border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#191c1e] font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#004ac6]">security</span>
              <span className="font-mono text-[#737686]">SHA-256 Ledger Verified (block #894,102)</span>
            </div>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span>
              Showing <strong className="text-[#191c1e]">{filteredMovements.length}</strong> of{' '}
              <strong className="text-[#191c1e]">1,428</strong> movements
            </span>
          </div>

          <div className="flex items-center gap-1 select-none">
            <button type="button" disabled className="p-1 rounded-lg text-[#737686] disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">first_page</span>
            </button>
            <button type="button" disabled className="p-1 rounded-lg text-[#737686] disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => alert('Loaded page 2 audit blocks')}
              className="w-7 h-7 rounded-lg text-[#505f76] hover:bg-[#e6e8ea] text-xs font-medium flex items-center justify-center"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => alert('Loaded page 3 audit blocks')}
              className="w-7 h-7 rounded-lg text-[#505f76] hover:bg-[#e6e8ea] text-xs font-medium flex items-center justify-center"
            >
              3
            </button>
            <span className="px-1 text-[#737686]">...</span>
            <button
              type="button"
              onClick={() => alert('Jumped to block 143')}
              className="w-7 h-7 rounded-lg text-[#505f76] hover:bg-[#e6e8ea] text-xs font-medium flex items-center justify-center"
            >
              143
            </button>
            <button type="button" className="p-1 rounded-lg text-[#505f76] hover:bg-[#e6e8ea]">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Analytics Cards (Donut, Compliance & Custody, Discrepancies) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Movement Breakdown Donut */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">donut_large</span>
              <span className="text-sm font-semibold text-[#191c1e]">Movement Breakdown</span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-[#505f76]">30-DAY VELOCITY</span>
          </div>

          <div className="flex items-center justify-around py-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#ecfdf5]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.8"
                />
                <path
                  className="text-[#2563eb]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="55, 100"
                  strokeWidth="3.8"
                />
                <path
                  className="text-[#10b981]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="32, 100"
                  strokeDashoffset="-55"
                  strokeWidth="3.8"
                />
                <path
                  className="text-[#8b5cf6]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-87"
                  strokeWidth="3.8"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[16px] font-bold text-[#191c1e]">1.4k</span>
                <span className="text-[10px] text-[#737686] uppercase font-semibold">Total</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                <span className="text-[#505f76]">Deliveries:</span>
                <span className="font-semibold text-[#191c1e]">55%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span className="text-[#505f76]">Receipts:</span>
                <span className="font-semibold text-[#191c1e]">32%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-[#505f76]">Transfers:</span>
                <span className="font-semibold text-[#191c1e]">10%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                <span className="text-[#505f76]">Adjustments:</span>
                <span className="font-semibold text-[#191c1e]">3%</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#f2f4f6] flex items-center justify-between text-xs text-[#505f76]">
            <span>Daily Mean Velocity</span>
            <span className="font-semibold text-[#191c1e]">47.6 tx / day</span>
          </div>
        </div>

        {/* Card 2: Compliance & Custody */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#047857] text-[20px]">shield_with_heart</span>
              <span className="text-sm font-semibold text-[#191c1e]">Compliance & Custody</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#ecfdf5] text-[#047857] text-[10px] font-semibold uppercase">
              Compliant
            </span>
          </div>

          <div className="flex flex-col gap-2.5 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#505f76]">Operator Signature Capture</span>
              <span className="font-semibold text-[#191c1e]">100% Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#505f76]">Double-Blind Cycle Discrepancy</span>
              <span className="font-semibold text-[#047857]">&lt; 0.18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#505f76]">Ledger Immutability Proof</span>
              <span className="font-mono text-[#737686] text-[11px]">ECDSA-secp256k1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#505f76]">Last External Audit</span>
              <span className="font-semibold text-[#191c1e]">Nov 01, 2023</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#f2f4f6] flex items-center justify-between text-xs text-[#505f76]">
            <span>Next Scheduled Re-Index</span>
            <span className="font-semibold text-[#004ac6]">In 4 hours (02:00 UTC)</span>
          </div>
        </div>

        {/* Card 3: Recent Discrepancies */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b45309] text-[20px]">warning</span>
              <span className="text-sm font-semibold text-[#191c1e]">Recent Discrepancies</span>
            </div>
            <span className="text-[11px] text-[#b45309] font-bold">1 Action Required</span>
          </div>

          <div className="flex flex-col gap-2 py-2">
            <div className="p-2.5 rounded-lg bg-[#f2f4f6] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-600 text-[18px] flex-shrink-0 mt-0.5">
                report
              </span>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#191c1e]">ADJ-2023-0180 (Guide Rails)</span>
                <span className="text-[#505f76] text-[11px] leading-tight">
                  +2 units detected during WH-03 count. Supervisor countersign pending.
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#f2f4f6] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#047857] text-[18px] flex-shrink-0 mt-0.5">
                check_circle
              </span>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#191c1e]">ADJ-2023-0179 (Damaged Seals)</span>
                <span className="text-[#505f76] text-[11px] leading-tight">
                  Reconciliation confirmed by E. Vance. Written off to scrap account.
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTypeFilter('Adjustment')}
            className="w-full py-1.5 rounded-lg bg-[#eceef0] hover:bg-[#e6e8ea] text-[#191c1e] text-xs font-semibold transition-colors text-center"
          >
            Open Audit Ledger Queue
          </button>
        </div>
      </div>

      {/* Deep Inspector Drawer (Slide-out from Right) */}
      {activeMovementRef && activeMovement && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div
            className="h-full w-full max-w-xl bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="h-16 px-6 bg-[#f2f4f6] flex items-center justify-between border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563eb] text-[22px]">history_edu</span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#191c1e] leading-tight">
                    Movement {activeMovement.ref}
                  </span>
                  <span className="text-[11px] text-[#505f76]">Ledger Entry Deep Inspection</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectMovement(null)}
                className="p-2 rounded-xl text-[#505f76] hover:text-[#191c1e] hover:bg-[#e6e8ea] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Ledger Hash */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#f2f4f6]">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[10px] text-[#505f76] uppercase font-semibold">
                    Ledger Transaction Hash
                  </span>
                  <span className="font-mono text-xs text-[#191c1e] font-medium truncate">
                    {activeMovement.hash}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#ecfdf5] text-[#047857] text-[11px] font-semibold uppercase flex-shrink-0">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{activeMovement.status}</span>
                </span>
              </div>

              {/* Payload spec */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#505f76] uppercase tracking-wider">
                  Item & Payload Specification
                </span>
                <div className="p-4 rounded-xl bg-[#f2f4f6] flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-[#191c1e]">{activeMovement.productName}</h3>
                      <span className="text-xs text-[#505f76] font-mono">{activeMovement.sku}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[24px] font-bold font-tabular leading-none ${
                          activeMovement.numericDelta > 0
                            ? 'text-[#047857]'
                            : activeMovement.numericDelta < 0
                            ? 'text-[#ba1a1a]'
                            : 'text-[#191c1e]'
                        }`}
                      >
                        {activeMovement.qtyRaw}
                      </span>
                      <span className="block text-[10px] text-[#505f76] font-semibold">UNITS</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <span className="text-[10px] text-[#737686] uppercase font-semibold">BATCH / LOT</span>
                      <p className="text-xs text-[#191c1e] font-mono font-medium">{activeMovement.batch}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#737686] uppercase font-semibold">SERIAL RANGE</span>
                      <p className="text-xs text-[#191c1e] font-mono font-medium">{activeMovement.serials}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Waypoints */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#505f76] uppercase tracking-wider">
                  Transfer Waypoints
                </span>
                <div className="p-4 rounded-xl bg-[#f2f4f6] flex flex-col gap-3 relative">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#737686] text-[20px] mt-0.5">
                      trip_origin
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#737686] uppercase font-semibold">SOURCE / ORIGIN</span>
                      <span className="text-xs font-semibold text-[#191c1e]">{activeMovement.source}</span>
                      <span className="text-[11px] text-[#505f76]">Document: {activeMovement.parentDoc || 'Verified'}</span>
                    </div>
                  </div>
                  <div className="ml-2.5 h-6 w-0.5 bg-[#c3c6d7]"></div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#2563eb] text-[20px] mt-0.5">
                      location_on
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#737686] uppercase font-semibold">
                        DESTINATION FACILITY
                      </span>
                      <span className="text-xs font-semibold text-[#191c1e]">{activeMovement.destination}</span>
                      <span className="text-[11px] text-[#505f76]">Allocated Bin: Staging-IN-01</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custody Chain */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#505f76] uppercase tracking-wider">
                  Custody & Verification Chain
                </span>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f4f6]">
                    <span className="text-[#505f76]">Execution Operator</span>
                    <span className="font-semibold text-[#191c1e]">{activeMovement.operator}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f4f6]">
                    <span className="text-[#505f76]">Authorization Timestamp</span>
                    <span className="font-mono text-[#191c1e]">{activeMovement.date} {activeMovement.time}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f4f6]">
                    <span className="text-[#505f76]">Quality Inspection Report</span>
                    <span className="text-[#047857] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      {activeMovement.qaInspection || 'Passed (Grade A)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compliance guarantee note */}
              <div className="p-3.5 rounded-lg bg-blue-50 text-[#004ac6] text-xs flex items-start gap-2 border border-blue-100">
                <span className="material-symbols-outlined text-[18px] text-[#004ac6] flex-shrink-0 mt-0.5">
                  lock
                </span>
                <span>
                  This movement record was cryptographically signed at timestamp execution. Any post-hoc delta
                  violates compliance protocol ISO-9001:2015.
                </span>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-[#f2f4f6] flex items-center justify-end gap-3 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white text-[#191c1e] text-xs font-semibold shadow-xs hover:bg-gray-50 border border-gray-200 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Waybill</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectMovement(null)}
                className="px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-semibold shadow-sm hover:bg-[#004ac6] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
