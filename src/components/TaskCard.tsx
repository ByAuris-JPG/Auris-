import React from 'react';
import {
  Check,
  Clock,
  Bell,
  MoreVertical,
  Volume2,
  Trash2,
  Edit2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Task } from '../types/task';
import { CATEGORIES, PRIORITIES } from '../utils/taskConstants';
import { getRelativeTimeStatus, formatFriendlyDate } from '../utils/dateHelpers';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onTriggerTestAlarm: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onSnooze,
  onTriggerTestAlarm,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const category = CATEGORIES[task.category] || CATEGORIES.work;
  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
  const relative = getRelativeTimeStatus(task.date, task.time);
  const friendlyDate = formatFriendlyDate(task.date);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtasksPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
          : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60'
      }`}
    >
      <div className="p-3.5 flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`w-6 h-6 rounded-xl mt-0.5 shrink-0 flex items-center justify-center border-2 transition-all duration-200 min-h-[44px] min-w-[44px] -m-2.5 p-2.5 ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50'
          }`}
          title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          <div
            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform ${
              task.completed ? 'scale-100' : 'scale-0'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Category */}
            <span
              className={`text-[11px] font-semibold tracking-tight ${category.color}`}
            >
              {category.label}
            </span>

            <span className="text-slate-300 dark:text-slate-700 text-xs">·</span>

            {/* Scheduled Time */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 tabular-nums">
              <Clock className="w-3 h-3 text-indigo-500" />
              <span>{task.time}</span>
              <span className="text-slate-400">({friendlyDate})</span>
            </div>

            <span className="text-slate-300 dark:text-slate-700 text-xs">·</span>

            {/* Relative Time Status */}
            <span
              className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md ${
                task.completed
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : relative.isPast
                  ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300'
              }`}
            >
              {task.completed ? 'Completada' : relative.label}
            </span>
          </div>

          {/* Title */}
          <h4
            className={`text-sm font-semibold leading-snug cursor-pointer transition-colors ${
              task.completed
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }`}
          >
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Subtasks Progress Bar if applicable */}
          {totalSubtasks > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Notification Indicators */}
          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1" title="Tono de notificación">
              <Bell className="w-3 h-3 text-indigo-500" />
              <span>
                {task.notifyOffsetMinutes === 0
                  ? 'A tiempo'
                  : `${task.notifyOffsetMinutes}m antes`}
              </span>
            </div>

            <div className="flex items-center gap-1" title="Tono de audio asignado">
              <Volume2 className="w-3 h-3 text-slate-400" />
              <span className="capitalize">{task.sound}</span>
            </div>

            {task.repeat !== 'none' && (
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <RotateCcw className="w-3 h-3" />
                <span className="capitalize">{task.repeat}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Menu Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Opciones de la tarea"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Popover Menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-9 w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onTriggerTestAlarm(task);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-2 font-medium"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Sonar alarma ahora</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onSnooze(task.id, 10);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Posponer +10 min</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Editar horario</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(task.id);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar tarea</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
