import React, { useState } from 'react';
import { Search, Filter, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Task, Category, Priority } from '../types/task';
import { CATEGORIES, PRIORITIES } from '../utils/taskConstants';
import { TaskCard } from './TaskCard';
import { getTodayYMD } from '../utils/dateHelpers';

interface TaskListViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSnoozeTask: (id: string, minutes: number) => void;
  onTriggerTestAlarm: (task: Task) => void;
  onOpenCreateModal: () => void;
}

type StatusFilter = 'all' | 'pending' | 'today' | 'completed' | 'highPriority';

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onSnoozeTask,
  onTriggerTestAlarm,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const today = getTodayYMD();

  // Filter logic
  const filteredTasks = tasks.filter((t) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q) ?? false;
      if (!matchTitle && !matchDesc) return false;
    }

    // Status filter
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (statusFilter === 'today' && t.date !== today) return false;
    if (statusFilter === 'highPriority' && t.priority !== 'high') return false;

    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    return true;
  });

  return (
    <div className="flex-1 flex flex-col space-y-4 px-4 pb-20">
      {/* Search Input Bar */}
      <div className="relative pt-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar tareas, recordatorios o notas..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5 pointer-events-none" />
      </div>

      {/* Status Segmented Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'pending'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          Pendientes ({tasks.filter((t) => !t.completed).length})
        </button>

        <button
          onClick={() => setStatusFilter('today')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'today'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          Para Hoy ({tasks.filter((t) => t.date === today && !t.completed).length})
        </button>

        <button
          onClick={() => setStatusFilter('highPriority')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'highPriority'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          Prioridad Alta
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          Completadas ({tasks.filter((t) => t.completed).length})
        </button>

        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
          }`}
        >
          Todas ({tasks.length})
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
            categoryFilter === 'all'
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Todas las categorías
        </button>

        {Object.values(CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id === categoryFilter ? 'all' : cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              categoryFilter === cat.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Mostrando {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''}
        </span>
        {(categoryFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setPriorityFilter('all');
              setStatusFilter('all');
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Restablecer filtros
          </button>
        )}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            No se encontraron tareas
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            No hay elementos que coincidan con los filtros seleccionados o el término de búsqueda.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear nueva tarea</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
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
  );
};
