import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarClock,
  CheckSquare,
  CalendarDays,
  BellRing,
  Plus,
  Sun,
  Moon,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { Task, NotificationLog, NotificationSettings, SoundType } from './types/task';
import { generateInitialTasks } from './utils/taskConstants';
import { getTodayYMD, formatTimeToHM } from './utils/dateHelpers';
import {
  playNotificationTone,
  triggerVibration,
  showSystemNotification,
} from './utils/audioNotification';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidHeadsUpNotification } from './components/AndroidHeadsUpNotification';
import { TimelineView } from './components/TimelineView';
import { TaskListView } from './components/TaskListView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

type NavTab = 'timeline' | 'tasks' | 'calendar' | 'notifications';

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  soundType: 'chime',
  volume: 0.85,
  vibrationEnabled: true,
  browserNotificationsEnabled: false,
  headsUpDurationSeconds: 12,
};

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskdroid_dark_mode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Switch between realistic Android smartphone enclosure vs full responsive desktop canvas
  const [isAndroidView, setIsAndroidView] = useState<boolean>(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('timeline');

  // Selected date in timeline
  const [selectedDate, setSelectedDate] = useState<string>(getTodayYMD());

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('taskdroid_tasks_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading tasks:', e);
    }
    return generateInitialTasks();
  });

  // Notification logs history
  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem('taskdroid_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading logs:', e);
    }
    return [];
  });

  // Notification settings
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('taskdroid_settings_v1');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Error loading settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Active Heads-up Android notification currently displayed
  const [activeHeadsUpTask, setActiveHeadsUpTask] = useState<Task | null>(null);

  // Sync theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('taskdroid_dark_mode', String(isDark));
  }, [isDark]);

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem('taskdroid_tasks_v1', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks:', e);
    }
  }, [tasks]);

  // Persist logs
  useEffect(() => {
    try {
      localStorage.setItem('taskdroid_logs_v1', JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save logs:', e);
    }
  }, [logs]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('taskdroid_settings_v1', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  // Ref to access current tasks & settings inside the interval without stale closures
  const stateRef = useRef({ tasks, settings, logs });
  useEffect(() => {
    stateRef.current = { tasks, settings, logs };
  }, [tasks, settings, logs]);

  // Core Notification Dispatcher
  const fireNotificationForTask = useCallback((task: Task, isTest: boolean = false) => {
    const currentSettings = stateRef.current.settings;

    // 1. Set Heads-Up banner on screen
    setActiveHeadsUpTask(task);

    // 2. Play Web Audio tone
    if (currentSettings.soundEnabled) {
      playNotificationTone(task.sound || 'chime', currentSettings.volume);
    }

    // 3. Trigger vibration if enabled
    if (currentSettings.vibrationEnabled && task.vibrate) {
      triggerVibration([150, 80, 200]);
    }

    // 4. Fire Web Push Notification
    showSystemNotification(`TaskDroid: ${task.title}`, {
      body: `Hora: ${task.time} · ${task.description || 'Recordatorio programado listo'}`,
      tag: `task-${task.id}-${Date.now()}`,
    });

    // 5. Append to notification logs
    const newLog: NotificationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId: task.id,
      taskTitle: task.title,
      taskTime: task.time,
      category: task.category,
      priority: task.priority,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setLogs((prev) => [newLog, ...prev]);

    // 6. Mark task as notified so it doesn't repeatedly fire every second
    if (!isTest) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, notifiedAt: new Date().toISOString() } : t
        )
      );
    }
  }, []);

  // Background Clock & Schedule Alarm Monitor (runs every second)
  useEffect(() => {
    const checkScheduleAlarms = () => {
      const now = new Date();
      const todayYMD = getTodayYMD();
      const currentHM = formatTimeToHM(now);
      const nowTimestamp = now.getTime();

      const { tasks: currentTasks } = stateRef.current;

      for (const task of currentTasks) {
        if (task.completed) continue;

        // Check if task is snoozed
        if (task.snoozedUntil) {
          const snoozeDate = new Date(task.snoozedUntil);
          if (nowTimestamp >= snoozeDate.getTime()) {
            // Snooze expired, fire alarm!
            fireNotificationForTask(task);
            // Clear snooze
            setTasks((prev) =>
              prev.map((t) =>
                t.id === task.id ? { ...t, snoozedUntil: undefined } : t
              )
            );
            continue;
          }
        }

        // Check normal schedule if not snoozed and not already notified
        if (!task.notifiedAt && task.date === todayYMD) {
          // Parse target notification time considering offset
          const [h, m] = task.time.split(':').map(Number);
          const taskDateObj = new Date(now);
          taskDateObj.setHours(h, m, 0, 0);

          // Subtract offset minutes
          const targetAlertTime = new Date(
            taskDateObj.getTime() - (task.notifyOffsetMinutes || 0) * 60 * 1000
          );
          const targetAlertHM = formatTimeToHM(targetAlertTime);

          // If current time matches the calculated alert minute
          if (currentHM === targetAlertHM) {
            fireNotificationForTask(task);
          }
        }
      }
    };

    const interval = setInterval(checkScheduleAlarms, 1000);
    return () => clearInterval(interval);
  }, [fireNotificationForTask]);

  // Task Actions
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            // Celebrate task completion with confetti!
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
            // If this task was currently in heads up, dismiss it
            if (activeHeadsUpTask?.id === id) {
              setActiveHeadsUpTask(null);
            }
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...taskData } : t))
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeHeadsUpTask?.id === id) {
      setActiveHeadsUpTask(null);
    }
  };

  const handleSnoozeTask = (id: string, minutes: number) => {
    const snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, snoozedUntil: snoozeDate.toISOString() } : t
      )
    );

    // Update log
    setLogs((prev) =>
      prev.map((l) => (l.taskId === id ? { ...l, actionTaken: 'snoozed' } : l))
    );

    if (activeHeadsUpTask?.id === id) {
      setActiveHeadsUpTask(null);
    }
  };

  const handleCompleteFromNotification = (taskId: string) => {
    handleToggleComplete(taskId);
    setLogs((prev) =>
      prev.map((l) => (l.taskId === taskId ? { ...l, actionTaken: 'completed' } : l))
    );
    setActiveHeadsUpTask(null);
  };

  const handleDismissNotification = () => {
    if (activeHeadsUpTask) {
      setLogs((prev) =>
        prev.map((l) =>
          l.taskId === activeHeadsUpTask.id ? { ...l, actionTaken: 'dismissed' } : l
        )
      );
    }
    setActiveHeadsUpTask(null);
  };

  // Immediate Test Notification
  const handleTriggerTestNotification = (delaySeconds: number = 0) => {
    const sampleTask: Task = {
      id: `test-${Date.now()}`,
      title: '¡Prueba de Alarma Android!',
      description: 'Esta es una notificación Heads-up generada con Web Audio API y vibración háptica.',
      date: getTodayYMD(),
      time: formatTimeToHM(new Date()),
      category: 'work',
      priority: 'high',
      repeat: 'none',
      notifyOffsetMinutes: 0,
      sound: settings.soundType,
      vibrate: settings.vibrationEnabled,
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };

    if (delaySeconds <= 0) {
      fireNotificationForTask(sampleTask, true);
    } else {
      setTimeout(() => {
        fireNotificationForTask(sampleTask, true);
      }, delaySeconds * 1000);
    }
  };

  const unreadLogsCount = logs.filter((l) => !l.read).length;

  return (
    <AndroidFrame
      isAndroidView={isAndroidView}
      onToggleView={() => setIsAndroidView(!isAndroidView)}
      unreadNotificationsCount={unreadLogsCount}
      onOpenNotifications={() => setIsNotificationCenterOpen(true)}
    >
      <div className="relative flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Android Heads-Up Push Notification Banner (Floats over top when triggered) */}
        <AndroidHeadsUpNotification
          task={activeHeadsUpTask}
          onDismiss={handleDismissNotification}
          onComplete={handleCompleteFromNotification}
          onSnooze={handleSnoozeTask}
          onOpenTask={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
            setActiveHeadsUpTask(null);
          }}
          durationSeconds={settings.headsUpDurationSeconds}
        />

        {/* Top App Bar (Android Material 3 Clean Header) */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                <span>TaskDroid</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                  Android
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Horario & Notificaciones
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick Test Alarm Trigger */}
            <button
              onClick={() => handleTriggerTestNotification(0)}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
              title="Probar notificación ahora"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Notification Center Trigger with Unread Counter */}
            <button
              onClick={() => {
                setIsNotificationCenterOpen(true);
                // Mark logs as read when opened
                setLogs((prev) => prev.map((l) => ({ ...l, read: true })));
              }}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Centro de notificaciones y alertas"
            >
              <BellRing className="w-4 h-4" />
              {unreadLogsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <div className="flex-1 overflow-y-auto pt-2">
          {activeTab === 'timeline' && (
            <TimelineView
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleComplete={handleToggleComplete}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onSnoozeTask={handleSnoozeTask}
              onTriggerTestAlarm={(task) => fireNotificationForTask(task, true)}
              onOpenCreateModal={(defaultTime) => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskListView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onSnoozeTask={handleSnoozeTask}
              onTriggerTestAlarm={(task) => fireNotificationForTask(task, true)}
              onOpenCreateModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onSnoozeTask={handleSnoozeTask}
              onTriggerTestAlarm={(task) => fireNotificationForTask(task, true)}
              onOpenCreateModal={(date) => {
                setEditingTask(null);
                if (date) setSelectedDate(date);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'notifications' && (
            <div className="px-4 py-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Panel de Notificaciones Propias
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Configura alarmas, prueba tonos y revisa el historial
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsNotificationCenterOpen(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                  >
                    Abrir Ajustes & Historial
                  </button>
                  <button
                    onClick={() => handleTriggerTestNotification(0)}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Probar Ahora
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB - Material 3 Style) */}
        <div className="absolute right-4 bottom-20 z-30 pointer-events-auto">
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="group flex items-center gap-2 h-13 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
            title="Nueva tarea con horario"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
            <span className="text-xs font-bold tracking-wide">Nueva Tarea</span>
          </button>
        </div>

        {/* Android Bottom Navigation Tab Bar (Ergonomic Thumb Hitboxes >= 48px) */}
        <nav
          aria-label="Navegación principal"
          className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-4 items-center h-16 px-1 pb-safe select-none"
        >
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors ${
              activeTab === 'timeline'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <CalendarClock className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Horario</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors ${
              activeTab === 'tasks'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Tareas</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors ${
              activeTab === 'calendar'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Calendario</span>
          </button>

          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="flex flex-col items-center justify-center h-full min-h-[48px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition-colors relative"
          >
            <div className="relative">
              <BellRing className="w-5 h-5" />
              {unreadLogsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Alertas</span>
          </button>
        </nav>

        {/* Task Creation / Edit Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          initialTask={editingTask}
        />

        {/* Notification Center & Settings Modal */}
        <NotificationCenterModal
          isOpen={isNotificationCenterOpen}
          onClose={() => setIsNotificationCenterOpen(false)}
          logs={logs}
          onClearLogs={() => setLogs([])}
          onMarkAllRead={() =>
            setLogs((prev) => prev.map((l) => ({ ...l, read: true })))
          }
          settings={settings}
          onUpdateSettings={(newVals) =>
            setSettings((prev) => ({ ...prev, ...newVals }))
          }
          onTriggerTestNotification={handleTriggerTestNotification}
        />
      </div>
    </AndroidFrame>
  );
}
