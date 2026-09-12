import React, { useState } from 'react';
import { Bug, X, Wifi, WifiOff, Turtle } from 'lucide-react';
import { getLatencySettings, setLatencySettings } from '../services/latency';

// Floating dev-only control for exercising loading/error/offline states
// without touching code. Not part of any SRS clause — it exists so the
// "build the failure path first" convention (Phase 6) is actually testable
// by whoever is reviewing the build, not just by the code that uses it.
export const DevPanel = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getLatencySettings());

  const apply = (patch) => {
    setLatencySettings(patch);
    setSettings(getLatencySettings());
  };

  return (
    <div className="fixed bottom-2 right-2 z-[999]">
      {open ? (
        <div className="w-56 bg-stone-900 text-white rounded-xl shadow-2xl border border-stone-700 p-3 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Bug className="w-3.5 h-3.5" /> Dev Panel
            </span>
            <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <span className="flex items-center gap-1.5 text-stone-300">
              <Turtle className="w-3.5 h-3.5" /> Slow network
            </span>
            <input
              type="checkbox"
              checked={settings.slowNetwork}
              onChange={(e) => apply({ slowNetwork: e.target.checked })}
            />
          </label>

          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <span className="flex items-center gap-1.5 text-stone-300">
              <WifiOff className="w-3.5 h-3.5" /> Offline
            </span>
            <input type="checkbox" checked={settings.offline} onChange={(e) => apply({ offline: e.target.checked })} />
          </label>

          <div>
            <div className="flex items-center justify-between text-stone-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" /> Force error rate
              </span>
              <span className="font-mono">{Math.round(settings.forceErrorRate * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.25}
              value={settings.forceErrorRate}
              onChange={(e) => apply({ forceErrorRate: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <p className="text-[10px] text-stone-500 leading-snug pt-1 border-t border-stone-700">
            Simulates API conditions client-side. Not shipped to end users.
          </p>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-full bg-stone-900 text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          title="Dev Panel"
        >
          <Bug className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
