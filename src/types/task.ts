export type Priority = 'high' | 'medium' | 'low';

export type Category = 'work' | 'study' | 'health' | 'personal' | 'home' | 'finance';

export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export type SoundType = 'chime' | 'pulse' | 'crystal' | 'zen' | 'brisk';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  category: Category;
  priority: Priority;
  repeat: Recurrence;
  notifyOffsetMinutes: number; // 0 = at time, 5 = 5m before, 15 = 15m before, etc.
  sound: SoundType;
  vibrate: boolean;
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  notifiedAt?: string;
  snoozedUntil?: string; // ISO string
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  taskId: string;
  taskTitle: string;
  taskTime: string;
  category: Category;
  priority: Priority;
  timestamp: string; // ISO string
  read: boolean;
  actionTaken?: 'completed' | 'snoozed' | 'dismissed';
}

export interface NotificationSettings {
  soundEnabled: boolean;
  soundType: SoundType;
  volume: number; // 0 to 1
  vibrationEnabled: boolean;
  browserNotificationsEnabled: boolean;
  headsUpDurationSeconds: number;
}
