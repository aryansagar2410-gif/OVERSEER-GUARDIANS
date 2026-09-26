import React, { useState } from 'react';
import { InboundReceipt } from '../types/inventory';

interface ReceiptsViewProps { loading?: boolean; error?: string; onRefresh?: () => void;
  receipts: InboundReceipt[];
  onOpenCreateReceipt: () => void;
  onOpenScanner: () => void;
  onValidateReceipt: (receipt: InboundReceipt) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({ loading, error, onRefresh,
  receipts,
  onOpenCreateReceipt,
  onOpenScanner,
  onValidateReceipt,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'waiting' | 'ready' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyStatePreview, setShowEmptyStatePreview] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const filteredReceipts = receipts.filter((r) => {
    if (filterTab !== 'all' && r.status !== filterTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.ref.toLowerCase().includes(q) ||
        r.vendor.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const waitingCount = receipts.filter((r) => r.status === 'waiting').length;
  const readyCount = receipts.filter((r) => r.status === 'ready').length;
  const doneCount = receipts.filter((r) => r.status === 'done').length;

  const handleValidateClick = (r: InboundReceipt) => {
    setValidatingId(r.id);
    setTimeout(() => {
      onValidateReceipt(r);
      setValidatingId(null);
    }, 800);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header and Options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
              Warehouse WH-01
            </span>
            <span className="text-[#c3c6d7] text-xs">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
              Inbound Operations
            </span>
          </div>
          <h1 className="text-[24px] font-semibold text-[#191c1e] tracking-tight">Receipts</h1>
          <p className="text-[13px] text-[#434655]">
            Inbound purchase order shipments and supplier delivery intake queue.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Toggle to view empty state layout as requested in Screenshot 9 */}
          <button
            type="button"
            onClick={() => setShowEmptyStatePreview(!showEmptyStatePreview)}
            className={`h-9 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showEmptyStatePreview
                ? 'bg-blue-50 text-[#004ac6] border-blue-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>{showEmptyStatePreview ? 'Show Populated Queue' : 'View Empty State Layout'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateReceipt}
            className="h-9 px-3.5 rounded-lg bg-[#2563eb] text-white text-[13px] font-semibold flex items-center gap-2 shadow-sm hover:bg-[#004ac6] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Inbound Receipt</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#434655] uppercase font-semibold tracking-wider">
                Awaiting Intake
              </span>
              <span className="text-[32px] font-bold text-[#191c1e] mt-1 font-tabular">
                {showEmptyStatePreview ? 0 : waitingCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#505f76]">
              <span className="material-symbols-outlined text-[20px]">call_received</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-[#434655] text-xs border-t border-gray-100">
            <span>Dock bay active: {showEmptyStatePreview ? 'None' : 'Bay 01 & 04'}</span>
            <span className="font-mono text-[11px]">{showEmptyStatePreview ? '0 POs' : `${waitingCount} POs`}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#434655] uppercase font-semibold tracking-wider">
                Inspecting / Ready
              </span>
              <span className="text-[32px] font-bold text-[#191c1e] mt-1 font-tabular">
                {showEmptyStatePreview ? 0 : readyCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#505f76]">
              <span className="material-symbols-outlined text-[20px]">inventory</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-[#434655] text-xs border-t border-gray-100">
            <span>Quality station idle</span>
            <span className="font-mono text-[11px]">
              {showEmptyStatePreview ? '0 units' : '14,250 pcs'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#434655] uppercase font-semibold tracking-wider">
                Completed Today
              </span>
              <span className="text-[32px] font-bold text-[#191c1e] mt-1 font-tabular">
                {showEmptyStatePreview ? 0 : doneCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#505f76]">
              <span className="material-symbols-outlined text-[20px]">done_all</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-[#434655] text-xs border-t border-gray-100">
            <span>Throughput benchmark</span>
            <span className="font-mono text-[11px]">
              {showEmptyStatePreview ? '0.0 kg' : '1,840 kg'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#434655] uppercase font-semibold tracking-wider">
                Discrepancies
              </span>
              <span className="text-[32px] font-bold text-[#191c1e] mt-1 font-tabular">0</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#505f76]">
              <span className="material-symbols-outlined text-[20px]">report_problem</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-[#434655] text-xs border-t border-gray-100">
            <span>RMA & Over-shipment</span>
            <span className="font-mono text-[11px]">0 open</span>
          </div>
        </div>
      </div>

      {/* Barcode Scanner CTA Trigger */}
      <button
        type="button"
        onClick={onOpenScanner}
        className="w-full bg-[#2563eb] text-white rounded-xl p-4 shadow-sm hover:bg-[#004ac6] active:scale-[0.99] transition-all flex items-center justify-between group overflow-hidden relative cursor-pointer"
      >
        <div className="flex items-center gap-4 relative z-10 text-left min-w-0">
          <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-xs">
            <span className="material-symbols-outlined text-[28px] text-white">document_scanner</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[16px] text-white font-semibold">Scan Inbound Manifest</span>
              <span className="inline-flex w-2 h-2 rounded-full bg-blue-300 animate-ping"></span>
            </div>
            <p className="text-[13px] text-blue-100 truncate mt-0.5">
              Auto-parse Bill of Lading, Pallet QR & SSCC labels
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[20px]">photo_camera</span>
        </div>
      </button>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d7]/20 p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filterTab === 'all'
                ? 'bg-[#2563eb] text-white'
                : 'text-[#434655] hover:bg-[#f2f4f6]'
            }`}
          >
            <span>All Receipts</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[11px] font-mono">
              {receipts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('waiting')}
            className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              filterTab === 'waiting'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:bg-[#f2f4f6]'
            }`}
          >
            <span>Waiting Intake</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#eceef0] text-[#434655] text-[11px] font-mono">
              {waitingCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ready')}
            className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              filterTab === 'ready'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:bg-[#f2f4f6]'
            }`}
          >
            <span>Ready for Inspection</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#eceef0] text-[#434655] text-[11px] font-mono">
              {readyCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('done')}
            className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              filterTab === 'done'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:bg-[#f2f4f6]'
            }`}
          >
            <span>Done</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#eceef0] text-[#434655] text-[11px] font-mono">
              {doneCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[#737686] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter receipts..."
              className="w-full h-8 pl-9 pr-3 rounded-lg bg-[#f2f4f6] text-xs text-[#191c1e] placeholder:text-[#737686] focus:outline-none focus:bg-white border border-transparent focus:border-[#c3c6d7]"
            />
          </div>
          <button
            type="button"
            onClick={() => alert('Sorting receipts by ETA')}
            className="h-8 px-2.5 rounded-lg bg-[#f2f4f6] text-[#434655] hover:bg-[#eceef0] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">swap_vert</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Receipt manifest CSV export started')}
            className="h-8 px-2.5 rounded-lg bg-[#f2f4f6] text-[#434655] hover:bg-[#eceef0] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      </div>

      {/* Main Content: Either Empty State (Screenshot 9) OR Populated Receipts List (Screenshot 7) */}
      {showEmptyStatePreview ? (
        /* Empty State Layout from Screenshot 9 */
        <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d7]/20 overflow-hidden flex flex-col">
          <div className="p-12 sm:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center max-w-xl">
              <div className="w-24 h-24 rounded-2xl bg-[#f2f4f6] flex items-center justify-center text-[#2563eb] mb-6 shadow-sm">
                <svg
                  className="w-12 h-12 text-[#004ac6]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.25"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path>
                  <path d="M12 22V12"></path>
                  <circle cx="12" cy="7" fill="currentColor" r="1.5"></circle>
                  <path d="m7.5 4.5 9 5.2"></path>
                </svg>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d3e4fe] text-[#0b1c30] text-[12px] font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse"></span>
                Dock Intake Queue Empty
              </span>

              <h2 className="text-[24px] font-bold text-[#191c1e] tracking-tight mb-2">
                No Inbound Receipts Found
              </h2>
              <p className="text-[14px] text-[#434655] mb-8 leading-relaxed max-w-md">
                There are no active purchase orders or supplier shipments pending dock intake. Create a new
                receipt manually or import an ASN manifest to populate the receiving ledger.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onOpenCreateReceipt}
                  className="w-full sm:w-auto h-10 px-5 rounded-lg bg-[#2563eb] text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-[#004ac6] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add_box</span>
                  <span>+ Create First Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('ASN EDI 856 Importer: Parsing EDIFACT/X12 electronic advance notice...')}
                  className="w-full sm:w-auto h-10 px-5 rounded-lg bg-white text-[#191c1e] text-[13px] font-medium flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#4d556b]">upload_file</span>
                  <span>Import Supplier ASN (EDI 856)</span>
                </button>
              </div>

              <div className="mt-12 w-full p-4 rounded-xl bg-[#f2f4f6] flex items-start gap-3 text-left">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px] shrink-0 mt-0.5">
                  tips_and_updates
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-[#191c1e]">Pro-tip for Austin WH-01</span>
                  <p className="text-[12px] text-[#434655]">
                    Warehouse docks can automatically generate draft receipts when RF barcode scanners detect
                    incoming carrier tracking tags from FedEx, UPS, or Maersk Logistics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Populated Receipts Stream (matching Screenshot 7) */
        <div className="space-y-4">
          {filteredReceipts.map((r) => {
            const isReady = r.status === 'ready';
            const isWaiting = r.status === 'waiting';
            const isDone = r.status === 'done';
            const isValidating = validatingId === r.id;

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-[#c3c6d7]/30 flex flex-col gap-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-[#191c1e] font-mono">{r.ref}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-[#434655] font-medium">{r.vendor}</span>
                    </div>
                    <p className="text-[16px] font-semibold text-[#191c1e] mt-1">{r.productName}</p>
                  </div>

                  {isReady && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-semibold bg-blue-50 text-blue-700 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                      Ready for Inspection
                    </span>
                  )}
                  {isWaiting && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-semibold bg-amber-50 text-amber-800 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                      Waiting Delivery
                    </span>
                  )}
                  {isDone && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-semibold bg-emerald-50 text-emerald-800 whitespace-nowrap">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600 mr-1">
                        check_circle
                      </span>
                      Done
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="bg-[#f2f4f6] rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#434655]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#505f76]">apps</span>
                    <span>
                      Quantity: <strong className="text-[#191c1e] font-semibold">{r.quantity} {r.unit}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#505f76]">warehouse</span>
                    <span>
                      {r.dock} <span className="text-[#004ac6] font-medium">→ {r.targetBay}</span>
                    </span>
                  </div>
                </div>

                {/* Product preview if present */}
                {r.image && (
                  <div className="flex items-center gap-3 bg-[#eceef0]/60 rounded-lg p-2.5">
                    <img
                      alt={r.productName}
                      src={r.image}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#505f76] uppercase tracking-wider">
                          {r.sku}
                        </span>
                        {r.preCleared && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">verified</span> Pre-cleared
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#191c1e] truncate mt-0.5">
                        Pallet Lot: {r.palletLot || 'PL-9042'} • Weight: {r.weightKg || 480} kg
                      </p>
                    </div>
                  </div>
                )}

                {/* ETA or Stored details */}
                {isWaiting && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-2 rounded-lg bg-[#eceef0] text-xs text-[#434655] gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">schedule</span>
                      <span>ETA: <strong className="text-[#191c1e]">{r.eta || 'Today 16:30'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-[#505f76]">
                      <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                      <span>{r.carrier || 'FedEx Freight #FX-9921'}</span>
                    </div>
                  </div>
                )}

                {isDone && (
                  <div className="flex items-center justify-between text-xs text-[#434655] px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#505f76]">person_check</span>
                      <span>Verified by <strong className="text-[#191c1e]">{r.verifiedBy || 'E. Vance'}</strong></span>
                    </div>
                    <span className="font-mono text-[11px] text-[#505f76]">{r.verifiedTime || 'Today 11:20 AM'}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {isReady && (
                    <>
                      <button
                        type="button"
                        disabled={isValidating}
                        onClick={() => handleValidateClick(r)}
                        className="flex-1 h-9 rounded-lg bg-[#004ac6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-800 transition-colors shadow-xs"
                      >
                        <span className={`material-symbols-outlined text-[17px] ${isValidating ? 'animate-spin' : ''}`}>
                          {isValidating ? 'refresh' : 'check_circle'}
                        </span>
                        <span>{isValidating ? 'Validating...' : 'Validate Receipt'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Inspection checklist opened for ${r.ref}. All seals intact.`)}
                        className="h-9 px-4 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs font-medium hover:bg-[#e6e8ea] transition-colors"
                      >
                        Inspect
                      </button>
                    </>
                  )}
                  {isWaiting && (
                    <>
                      <button
                        type="button"
                        onClick={() => alert(`Tracking Carrier: ${r.carrier}. In transit on I-35 corridor, ETA 16:30.`)}
                        className="flex-1 h-9 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#e6e8ea] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">share_location</span>
                        <span>Track Carrier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Contacted carrier dispatch radio')}
                        className="h-9 px-4 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs font-medium hover:bg-[#e6e8ea] transition-colors"
                      >
                        Dispatch
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3 Guidance cards at bottom matching Screenshot 9 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">qr_code_scanner</span>
              <h3 className="text-sm font-semibold text-[#191c1e]">RF Terminal Mode</h3>
            </div>
            <p className="text-xs text-[#434655]">
              Pair Honeywell or Zebra industrial handhelds to scan pallets directly off delivery trailers.
            </p>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 text-xs">
            <span className="text-[#434655]">Hardware ID: ZEB-904</span>
            <button
              type="button"
              onClick={onOpenScanner}
              className="text-[#004ac6] font-semibold hover:underline"
            >
              Configure Scanner →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">hub</span>
              <h3 className="text-sm font-semibold text-[#191c1e]">Automated ASN Sync</h3>
            </div>
            <p className="text-xs text-[#434655]">
              Connect ERP systems (SAP, NetSuite, Odoo) to automatically pull confirmed Purchase Orders.
            </p>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 text-xs">
            <span className="text-[#434655]">Connectors: 3 Active</span>
            <button
              type="button"
              onClick={() => alert('SAP & NetSuite ERP connectors: Active & Syncing')}
              className="text-[#004ac6] font-semibold hover:underline"
            >
              View Integrations →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d7]/20 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">rule_folder</span>
              <h3 className="text-sm font-semibold text-[#191c1e]">Inspection Protocols</h3>
            </div>
            <p className="text-xs text-[#434655]">
              Set Mandatory Quality Control (AQL 2.5) sampling limits prior to inventory bin put-away.
            </p>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 text-xs">
            <span className="text-[#434655]">Standard QC Profile</span>
            <button
              type="button"
              onClick={() => alert('QC Profile ISO 2859-1 AQL 2.5 Normal Inspection selected')}
              className="text-[#004ac6] font-semibold hover:underline"
            >
              Edit Checklists →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

