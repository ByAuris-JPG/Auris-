import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { getTodayYMD, formatFriendlyDate } from '../utils/dateHelpers';

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSnoozeTask: (id: string, minutes: number) => void;
  onTriggerTestAlarm: (task: Task) => void;
  onOpenCreateModal: (defaultDate?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onSnoozeTask,
  onTriggerTestAlarm,
  onOpenCreateModal,
}) => {
  const today = getTodayYMD();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(today);
  };

  // Build calendar matrix (Monday to Sunday)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: 0 is Sun, convert so Monday is 0
  let startingDay = firstDayOfMonth.getDay() - 1;
  if (startingDay < 0) startingDay = 6;

  const totalDays = lastDayOfMonth.getDate();

  // Days array
  const calendarCells = [];
  // Empty leading days
  for (let i = 0; i < startingDay; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    const ymd = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, ymd });
  }

  // Filter tasks for selected day
  const selectedDayTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex-1 flex flex-col space-y-4 px-4 pb-20">
      {/* Month Navigation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold capitalize text-slate-900 dark:text-white">
              {monthName}
            </h3>
            <button
              onClick={handleGoToday}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              Hoy
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400">
          <span>LUN</span>
          <span>MAR</span>
          <span>MIÉ</span>
          <span>JUE</span>
          <span>VIE</span>
          <span>SÁB</span>
          <span>DOM</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-10" />;
            }

            const isSelected = cell.ymd === selectedDate;
            const isToday = cell.ymd === today;
            const dayTasks = tasks.filter((t) => t.date === cell.ymd);
            const hasPending = dayTasks.some((t) => !t.completed);

            return (
              <button
                key={cell.ymd}
                onClick={() => setSelectedDate(cell.ymd)}
                className={`h-11 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : isToday
                    ? 'border-2 border-indigo-500 font-bold text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs tabular-nums">{cell.dayNumber}</span>

                {/* Task Dots */}
                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : hasPending
                          ? 'bg-indigo-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {dayTasks.length > 1 && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-indigo-200' : 'bg-slate-400'
                        }`}
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tareas para {formatFriendlyDate(selectedDate)}
            </span>
            <span className="text-xs text-slate-400">
              ({selectedDayTasks.length})
            </span>
          </div>

          <button
            onClick={() => onOpenCreateModal(selectedDate)}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar tarea</span>
          </button>
        </div>

        {selectedDayTasks.length === 0 ? (
          <div className="py-8 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No hay tareas programadas para este día
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayTasks.map((task) => (
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
      </div>
    </div>
  );
};
