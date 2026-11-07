import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isAndroidView: boolean;
  onToggleView: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isAndroidView,
  onToggleView,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Switcher (allows switching between Android Device Frame and Expanded Desktop View) */}
      <aside aria-label="Selector de vista" className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="font-semibold text-slate-200">Motor de Notificaciones Android Activo</span>
          </div>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-400">Verificando alarmas cada segundo</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">Modo de pantalla:</span>
          <button
            onClick={onToggleView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isAndroidView
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Ver simulador con marco de smartphone Android"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Smartphone Android</span>
          </button>
          <button
            onClick={onToggleView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !isAndroidView
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Expandir a ancho completo responsive"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Pantalla Completa</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className={`w-full flex-1 flex justify-center items-center ${isAndroidView ? 'py-4 md:py-8 px-2' : ''}`}>
        {isAndroidView ? (
          /* Realistic Android Phone Device Enclosure */
          <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 rounded-[44px] p-3 shadow-2xl shadow-black/80 border-4 border-slate-700/80 ring-1 ring-slate-600/30 flex flex-col overflow-hidden">
            {/* Phone Speaker & Camera Punch-hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-none">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-950 ring-2 ring-slate-800/90 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-indigo-950/80"></div>
              </div>
            </div>

            {/* Android Device Status Bar */}
            <div className="h-8 w-full px-5 flex items-center justify-between text-xs font-medium text-slate-300 select-none z-30 shrink-0 bg-transparent">
              {/* Left: Clock */}
              <div className="tabular-nums font-semibold tracking-tight text-slate-200">
                {currentTimeStr}
              </div>

              {/* Right: Signal, Wifi, Battery */}
              <div className="flex items-center gap-2 text-slate-300">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span>88%</span>
                  <BatteryMedium className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Android Screen Display Inner Frame */}
            <div className="relative flex-1 w-full bg-slate-100 dark:bg-slate-950 rounded-[34px] overflow-hidden flex flex-col shadow-inner">
              {children}

              {/* Android Bottom Gesture Navigation Pill Bar */}
              <div className="h-4 w-full bg-transparent flex items-center justify-center pointer-events-none shrink-0 pb-1">
                <div className="w-32 h-1 bg-slate-400/50 dark:bg-slate-600/70 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Responsive View (for Desktop, Tablet, or Fullscreen use) */
          <main className="w-full h-full min-h-[calc(100vh-45px)] bg-slate-100 dark:bg-slate-950 flex flex-col">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
