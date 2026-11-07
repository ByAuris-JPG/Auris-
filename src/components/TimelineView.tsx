import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  Plus,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import {
  getTodayYMD,
  getTomorrowYMD,
  getTimeSlot,
  formatFriendlyDate,
} from '../utils/dateHelpers';

interface TimelineViewProps {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSnoozeTask: (id: string, minutes: number) => void;
  onTriggerTestAlarm: (task: Task) => void;
  onOpenCreateModal: (defaultTime?: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onSnoozeTask,
  onTriggerTestAlarm,
  onOpenCreateModal,
}) => {
  const today = getTodayYMD();
  const tomorrow = getTomorrowYMD();

  // Filter tasks for the selected date
  const dayTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const completedCount = dayTasks.filter((t) => t.completed).length;
  const totalCount = dayTasks.length;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Next upcoming pending task for today
  const upcomingTask = dayTasks.find((t) => !t.completed);

  // Group by time slot
  const morningTasks = dayTasks.filter((t) => getTimeSlot(t.time) === 'morning');
  const afternoonTasks = dayTasks.filter((t) => getTimeSlot(t.time) === 'afternoon');
  const eveningTasks = dayTasks.filter((t) => getTimeSlot(t.time) === 'evening');

  // Days list for horizontal date selector
  const daysCarousel = React.useMemo(() => {
    const list: { ymd: string; label: string; weekday: string; dayNum: number }[] = [];
    const base = new Date();
    // 2 days before today to 5 days in future
    for (let i = -1; i <= 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' });
      list.push({
        ymd,
        label: ymd === today ? 'Hoy' : ymd === tomorrow ? 'Mañana' : weekday,
        weekday: weekday.slice(0, 3).toUpperCase(),
        dayNum: d.getDate(),
      });
    }
    return list;
  }, [today, tomorrow]);

  return (
    <div className="flex-1 flex flex-col space-y-4 pb-20">
      {/* Horizontal Date Selector Carousel */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 py-2.5 px-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {daysCarousel.map((item) => {
            const isSelected = item.ymd === selectedDate;
            const tasksOnDay = tasks.filter((t) => t.date === item.ymd);
            const hasPending = tasksOnDay.some((t) => !t.completed);

            return (
              <button
                key={item.ymd}
                onClick={() => onSelectDate(item.ymd)}
                className={`min-w-[54px] py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all min-h-[48px] ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <span
                  className={`text-[10px] font-semibold tracking-wider ${
                    isSelected ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-sm font-bold tabular-nums mt-0.5">{item.dayNum}</span>

                {/* Subtle indicator dot if tasks exist */}
                {tasksOnDay.length > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected
                        ? 'bg-white'
                        : hasPending
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Next Alert Banner */}
      <div className="px-4">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 shadow-lg shadow-indigo-950/20 border border-indigo-800/40 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-300">
                  Horario de {formatFriendlyDate(selectedDate)}
                </span>
                <span className="text-indigo-400 text-xs">·</span>
                <span className="text-xs text-indigo-200">
                  {completedCount} de {totalCount} completadas
                </span>
              </div>

              {upcomingTask ? (
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                    <BellRing className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 flex items-center gap-1.5">
                      <span>Próxima alarma a las</span>
                      <span className="font-bold text-white tabular-nums">
                        {upcomingTask.time}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white truncate max-w-[200px]">
                      {upcomingTask.title}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-1 flex items-center gap-2 text-indigo-200 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>
                    {totalCount > 0
                      ? '¡Excelente! Todas las tareas de hoy están al día'
                      : 'No hay tareas programadas para este día'}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Circular Badge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-indigo-950/60"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-indigo-400 transition-all duration-500"
                  strokeWidth="5"
                  strokeDasharray={138.2}
                  strokeDashoffset={138.2 - (138.2 * percentCompleted) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono tabular-nums">
                {percentCompleted}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Grouped Sections */}
      <div className="px-4 space-y-5">
        {/* Morning Slot */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Mañana (06:00 - 12:00)</span>
              <span className="text-slate-400 font-normal">
                ({morningTasks.length})
              </span>
            </div>
            <button
              onClick={() => onOpenCreateModal('09:00')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir</span>
            </button>
          </div>

          {morningTasks.length === 0 ? (
            <div className="py-3 px-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Sin tareas programadas para la mañana
            </div>
          ) : (
            <div className="space-y-2">
              {morningTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onSnooze={onSnoozeTask}
                  onTriggerTestAlarm={onTriggerTestAlarm}
                />
              ))}
            </div>
          )}
        </section>

        {/* Afternoon Slot */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sunset className="w-4 h-4 text-orange-500" />
              <span>Tarde (12:00 - 18:00)</span>
              <span className="text-slate-400 font-normal">
                ({afternoonTasks.length})
              </span>
            </div>
            <button
              onClick={() => onOpenCreateModal('15:00')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir</span>
            </button>
          </div>

          {afternoonTasks.length === 0 ? (
            <div className="py-3 px-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Sin tareas programadas para la tarde
            </div>
          ) : (
            <div className="space-y-2">
              {afternoonTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onSnooze={onSnoozeTask}
                  onTriggerTestAlarm={onTriggerTestAlarm}
                />
              ))}
            </div>
          )}
        </section>

        {/* Evening Slot */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Noche (18:00 - 24:00)</span>
              <span className="text-slate-400 font-normal">
                ({eveningTasks.length})
              </span>
            </div>
            <button
              onClick={() => onOpenCreateModal('20:00')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir</span>
            </button>
          </div>

          {eveningTasks.length === 0 ? (
            <div className="py-3 px-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Sin tareas programadas para la noche
            </div>
          ) : (
            <div className="space-y-2">
              {eveningTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onSnooze={onSnoozeTask}
                  onTriggerTestAlarm={onTriggerTestAlarm}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
