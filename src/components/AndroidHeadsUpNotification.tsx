import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, X, BellRing } from 'lucide-react';
import { Task } from '../types/task';
import { CATEGORIES, PRIORITIES } from '../utils/taskConstants';

interface AndroidHeadsUpNotificationProps {
  task: Task | null;
  onDismiss: () => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
  onOpenTask: (task: Task) => void;
  durationSeconds?: number;
}

export const AndroidHeadsUpNotification: React.FC<AndroidHeadsUpNotificationProps> = ({
  task,
  onDismiss,
  onComplete,
  onSnooze,
  onOpenTask,
  durationSeconds = 12,
}) => {
  const [timeLeftPercent, setTimeLeftPercent] = useState(100);

  useEffect(() => {
    if (!task) return;

    setTimeLeftPercent(100);
    const intervalMs = 100;
    const totalSteps = (durationSeconds * 1000) / intervalMs;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const remaining = Math.max(0, 100 - (step / totalSteps) * 100);
      setTimeLeftPercent(remaining);

      if (step >= totalSteps) {
        clearInterval(timer);
        onDismiss();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [task, durationSeconds, onDismiss]);

  if (!task) return null;

  const category = CATEGORIES[task.category] || CATEGORIES.work;
  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;

  return (
    <div className="absolute top-2 left-3 right-3 z-50 animate-in slide-in-from-top-6 duration-300 ease-out select-none">
      <div className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl shadow-slate-950/40 p-3.5 transition-all">
        {/* Top Header: App icon + "TaskDroid" · "ahora" + Close */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/40">
              <BellRing className="w-3 h-3 animate-pulse" />
            </div>
            <span className="text-[12px] font-bold tracking-tight text-slate-800 dark:text-slate-200">
              TaskDroid
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Alarma ahora
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="w-7 h-7 -mr-1 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Task Title and Details */}
        <div
          onClick={() => onOpenTask(task)}
          className="cursor-pointer group flex flex-col gap-1 pb-1"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {task.title}
            </h4>
            <span className="shrink-0 text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
              {task.time}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className={`font-medium ${category.color}`}>
              {category.label}
            </span>
            <span>·</span>
            <span className={`font-medium ${priority.color}`}>
              Prioridad {priority.label}
            </span>
            {task.subtasks.length > 0 && (
              <>
                <span>·</span>
                <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} pasos</span>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Buttons (Android Notification Action Pill buttons) */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => onComplete(task.id)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="truncate">Completar</span>
          </button>

          <button
            onClick={() => onSnooze(task.id, 5)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-all active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">+5 min</span>
          </button>

          <button
            onClick={() => onSnooze(task.id, 15)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-all active:scale-95"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate">+15 min</span>
          </button>
        </div>

        {/* Dismiss Timeout Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-indigo-500 transition-all ease-linear duration-100"
            style={{ width: `${timeLeftPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
