/**
 * Utility helpers for dates, times, and schedule calculations
 */

export function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeToHM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getTodayYMD(): string {
  return formatDateToYMD(new Date());
}

export function getTomorrowYMD(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateToYMD(d);
}

export function parseTaskDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Returns user-friendly human Spanish date string
 */
export function formatFriendlyDate(dateStr: string): string {
  const today = getTodayYMD();
  const tomorrow = getTomorrowYMD();

  if (dateStr === today) return 'Hoy';
  if (dateStr === tomorrow) return 'Mañana';

  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  return d.toLocaleDateString('es-ES', options);
}

/**
 * Human-readable relative time until task
 */
export function getRelativeTimeStatus(dateStr: string, timeStr: string): { label: string; isPast: boolean; diffMinutes: number } {
  const taskTime = parseTaskDateTime(dateStr, timeStr);
  const now = new Date();
  const diffMs = taskTime.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 1) {
    return { label: 'Ahora mismo', isPast: false, diffMinutes: 0 };
  }

  if (diffMinutes > 0) {
    if (diffMinutes < 60) {
      return { label: `En ${diffMinutes} min`, isPast: false, diffMinutes };
    }
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours < 24) {
      return { label: `En ${hours}h ${mins > 0 ? `${mins}m` : ''}`, isPast: false, diffMinutes };
    }
    const days = Math.floor(hours / 24);
    return { label: `En ${days} día${days > 1 ? 's' : ''}`, isPast: false, diffMinutes };
  } else {
    const pastMins = Math.abs(diffMinutes);
    if (pastMins < 60) {
      return { label: `Hace ${pastMins} min`, isPast: true, diffMinutes };
    }
    const pastHours = Math.floor(pastMins / 60);
    if (pastHours < 24) {
      return { label: `Hace ${pastHours}h`, isPast: true, diffMinutes };
    }
    return { label: 'Vencida', isPast: true, diffMinutes };
  }
}

/**
 * Categorizes a task into time of day: 'morning' | 'afternoon' | 'evening'
 */
export function getTimeSlot(timeStr: string): 'morning' | 'afternoon' | 'evening' {
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 19) return 'afternoon';
  return 'evening';
}
