import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone PWA mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Desktop / Android installation flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#ccff00] hover:bg-[#b8e600] rounded-lg transition-colors shadow-sm active:scale-95 whitespace-nowrap shrink-0"
        aria-label="Install ApexFit"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#18202e] hover:bg-[#222c3d] border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#ccff00]" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#121721] border border-slate-700/80 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ccff00]"></span>
                  Install ApexFit on iOS
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#18202e]">
                  <Share2 className="w-5 h-5 text-[#ccff00] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">1. Tap Share</p>
                    <p className="text-slate-400 mt-0.5">Press the Safari Share button in the bottom navigation bar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#18202e]">
                  <PlusSquare className="w-5 h-5 text-[#ccff00] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">2. Add to Home Screen</p>
                    <p className="text-slate-400 mt-0.5">Scroll down in the share sheet and select "Add to Home Screen".</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 text-xs font-semibold text-black bg-[#ccff00] hover:bg-[#b8e600] rounded-xl transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
