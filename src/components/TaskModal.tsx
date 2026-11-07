import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Bell,
  Volume2,
  Vibrate,
  Repeat,
  Plus,
  Trash2,
  Check,
  Play,
  Sparkles,
} from 'lucide-react';
import { Task, Category, Priority, SoundType, Recurrence, Subtask } from '../types/task';
import {
  CATEGORIES,
  PRIORITIES,
  SOUND_OPTIONS,
  NOTIFICATION_OFFSETS,
  RECURRENCE_OPTIONS,
} from '../utils/taskConstants';
import {
  getTodayYMD,
  getTomorrowYMD,
  formatTimeToHM,
} from '../utils/dateHelpers';
import { playNotificationTone, triggerVibration } from '../utils/audioNotification';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
}) => {
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [date, setDate] = useState(initialTask?.date || getTodayYMD());
  const [time, setTime] = useState(
    initialTask?.time || formatTimeToHM(new Date(Date.now() + 15 * 60 * 1000))
  );
  const [category, setCategory] = useState<Category>(initialTask?.category || 'work');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [repeat, setRepeat] = useState<Recurrence>(initialTask?.repeat || 'none');
  const [notifyOffsetMinutes, setNotifyOffsetMinutes] = useState<number>(
    initialTask?.notifyOffsetMinutes ?? 0
  );
  const [sound, setSound] = useState<SoundType>(initialTask?.sound || 'chime');
  const [vibrate, setVibrate] = useState<boolean>(initialTask?.vibrate ?? true);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handlePreviewSound = (soundType: SoundType) => {
    playNotificationTone(soundType, 0.85);
    if (vibrate) {
      triggerVibration([100, 50, 100]);
    }
  };

  const handleQuickTimeAdjust = (minutesToAdd: number) => {
    const target = new Date(Date.now() + minutesToAdd * 60 * 1000);
    setDate(getTodayYMD());
    setTime(formatTimeToHM(target));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor escribe un título para la tarea');
      return;
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        category,
        priority,
        repeat,
        notifyOffsetMinutes,
        sound,
        vibrate,
        completed: initialTask?.completed || false,
        subtasks,
      },
      initialTask?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        role="dialog"
      >
        {/* Android Sheet Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Editar Tarea Programada' : 'Nueva Tarea con Horario'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configura horario y alertas personalizadas de Android
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título de la tarea *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="Ej. Revisión médica, Entregar informe, Estudiar..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notas o detalles (opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade instrucciones, enlaces o notas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Schedule Section: Date & Time */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Horario & Fecha Programada</span>
            </div>

            {/* Quick Time Shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Rápido:</span>
              <button
                type="button"
                onClick={() => handleQuickTimeAdjust(10)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                +10 min
              </button>
              <button
                type="button"
                onClick={() => handleQuickTimeAdjust(30)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                +30 min
              </button>
              <button
                type="button"
                onClick={() => handleQuickTimeAdjust(60)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                +1 hora
              </button>
              <button
                type="button"
                onClick={() => {
                  setDate(getTodayYMD());
                  setTime('18:00');
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Hoy 18:00
              </button>
              <button
                type="button"
                onClick={() => {
                  setDate(getTomorrowYMD());
                  setTime('09:00');
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Mañana 09:00
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Fecha
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Hora exacta (24h)
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Notification Anticipation Offset */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                <span>Anticipación de la Notificación</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {NOTIFICATION_OFFSETS.map((offset) => (
                  <button
                    key={offset.value}
                    type="button"
                    onClick={() => setNotifyOffsetMinutes(offset.value)}
                    className={`py-1.5 px-1 text-[11px] font-medium rounded-lg text-center transition-all ${
                      notifyOffsetMinutes === offset.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {offset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sound & Haptic Alert Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>Tono de Notificación Android</span>
              </div>

              <button
                type="button"
                onClick={() => handlePreviewSound(sound)}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Probar tono</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOUND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSound(opt.id);
                    playNotificationTone(opt.id, 0.7);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    sound === opt.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Vibration Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Vibración háptica Android
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Pulso de vibración al disparar alarma
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !vibrate;
                  setVibrate(nextVal);
                  if (nextVal) triggerVibration([80, 50, 80]);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  vibrate ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    vibrate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Categoría
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.values(CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl text-center border text-xs font-medium transition-all ${
                      category === cat.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nivel de Prioridad
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.values(PRIORITIES).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-2 rounded-xl text-center border text-xs font-medium transition-all ${
                      priority === p.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-slate-500" />
              <span>Repetir alarma</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {RECURRENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRepeat(opt.value as Recurrence)}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg text-center transition-all ${
                    repeat === opt.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pasos o Subtareas ({subtasks.filter((s) => s.completed).length}/{subtasks.length})</span>
              </label>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                        st.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                    >
                      {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span
                      className={`flex-1 ${
                        st.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Añadir paso a la tarea..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/80">
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (initialTask) onDelete(initialTask.id);
                onClose();
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Tarea con Alarma'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
