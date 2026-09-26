import React, { useState } from 'react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (code: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scanningStatus, setScanningStatus] = useState<'idle' | 'scanning' | 'success'>('scanning');

  if (!isOpen) return null;

  const sampleCodes = [
    { code: 'SKU-SRV-9021', label: 'Industrial Servo Motor 48V' },
    { code: 'SKU-OPT-3312', label: 'Optical Proximity Sensor' },
    { code: 'REC-2023-0891', label: 'Inbound Receipt Manifest' },
    { code: 'TRF-2023-0402', label: 'Internal Transfer Pallet' },
  ];

  const handleTriggerCode = (code: string) => {
    setScanningStatus('success');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setTimeout(() => {
      onScanResult(code);
      setScanningStatus('idle');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#191c1e] text-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-800 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[22px]">barcode_scanner</span>
            <div>
              <h3 className="text-sm font-semibold">Optical Manifest & Barcode Scanner</h3>
              <p className="text-[11px] text-gray-400">Aim target at QR, SSCC, or Code 128</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Viewfinder Camera Simulation */}
        <div className="relative h-64 bg-black overflow-hidden flex items-center justify-center">
          {/* Background simulated warehouse shelf */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDS3aee27PDmfkWZvsrrDJnoaaATtUeXp4ZRNUjDCF75j3zXwkiJWlP8UqnSWHnHcAHFvywu6HJRkIKCVA00HTlx1XWqskMoPNaBQ7GXpZRmrQqkSFDwCiQasDrcK9bqQjJKbsJwjpw7rvYvOVS6gJ9ZzuMAuJGdOcNc16Qs9d95cQAVME5Dl72QPr8ML3TjfI6bv_3ODx4owRFrYLqPMCWRcx_n5UqHYf7jlnMqOgFlusZh7HJs128')",
            }}
          />

          {/* Laser scanning line */}
          <div className="absolute inset-x-8 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>

          {/* Targeting Box Reticle */}
          <div className="relative z-10 w-48 h-40 border-2 border-blue-400/80 rounded-xl flex items-center justify-center bg-blue-500/10">
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>

            <span className="text-[11px] font-mono text-blue-200 tracking-wider bg-black/60 px-2 py-0.5 rounded">
              {scanningStatus === 'success' ? 'CAPTURED!' : 'ALIGN BARCODE'}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-gray-400 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Laser Active (650nm)
            </span>
            <span>RF Terminal v2.4</span>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="p-4 bg-[#23272a] space-y-3">
          <div className="text-xs font-medium text-gray-300">Tap to Simulate Scan Detection:</div>
          <div className="grid grid-cols-2 gap-2">
            {sampleCodes.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleTriggerCode(item.code)}
                className="p-2 rounded-lg bg-gray-800/80 hover:bg-blue-600 text-left transition-colors border border-gray-700/60"
              >
                <div className="text-[11px] font-mono font-bold text-blue-300">{item.code}</div>
                <div className="text-[10px] text-gray-400 truncate">{item.label}</div>
              </button>
            ))}
          </div>

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t border-gray-700/60 flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or enter SKU/Reference manually..."
              className="flex-1 h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                if (manualCode.trim()) handleTriggerCode(manualCode.trim());
              }}
              className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
