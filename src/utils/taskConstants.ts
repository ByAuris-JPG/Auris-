import { Category, Priority, SoundType, Task } from '../types/task';
import { getTodayYMD, formatTimeToHM } from './dateHelpers';

export interface CategoryInfo {
  id: Category;
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
  borderDark: string;
  iconName: string;
}

export const CATEGORIES: Record<Category, CategoryInfo> = {
  work: {
    id: 'work',
    label: 'Trabajo',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderLight: 'border-indigo-200 dark:border-indigo-900/50',
    borderDark: 'dark:border-indigo-800',
    iconName: 'Briefcase',
  },
  study: {
    id: 'study',
    label: 'Estudio',
    color: 'text-violet-600 dark:text-violet-400',
    bgLight: 'bg-violet-50 dark:bg-violet-950/40',
    borderLight: 'border-violet-200 dark:border-violet-900/50',
    borderDark: 'dark:border-violet-800',
    iconName: 'GraduationCap',
  },
  health: {
    id: 'health',
    label: 'Salud & Gym',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderLight: 'border-emerald-200 dark:border-emerald-900/50',
    borderDark: 'dark:border-emerald-800',
    iconName: 'Activity',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderLight: 'border-amber-200 dark:border-amber-900/50',
    borderDark: 'dark:border-amber-800',
    iconName: 'Smile',
  },
  home: {
    id: 'home',
    label: 'Hogar',
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    borderLight: 'border-rose-200 dark:border-rose-900/50',
    borderDark: 'dark:border-rose-800',
    iconName: 'Home',
  },
  finance: {
    id: 'finance',
    label: 'Finanzas',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderLight: 'border-cyan-200 dark:border-cyan-900/50',
    borderDark: 'dark:border-cyan-800',
    iconName: 'CreditCard',
  },
};

export const PRIORITIES: Record<Priority, { id: Priority; label: string; color: string; badge: string }> = {
  high: {
    id: 'high',
    label: 'Alta',
    color: 'text-rose-600 dark:text-rose-400',
    badge: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300',
  },
  medium: {
    id: 'medium',
    label: 'Media',
    color: 'text-amber-600 dark:text-amber-400',
    badge: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300',
  },
  low: {
    id: 'low',
    label: 'Baja',
    color: 'text-slate-600 dark:text-slate-400',
    badge: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
  },
};

export const SOUND_OPTIONS: { id: SoundType; label: string; desc: string }[] = [
  { id: 'chime', label: 'Android Chime', desc: 'Tono dual clásico y nítido' },
  { id: 'pulse', label: 'Pixel Pulse', desc: 'Doble pulso sutil y elegante' },
  { id: 'crystal', label: 'Crystal Bell', desc: 'Arpegio brillante y claro' },
  { id: 'zen', label: 'Zen Bowl', desc: 'Resonancia profunda y armónica' },
  { id: 'brisk', label: 'Brisk Alert', desc: 'Alerta dinámica para enfoque' },
];

export const NOTIFICATION_OFFSETS = [
  { value: 0, label: 'Al momento exacto' },
  { value: 5, label: '5 min antes' },
  { value: 10, label: '10 min antes' },
  { value: 15, label: '15 min antes' },
  { value: 30, label: '30 min antes' },
  { value: 60, label: '1 hora antes' },
];

export const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'No repetir' },
  { value: 'daily', label: 'Todos los días' },
  { value: 'weekdays', label: 'Lunes a Viernes' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensualmente' },
];

/**
 * Initial sample tasks so the user sees scheduled tasks right away,
 * including a task scheduled for 2 minutes from now so they see notifications trigger!
 */
export function generateInitialTasks(): Task[] {
  const today = getTodayYMD();
  const now = new Date();

  // Task 1: 2 minutes from right now (for quick live testing!)
  const in2Mins = new Date(now.getTime() + 2 * 60 * 1000);
  const timeIn2Mins = formatTimeToHM(in2Mins);

  // Task 2: 25 minutes from now
  const in25Mins = new Date(now.getTime() + 25 * 60 * 1000);
  const timeIn25Mins = formatTimeToHM(in25Mins);

  // Task 3: 2 hours from now
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const timeIn2Hours = formatTimeToHM(in2Hours);

  return [
    {
      id: 'task-live-demo',
      title: 'Tomar café o vaso con agua fresca',
      description: 'Recordatorio con notificación programada para cuidar la hidratación y energía.',
      date: today,
      time: timeIn2Mins,
      category: 'health',
      priority: 'high',
      repeat: 'daily',
      notifyOffsetMinutes: 0,
      sound: 'chime',
      vibrate: true,
      completed: false,
      subtasks: [
        { id: 's1', title: 'Llenar termo de 500ml', completed: true },
        { id: 's2', title: 'Estirar brazos 30 segundos', completed: false },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: 'task-sync-team',
      title: 'Revisión de avance del proyecto Android',
      description: 'Coordinar entregables, pruebas de notificaciones push y diseño Material You.',
      date: today,
      time: timeIn25Mins,
      category: 'work',
      priority: 'high',
      repeat: 'weekdays',
      notifyOffsetMinutes: 5,
      sound: 'pulse',
      vibrate: true,
      completed: false,
      subtasks: [
        { id: 's3', title: 'Revisar pendientes en backlog', completed: false },
        { id: 's4', title: 'Enviar enlace de videollamada', completed: false },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: 'task-study-react',
      title: 'Estudiar Arquitectura de Background Workers',
      description: 'Capítulo sobre sincronización de tareas en segundo plano y alarmas en Android.',
      date: today,
      time: timeIn2Hours,
      category: 'study',
      priority: 'medium',
      repeat: 'none',
      notifyOffsetMinutes: 10,
      sound: 'crystal',
      vibrate: true,
      completed: false,
      subtasks: [
        { id: 's5', title: 'Leer documentación oficial', completed: false },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: 'task-personal-gym',
      title: 'Entrenamiento funcional & Cardio',
      description: 'Rutina de fuerza de 45 minutos y estiramientos.',
      date: today,
      time: '19:00',
      category: 'health',
      priority: 'medium',
      repeat: 'none',
      notifyOffsetMinutes: 15,
      sound: 'brisk',
      vibrate: true,
      completed: false,
      subtasks: [],
      createdAt: now.toISOString(),
    },
    {
      id: 'task-finance-bills',
      title: 'Verificar estado de cuenta y suscripciones',
      description: 'Confirmar pago automático de servicios del mes.',
      date: today,
      time: '20:30',
      category: 'finance',
      priority: 'low',
      repeat: 'monthly',
      notifyOffsetMinutes: 0,
      sound: 'zen',
      vibrate: false,
      completed: false,
      subtasks: [],
      createdAt: now.toISOString(),
    },
  ];
}
