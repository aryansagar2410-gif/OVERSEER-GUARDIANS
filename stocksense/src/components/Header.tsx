import React, { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenScanner: () => void;
  deviceViewMode: 'desktop' | 'mobile';
  onToggleDeviceView: (mode: 'desktop' | 'mobile') => void;
  onNavigateToAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenScanner,
  deviceViewMode,
  onToggleDeviceView,
  onNavigateToAuth,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#c3c6d7]/20 px-4 md:px-8 flex items-center justify-between z-40 select-none">
      {/* Search Input Box */}
      <div className="flex items-center gap-2 w-full max-w-sm md:max-w-md">
        <div className="relative w-full flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#737686] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SKU, serial, batch, PO, or customer..."
            className="w-full h-9 pl-9 pr-14 rounded-xl bg-[#ffffff] border border-[#c3c6d7]/40 text-xs text-[#191c1e] placeholder:text-[#737686] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all shadow-xs"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[#c3c6d7]/30 bg-[#f2f4f6] text-[10px] text-[#434655] font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Device Shell Viewport Toggle */}
        <div className="hidden sm:flex items-center bg-[#f2f4f6] p-0.5 rounded-lg border border-[#c3c6d7]/30 text-xs">
          <button
            type="button"
            onClick={() => onToggleDeviceView('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              deviceViewMode === 'desktop'
                ? 'bg-white text-[#004ac6] font-medium shadow-xs'
                : 'text-[#505f76] hover:text-[#191c1e]'
            }`}
            title="Desktop 1440px wide layout"
          >
            <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleDeviceView('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              deviceViewMode === 'mobile'
                ? 'bg-white text-[#004ac6] font-medium shadow-xs'
                : 'text-[#505f76] hover:text-[#191c1e]'
            }`}
            title="Handheld RF terminal mobile screen"
          >
            <span className="material-symbols-outlined text-[15px]">stay_current_portrait</span>
            <span>Handheld Tab</span>
          </button>
        </div>

        {/* Optical Scanner CTA Trigger */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="h-9 px-2.5 rounded-xl bg-blue-50 text-[#004ac6] hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Open Barcode / Manifest Scanner"
        >
          <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
          <span className="hidden lg:inline">Scan</span>
        </button>

        {/* Live Sync Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="text-[12px] font-medium text-[#047857]">Sync status: Live</span>
        </div>

        {/* Notification Icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#434655] hover:text-[#191c1e] hover:bg-[#f2f4f6] rounded-xl transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] border border-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 text-left animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-900">Telemetry Notifications</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Real-time</span>
              </div>
              <div className="divide-y divide-gray-100 mt-1 max-h-64 overflow-y-auto">
                <div className="py-2 flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                  <div className="text-xs">
                    <p className="font-medium text-gray-800">Receipt REC-2023-0891 verified</p>
                    <p className="text-[11px] text-gray-500">+120 servo units added to Bay 04</p>
                    <span className="text-[10px] text-gray-400">2 mins ago</span>
                  </div>
                </div>
                <div className="py-2 flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"></span>
                  <div className="text-xs">
                    <p className="font-medium text-gray-800">Reorder Alert: Optical Sensor</p>
                    <p className="text-[11px] text-gray-500">Stock at 6 units (Threshold: 25)</p>
                    <span className="text-[10px] text-gray-400">14 mins ago</span>
                  </div>
                </div>
                <div className="py-2 flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                  <div className="text-xs">
                    <p className="font-medium text-gray-800">Delivery DEL-2023-1420 Staged</p>
                    <p className="text-[11px] text-gray-500">45 pcs queued for Apex Aero dispatch</p>
                    <span className="text-[10px] text-gray-400">42 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#c3c6d7]/30 hidden sm:block"></div>

        {/* Profile Chip */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 cursor-pointer p-1 rounded-xl hover:bg-[#f2f4f6] transition-colors"
          >
            <img
              alt="Elena Vance Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8xHa-zkGo_6-yX0laq3fftbCHXHBWVOrcAnAhDMRE6jQuL-v2qjfga5vf9cGLdG5l8TuyuNXD8WZUx_sbbjwWKQOVO0KphGROP0B16I_b-Ie61OeQMjhVIRTvY1gUNE0jqhLv3q0twkiJkqVAew3nR8FVPC-ewH9bl7EI48M71_bw-xWzenVTniTc7yRPV40U2v_7K9Tk-5UfYb0zs5iYkq5qnwqvPohyHF-pEFYxaok3PN8QPpjV"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[13px] font-semibold text-[#191c1e] leading-tight">Elena Vance</span>
              <span className="text-[11px] text-[#434655] leading-tight">Operations Lead</span>
            </div>
            <span className="material-symbols-outlined text-[#737686] text-[18px]">expand_more</span>
          </div>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 text-left animate-in fade-in">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900">Elena Vance</p>
                <p className="text-[11px] text-gray-500">elena.vance@stocksense.io</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                  Administrator Scope
                </span>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToAuth();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[16px] text-gray-500">lock</span>
                  <span>Enterprise Security Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToAuth();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Switch Account / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
