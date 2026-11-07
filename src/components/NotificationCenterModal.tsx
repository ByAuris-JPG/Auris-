import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  Volume2,
  VolumeX,
  Vibrate,
  Play,
  CheckCircle2,
  Clock,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { NotificationLog, NotificationSettings, SoundType } from '../types/task';
import { SOUND_OPTIONS } from '../utils/taskConstants';
import {
  playNotificationTone,
  triggerVibration,
  checkNotificationPermission,
  requestNotificationPermission,
} from '../utils/audioNotification';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: NotificationLog[];
  onClearLogs: () => void;
  onMarkAllRead: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: Partial<NotificationSettings>) => void;
  onTriggerTestNotification: (delaySeconds?: number) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onMarkAllRead,
  settings,
  onUpdateSettings,
  onTriggerTestNotification,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testCountdown, setTestCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkNotificationPermission().then(setPermission);
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    onUpdateSettings({ browserNotificationsEnabled: result === 'granted' });
  };

  const handleTestNow = () => {
    onTriggerTestNotification(0);
  };

  const handleTestDelayed = (seconds: number) => {
    setTestCountdown(seconds);
    const interval = setInterval(() => {
      setTestCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onTriggerTestNotification(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTestTone = (tone: SoundType) => {
    playNotificationTone(tone, settings.volume);
    if (settings.vibrationEnabled) {
      triggerVibration([100, 50, 100]);
    }
  };

  if (!isOpen) return null;

  const unreadCount = logs.filter((l) => !l.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Centro de Notificaciones & Alertas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistema propio de avisos programados Android
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Quick Simulation & Test Buttons */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/80 dark:border-indigo-900/50">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Simulador de Alerta Inmediata</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              Dispara una notificación emergente Heads-up estilo Android con sonido sintetizado Web Audio y vibración para probar cómo reacciona la app.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTestNow}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Probar Notificación Ahora</span>
              </button>

              <button
                onClick={() => handleTestDelayed(5)}
                disabled={testCountdown !== null}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-800 dark:text-slate-200 text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {testCountdown !== null
                    ? `Disparando en ${testCountdown}s...`
                    : 'Probar en 5 segundos'}
                </span>
              </button>
            </div>
          </div>

          {/* Browser System Notifications Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notificaciones del Sistema (Web Push)
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  permission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : permission === 'denied'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {permission === 'granted'
                  ? 'Permitidas'
                  : permission === 'denied'
                  ? 'Bloqueadas en navegador'
                  : 'Sin conceder'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2.5">
              Permite recibir avisos fuera de la pestaña cuando tengas la app en segundo plano.
            </p>

            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Conceder Permiso al Navegador
              </button>
            )}
          </div>

          {/* Sound & Tone Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>Tonos de Notificación Propios</span>
              </div>

              <button
                onClick={() =>
                  onUpdateSettings({ soundEnabled: !settings.soundEnabled })
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  settings.soundEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {settings.soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Sonido Activo</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Silenciado</span>
                  </>
                )}
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500">Volumen</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) =>
                  onUpdateSettings({ volume: parseFloat(e.target.value) })
                }
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400 w-10 text-right">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>

            {/* List of tones to test */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOUND_OPTIONS.map((tone) => (
                <div
                  key={tone.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {tone.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {tone.desc}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestTone(tone.id)}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    title={`Reproducir ${tone.label}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>

            {/* Vibration Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Vibración háptica al recibir aviso
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !settings.vibrationEnabled;
                  onUpdateSettings({ vibrationEnabled: nextVal });
                  if (nextVal) triggerVibration([80, 50, 80]);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.vibrationEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* History / Log Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Historial de Notificaciones Disparadas
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>

              {logs.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Marcar leídas
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={onClearLogs}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpiar</span>
                  </button>
                </div>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <BellRing className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No hay notificaciones en el historial todavía</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Las alertas automáticas y pruebas aparecerán registradas aquí
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {logs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                        !log.read
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-indigo-500" />
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {log.taskTitle}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span>Hora programada: {log.taskTime}</span>
                            <span>·</span>
                            <span>Disparada a las {timeFormatted}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-[11px]">
                        {log.actionTaken === 'completed' && (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Hecha
                          </span>
                        )}
                        {log.actionTaken === 'snoozed' && (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Pospuesta
                          </span>
                        )}
                        {(!log.actionTaken || log.actionTaken === 'dismissed') && (
                          <span className="text-slate-400">Notificada</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
