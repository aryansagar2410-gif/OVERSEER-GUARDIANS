import React, { useState, useEffect } from 'react';
import {
  Product,
  MovementRecord,
  InboundReceipt,
  WarehouseNode,
  ToastMessage,
} from './types/inventory';
import {
  INITIAL_WAREHOUSES,
  INITIAL_PRODUCTS,
  INITIAL_MOVEMENTS,
  INITIAL_RECEIPTS,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MobileDashboardView } from './components/MobileDashboardView';
import { ProductsView } from './components/ProductsView';
import { ReceiptsView } from './components/ReceiptsView';
import { MovementLedgerView } from './components/MovementLedgerView';
import { AuthScreens } from './components/AuthScreens';
import { Toast } from './components/Toast';
import { ScannerModal } from './components/ScannerModal';
import {
  QuickTransferModal,
  AdjustStockModal,
  CreateReceiptModal,
  CreateSkuModal,
} from './components/ActionModals';

export default function App() {
  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [deviceViewMode, setDeviceViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Primary Data State
  const [warehouses] = useState<WarehouseNode[]>(INITIAL_WAREHOUSES);
  const [activeWarehouse, setActiveWarehouse] = useState<WarehouseNode>(INITIAL_WAREHOUSES[0]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<MovementRecord[]>(INITIAL_MOVEMENTS);
  const [receipts, setReceipts] = useState<InboundReceipt[]>(INITIAL_RECEIPTS);

  // Inspector & Modal States
  const [activeMovementRef, setActiveMovementRef] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [createReceiptOpen, setCreateReceiptOpen] = useState(false);
  const [createSkuOpen, setCreateSkuOpen] = useState(false);

  // Toast Notification State (with initial sample toast from Screenshot 1)
  const [toast, setToast] = useState<ToastMessage | null>({
    id: 't-1',
    title: 'Receipt REC-2023-0891 validated',
    description: 'Stock updated (+120 units)',
    timestamp: '2m ago',
    type: 'success',
  });

  const showToast = (title: string, description: string) => {
    setToast({
      id: Date.now().toString(),
      title,
      description,
      timestamp: 'Just now',
      type: 'success',
    });
  };

  // Keyboard shortcut for Command+K / Ctrl+K search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Validate Receipt action handler
  const handleValidateReceipt = (receipt: InboundReceipt) => {
    // 1. Mark receipt as done
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receipt.id
          ? {
              ...r,
              status: 'done',
              verifiedBy: 'Elena Vance',
              verifiedTime: 'Just now',
              storedBin: r.targetBay,
            }
          : r
      )
    );

    // 2. Increase product stock if product exists
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === receipt.sku || p.name.includes(receipt.productName)) {
          return {
            ...p,
            onHand: p.onHand + receipt.quantity,
            status: 'healthy',
          };
        }
        return p;
      })
    );

    // 3. Add to immutable movements ledger
    const newMovement: MovementRecord = {
      id: `m-${Date.now()}`,
      ref: receipt.ref,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: 'Just now',
      productName: receipt.productName,
      sku: receipt.sku,
      type: 'Receipt',
      deltaQty: `+${receipt.quantity} pcs`,
      qtyRaw: `+${receipt.quantity}`,
      numericDelta: receipt.quantity,
      source: receipt.vendor,
      destination: `${activeWarehouse.name} / ${receipt.targetBay}`,
      operator: 'Elena Vance',
      operatorInitials: 'EV',
      status: 'Validated',
      batch: receipt.palletLot || 'LOT-2023-V9',
      serials: `${receipt.sku.slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}...`,
      qaInspection: 'Passed (Grade A - 100% QA pass)',
      parentDoc: receipt.ref,
    };

    setMovements((prev) => [newMovement, ...prev]);

    // 4. Trigger Toast
    showToast(
      `Receipt ${receipt.ref} validated`,
      `Stock updated (+${receipt.quantity} units to ${receipt.targetBay})`
    );
  };

  // Physical stock adjustment action handler
  const handleConfirmAdjust = (sku: string, delta: number, reason: string) => {
    const product = products.find((p) => p.sku === sku);
    if (!product) return;

    // Update product stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          const newOnHand = Math.max(0, p.onHand + delta);
          return {
            ...p,
            onHand: newOnHand,
            status: newOnHand === 0 ? 'out-of-stock' : newOnHand < 15 ? 'low-stock' : 'healthy',
          };
        }
        return p;
      })
    );

    // Log adjustment in ledger
    const adjRef = `ADJ-2023-0${Math.floor(180 + Math.random() * 800)}`;
    const newMovement: MovementRecord = {
      id: `m-${Date.now()}`,
      ref: adjRef,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: 'Just now',
      productName: product.name,
      sku: product.sku,
      type: 'Adjustment',
      deltaQty: `${delta > 0 ? `+${delta}` : delta} ${product.unit}`,
      qtyRaw: `${delta > 0 ? `+${delta}` : delta}`,
      numericDelta: delta,
      source: `${activeWarehouse.name} / ${product.location}`,
      destination: delta < 0 ? 'Quarantine / Discrepancy Ledger' : `${activeWarehouse.name} / ${product.location}`,
      operator: 'Elena Vance',
      operatorInitials: 'EV',
      status: 'Validated',
      batch: 'LOT-2023-ADJ',
      serials: 'AUDIT-SIG-VERIFIED',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}...`,
      qaInspection: reason,
      parentDoc: `CYCLE-${Math.floor(100 + Math.random() * 900)}`,
    };

    setMovements((prev) => [newMovement, ...prev]);

    showToast(
      `Adjustment ${adjRef} recorded`,
      `${product.sku} adjusted by ${delta > 0 ? `+${delta}` : delta} ${product.unit}`
    );
  };

  // Quick Transfer confirmation
  const handleConfirmTransfer = (data: {
    sku: string;
    productName: string;
    quantity: number;
    source: string;
    destination: string;
  }) => {
    const trfRef = `TRF-2023-0${Math.floor(400 + Math.random() * 500)}`;
    const newMovement: MovementRecord = {
      id: `m-${Date.now()}`,
      ref: trfRef,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: 'Just now',
      productName: data.productName,
      sku: data.sku,
      type: 'Transfer',
      deltaQty: `${data.quantity} moved (Net 0)`,
      qtyRaw: `${data.quantity}`,
      numericDelta: 0,
      source: data.source,
      destination: data.destination,
      operator: 'Elena Vance',
      operatorInitials: 'EV',
      status: 'Validated',
      batch: 'LOT-2023-TRF',
      serials: 'AUTO-ROUTE-STAGED',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}...`,
      qaInspection: 'Transit manifest auto-routed',
      parentDoc: `MNF-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setMovements((prev) => [newMovement, ...prev]);

    showToast(
      `Transfer ${trfRef} registered`,
      `${data.quantity} units dispatched from ${data.source} → ${data.destination}`
    );
  };

  // Add new receipt
  const handleAddReceipt = (newR: Partial<InboundReceipt>) => {
    const receiptItem: InboundReceipt = {
      id: `r-${Date.now()}`,
      ref: newR.ref || `REC-2023-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor: newR.vendor || 'Supplier External',
      productName: newR.productName || 'Industrial Assembly',
      sku: newR.sku || 'SKU-GEN-100',
      status: 'ready',
      quantity: newR.quantity || 100,
      unit: newR.unit || 'pcs',
      dock: newR.dock || 'Dock Bay 01',
      targetBay: newR.targetBay || 'Bay 01',
      palletLot: newR.palletLot || 'PL-NEW',
      weightKg: newR.weightKg || 250,
      preCleared: true,
    };
    setReceipts((prev) => [receiptItem, ...prev]);
    showToast(
      `Receipt ${receiptItem.ref} Created`,
      `Expected from ${receiptItem.vendor} (${receiptItem.quantity} ${receiptItem.unit})`
    );
  };

  // Add new SKU
  const handleAddSku = (newP: Partial<Product>) => {
    const productItem: Product = {
      id: `p-${Date.now()}`,
      sku: newP.sku || 'SKU-NEW',
      name: newP.name || 'New Item',
      category: newP.category || 'Motors',
      location: newP.location || 'Bay 01',
      onHand: newP.onHand || 50,
      unit: newP.unit || 'units',
      status: 'healthy',
      bufferTriggerText: '20 min',
      image:
        newP.image ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCaYyLihBQspR75kBuJwBPpOtNyRUZyNbxSxDkY5WUkpHmSfHLpy7ad2kPEnt1wNDwn_bPvohj94LqqUcOAZWPHygMf_xdgx9VBlRYCg3MO1lg8VBkvL3GVf0oACiZ4L4t-pYf-3I89lNAjEBysAWU047tOsGCmzbLpYRHVoyQZuKo-Tyuvz-QMmJZIOAUXQ9F6XwjuWC1y9GPv1v8L39JM5y_dgUoCbarAxfVv01bT1WgfLvrEdRXd',
      imageAlt: newP.name || 'New SKU',
    };
    setProducts((prev) => [productItem, ...prev]);
    showToast(`New SKU Registered`, `${productItem.sku} — ${productItem.name}`);
  };

  // Export CSV Action
  const handleExportCsv = () => {
    const headers = [
      'Movement Ref',
      'Date',
      'Time',
      'Product Name',
      'SKU',
      'Type',
      'Quantity Delta',
      'Origin (From)',
      'Destination (To)',
      'Operator',
      'Status',
      'Cryptographic Hash',
    ];
    const rows = movements.map((m) => [
      m.ref,
      m.date,
      m.time,
      `"${m.productName}"`,
      m.sku,
      m.type,
      `"${m.deltaQty}"`,
      `"${m.source}"`,
      `"${m.destination}"`,
      `"${m.operator}"`,
      m.status,
      m.hash,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Signed Audit Log Exported', 'StockSense_Ledger.csv generated with SHA-256 proofs');
  };

  // Cryptographic Merkle Root Verification
  const handleVerifyIntegrity = () => {
    showToast(
      'SHA-256 Ledger Audit Complete',
      'Block #894,102 verified across 1,428 transactions with zero tampering.'
    );
  };

  // Barcode / Scanner Matcher
  const handleScanResult = (code: string) => {
    const matchedProduct = products.find(
      (p) => p.sku.toLowerCase() === code.toLowerCase() || p.id === code
    );
    if (matchedProduct) {
      setCurrentTab('products');
      setGlobalSearch(matchedProduct.sku);
      showToast('Optical Scanner Match', `Identified SKU: ${matchedProduct.sku} (${matchedProduct.name})`);
      return;
    }

    const matchedReceipt = receipts.find(
      (r) => r.ref.toLowerCase() === code.toLowerCase() || r.sku.toLowerCase() === code.toLowerCase()
    );
    if (matchedReceipt) {
      setCurrentTab('receipts');
      setGlobalSearch(matchedReceipt.ref);
      showToast('Manifest Match', `Located Inbound Receipt: ${matchedReceipt.ref}`);
      return;
    }

    showToast('Code Captured', `Detected raw barcode: ${code}`);
    setGlobalSearch(code);
  };

  // If user navigated to Authentication & Security Portal
  if (currentTab === 'auth-portal') {
    return (
      <AuthScreens
        onLoginSuccess={(email) => {
          showToast('Welcome back, Elena Vance', `Authenticated as ${email}`);
          setCurrentTab('dashboard');
        }}
        onBackToApp={() => setCurrentTab('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col antialiased">
      {/* ============================================================== */}
      {/* DESKTOP LAYOUT (Default & Full Workspace view)                 */}
      {/* ============================================================== */}
      {deviceViewMode === 'desktop' && (
        <div className="flex w-full min-h-screen">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              activeWarehouse={activeWarehouse}
              allWarehouses={warehouses}
              onSelectWarehouse={setActiveWarehouse}
              onOpenScanner={() => setScannerOpen(true)}
            />
          </div>

          {/* Main Area */}
          <div className="flex-1 md:pl-60 flex flex-col min-w-0">
            {/* Desktop Top Header */}
            <Header
              searchQuery={globalSearch}
              onSearchChange={setGlobalSearch}
              onOpenScanner={() => setScannerOpen(true)}
              deviceViewMode={deviceViewMode}
              onToggleDeviceView={setDeviceViewMode}
              onNavigateToAuth={() => setCurrentTab('auth-portal')}
            />

            {/* Main Content Viewport */}
            <main className="w-full pt-16 bg-[#f7f9fb] min-h-[calc(100vh-64px)] pb-12">
              {currentTab === 'dashboard' && (
                <DashboardView
                  warehouse={activeWarehouse}
                  products={products}
                  movements={movements}
                  onOpenQuickTransfer={() => setTransferModalOpen(true)}
                  onOpenNewReceipt={() => setCreateReceiptOpen(true)}
                  onInspectMovement={(ref) => setActiveMovementRef(ref)}
                  onExportCsv={handleExportCsv}
                  onDraftPO={() => setTransferModalOpen(true)}
                  onReconcile={handleVerifyIntegrity}
                />
              )}

              {currentTab === 'products' && (
                <ProductsView
                  products={products}
                  onOpenNewSku={() => setCreateSkuOpen(true)}
                  onOpenScanner={() => setScannerOpen(true)}
                  onAdjustProduct={(p) => setAdjustModalProduct(p)}
                  onTransferProduct={() => setTransferModalOpen(true)}
                  onDraftPO={(p) => {
                    showToast('Purchase Order Drafted', `PO-2023-${Math.floor(1000 + Math.random() * 9000)} queued for ${p ? p.sku : 'inventory replenishment'}`);
                  }}
                  onViewMovementLog={(sku) => {
                    setCurrentTab('history');
                    setGlobalSearch(sku);
                  }}
                />
              )}

              {currentTab === 'receipts' && (
                <ReceiptsView
                  receipts={receipts}
                  onOpenCreateReceipt={() => setCreateReceiptOpen(true)}
                  onOpenScanner={() => setScannerOpen(true)}
                  onValidateReceipt={handleValidateReceipt}
                />
              )}

              {(currentTab === 'history' || currentTab === 'deliveries' || currentTab === 'transfers' || currentTab === 'adjustments') && (
                <MovementLedgerView
                  movements={movements}
                  onExportCsv={handleExportCsv}
                  onVerifyIntegrity={handleVerifyIntegrity}
                  activeMovementRef={activeMovementRef}
                  onSelectMovement={setActiveMovementRef}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* HANDHELD MOBILE SHELL VIEW (Screenshots 2, 3, 4, 7)            */}
      {/* ============================================================== */}
      {deviceViewMode === 'mobile' && (
        <div className="w-full flex-1 flex flex-col min-h-screen bg-[#f7f9fb]">
          {/* Top Mobile Bar */}
          <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-xs border-b border-gray-100">
            <div className="h-14 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  alt="StockSense"
                  className="h-7 w-auto object-contain flex-shrink-0"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1UXocjtMUrIoRdmAAhm8Epl0mYW271zq4ZXxZys7SK76p4CwDIv-6HQ9ktq8SylFBe8y1LwV8bDZsCIBOzn1qdizSJ18a32TbHKUxOKSu21yNY5kRxWfl7lSzGU0jXvwNlcanWDT9lnjB7v3XVJjxQNwdW7_UKeJHcmdKq2kAY-E-Fz5j68cBociOzKEFnL8eE3wzNfUSm0_kw7EOMGuR4duYmOIZAoahRxz-IJdyV6NRJdnDaMpz5zRmU"
                />
                <span className="text-sm font-bold text-[#191c1e] truncate">StockSense</span>
                <span className="px-1.5 py-0.2 rounded bg-gray-100 text-[#434655] text-[10px] font-semibold">
                  {activeWarehouse.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Switcher back to desktop view */}
                <button
                  type="button"
                  onClick={() => setDeviceViewMode('desktop')}
                  className="px-2 py-1 rounded-md bg-blue-50 text-[#004ac6] text-[11px] font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">desktop_windows</span>
                  <span>Exit Mobile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-[#004ac6] flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
                </button>
              </div>
            </div>

            <div className="px-4 pb-2 flex items-center justify-between">
              <h1 className="text-lg font-bold text-[#191c1e] capitalize tracking-tight">
                {currentTab === 'history' ? 'Movement Ledger' : currentTab}
              </h1>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                99.8% Sync
              </span>
            </div>
          </header>

          {/* Mobile Main Body */}
          <main className="flex-1 w-full pb-20">
            {currentTab === 'dashboard' && (
              <MobileDashboardView
                warehouse={activeWarehouse}
                products={products}
                movements={movements}
                onOpenScanner={() => setScannerOpen(true)}
                onOpenNewReceipt={() => setCreateReceiptOpen(true)}
                onOpenQuickTransfer={() => setTransferModalOpen(true)}
                onSelectTab={setCurrentTab}
                onSwitchWarehouse={() => {
                  const nextIndex = (warehouses.findIndex((w) => w.id === activeWarehouse.id) + 1) % warehouses.length;
                  setActiveWarehouse(warehouses[nextIndex]);
                }}
              />
            )}

            {currentTab === 'products' && (
              <ProductsView
                products={products}
                onOpenNewSku={() => setCreateSkuOpen(true)}
                onOpenScanner={() => setScannerOpen(true)}
                onAdjustProduct={(p) => setAdjustModalProduct(p)}
                onTransferProduct={() => setTransferModalOpen(true)}
                onDraftPO={(p) => {
                  showToast('PO Drafted', `Replenishment order for ${p ? p.sku : 'SKU'}`);
                }}
                onViewMovementLog={(sku) => {
                  setCurrentTab('history');
                  setGlobalSearch(sku);
                }}
              />
            )}

            {currentTab === 'receipts' && (
              <ReceiptsView
                receipts={receipts}
                onOpenCreateReceipt={() => setCreateReceiptOpen(true)}
                onOpenScanner={() => setScannerOpen(true)}
                onValidateReceipt={handleValidateReceipt}
              />
            )}

            {(currentTab === 'history' || currentTab === 'movement') && (
              <MovementLedgerView
                movements={movements}
                onExportCsv={handleExportCsv}
                onVerifyIntegrity={handleVerifyIntegrity}
                activeMovementRef={activeMovementRef}
                onSelectMovement={setActiveMovementRef}
              />
            )}
          </main>

          {/* Fixed Mobile Bottom Tab Navigation matching Screenshots 2, 3, 4, 7 */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
              <button
                type="button"
                onClick={() => setCurrentTab('dashboard')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-11 transition-colors ${
                  currentTab === 'dashboard' ? 'text-[#004ac6] font-semibold' : 'text-[#737686]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">dashboard</span>
                <span className="text-[11px] mt-0.5">Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('products')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-11 transition-colors ${
                  currentTab === 'products' ? 'text-[#004ac6] font-semibold' : 'text-[#737686]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
                <span className="text-[11px] mt-0.5">Products</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('receipts')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-11 transition-colors ${
                  currentTab === 'receipts' ? 'text-[#004ac6] font-semibold' : 'text-[#737686]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">move_to_inbox</span>
                <span className="text-[11px] mt-0.5">Receipts</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('history')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-11 transition-colors ${
                  currentTab === 'history' || currentTab === 'movement'
                    ? 'text-[#004ac6] font-semibold'
                    : 'text-[#737686]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">history</span>
                <span className="text-[11px] mt-0.5">Movement</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('auth-portal')}
                className={`flex flex-col items-center justify-center min-w-[56px] h-11 transition-colors ${
                  currentTab === 'auth-portal' ? 'text-[#004ac6] font-semibold' : 'text-[#737686]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">tune</span>
                <span className="text-[11px] mt-0.5">More</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Floating Global Validation / Status Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Scanner Simulation Modal */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanResult={handleScanResult}
      />

      {/* Action Modals */}
      <QuickTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        products={products}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <AdjustStockModal
        product={adjustModalProduct}
        isOpen={Boolean(adjustModalProduct)}
        onClose={() => setAdjustModalProduct(null)}
        onConfirmAdjust={handleConfirmAdjust}
      />

      <CreateReceiptModal
        isOpen={createReceiptOpen}
        onClose={() => setCreateReceiptOpen(false)}
        onAddReceipt={handleAddReceipt}
      />

      <CreateSkuModal
        isOpen={createSkuOpen}
        onClose={() => setCreateSkuOpen(false)}
        onAddSku={handleAddSku}
      />
    </div>
  );
}
