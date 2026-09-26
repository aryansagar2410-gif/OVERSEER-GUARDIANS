import React from 'react';
import { WarehouseNode } from '../types/inventory';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeWarehouse: WarehouseNode;
  allWarehouses: WarehouseNode[];
  onSelectWarehouse: (node: WarehouseNode) => void;
  onOpenScanner?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeWarehouse,
  allWarehouses,
  onSelectWarehouse,
}) => {
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'products', label: 'Products', icon: 'inventory_2' },
    { id: 'receipts', label: 'Receipts', icon: 'call_received' },
    { id: 'deliveries', label: 'Delivery Orders', icon: 'local_shipping' },
    { id: 'transfers', label: 'Transfers', icon: 'sync_alt' },
    { id: 'adjustments', label: 'Adjustments', icon: 'tune' },
    { id: 'history', label: 'History & Ledger', icon: 'manage_history' },
    { id: 'auth-portal', label: 'Enterprise Portal', icon: 'admin_panel_settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-[#c3c6d7]/30 flex flex-col justify-between z-50 select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#c3c6d7]/20 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onSelectTab('dashboard')}
          >
            <img
              alt="StockSense Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UvShMQCMdvpPv7ggjMO1lpl5yeIzpQmNxOvW5pJQ14jLgyxTeMn85vLtZ9AQCxp0h8C89FCyzeadp5Vwc9xBw7uKSQGE2O1d0YcpBKnePQ1_CoxXOkIIjQ54VrCP0NkLoqzoNmOEHnjQ-uFKwb3gs4Uhf89i2Kg1R9wAUUK9d2snrRNIIVEtPqmcpvIdznvl1H8UC-sV3eCFygXehSazGfShuohkmKf0NlNz5mBndo-JosLZ8mairXVIc"
            />
            <span className="text-[16px] font-semibold text-[#191c1e] tracking-tight">StockSense</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-lg bg-[#e6e8ea] text-[#434655] text-[11px] font-semibold tracking-wider">
            v2.4
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors text-left w-full ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-xs'
                    : 'text-[#434655] hover:bg-[#f2f4f6] hover:text-[#191c1e]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Terminal Node & Status */}
      <div className="p-2 border-t border-[#c3c6d7]/20 flex flex-col gap-1 relative">
        {warehouseDropdownOpen && (
          <div className="absolute bottom-20 left-2 right-2 bg-white rounded-xl shadow-lg border border-[#c3c6d7]/40 p-1 z-50 text-left animate-in fade-in slide-in-from-bottom-2">
            <div className="px-2 py-1.5 text-[10px] uppercase font-semibold text-[#737686] tracking-wider border-b border-gray-100">
              Select Fulfillment Node
            </div>
            {allWarehouses.map((wh) => (
              <button
                key={wh.id}
                type="button"
                onClick={() => {
                  onSelectWarehouse(wh);
                  setWarehouseDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-lg text-xs transition-colors ${
                  wh.id === activeWarehouse.id ? 'bg-blue-50 text-[#004ac6] font-semibold' : 'text-[#191c1e] hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col">
                  <span>{wh.name}</span>
                  <span className="text-[10px] text-gray-500">{wh.city}, {wh.state}</span>
                </div>
                {wh.id === activeWarehouse.id && (
                  <span className="material-symbols-outlined text-[16px] text-blue-600">check</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div
          onClick={() => setWarehouseDropdownOpen(!warehouseDropdownOpen)}
          className="p-2 rounded-xl bg-[#f2f4f6] border border-[#c3c6d7]/30 flex items-center justify-between cursor-pointer hover:bg-[#eceef0] transition-colors"
          title="Click to switch active warehouse node"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#10b981] flex-shrink-0 animate-pulse"></span>
            <div className="flex flex-col truncate text-left">
              <span className="text-[12px] text-[#191c1e] font-semibold truncate">{activeWarehouse.name}</span>
              <span className="text-[11px] text-[#434655] truncate">{activeWarehouse.city}, {activeWarehouse.state}</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#737686] text-[18px]">unfold_more</span>
        </div>

        <div className="flex items-center justify-between px-1 py-1 text-[#434655] text-[11px]">
          <span>Operational Status</span>
          <span className="text-[#10b981] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            All Systems Live
          </span>
        </div>
      </div>
    </aside>
  );
};
