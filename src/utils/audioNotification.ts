import { SoundType } from '../types/task';

// Singleton AudioContext to reuse and comply with autoplay policies
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Synthesizes pristine Android-style alert sounds using Web Audio API.
 * No external mp3 files required, 100% reliable and instantaneous.
 */
export function playNotificationTone(type: SoundType = 'chime', volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'chime': {
        // Classic Android Two-Tone Gentle Chime (F5 -> A5 harmonic)
        playHarmonicNote(ctx, masterGain, 698.46, now, 0.28, 0.4);
        playHarmonicNote(ctx, masterGain, 880.00, now + 0.12, 0.45, 0.5);
        break;
      }
      case 'pulse': {
        // Pixel-style double subtle pulse
        playTone(ctx, masterGain, 523.25, 'sine', now, 0.08, 0.4);
        playTone(ctx, masterGain, 659.25, 'sine', now + 0.10, 0.14, 0.45);
        break;
      }
      case 'crystal': {
        // High-clarity arpeggio (C6, E6, G6)
        playTone(ctx, masterGain, 1046.50, 'triangle', now, 0.12, 0.35);
        playTone(ctx, masterGain, 1318.51, 'triangle', now + 0.08, 0.14, 0.35);
        playTone(ctx, masterGain, 1567.98, 'sine', now + 0.16, 0.32, 0.4);
        break;
      }
      case 'zen': {
        // Warm resonant bowl chime
        playHarmonicNote(ctx, masterGain, 440.0, now, 0.8, 0.5);
        playTone(ctx, masterGain, 880.0, 'sine', now, 0.6, 0.2);
        break;
      }
      case 'brisk': {
        // Crisp alert chime
        playTone(ctx, masterGain, 783.99, 'sine', now, 0.09, 0.4);
        playTone(ctx, masterGain, 1174.66, 'sine', now + 0.09, 0.22, 0.45);
        break;
      }
      default: {
        playHarmonicNote(ctx, masterGain, 880.0, now, 0.3, 0.4);
      }
    }
  } catch (err) {
    console.warn('Audio tone play prevented or failed:', err);
  }
}

function playTone(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  gainLevel: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  // Soft attack and natural exponential decay
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playHarmonicNote(
  ctx: AudioContext,
  destination: AudioNode,
  fundamental: number,
  startTime: number,
  duration: number,
  gainLevel: number
) {
  // Fundamental
  playTone(ctx, destination, fundamental, 'sine', startTime, duration, gainLevel);
  // Soft second harmonic
  playTone(ctx, destination, fundamental * 2, 'sine', startTime, duration * 0.7, gainLevel * 0.25);
}

/**
 * Triggers Android device vibration if supported
 */
export function triggerVibration(pattern: number | number[] = [120, 80, 160]) {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration may be blocked by permissions or not supported
  }
}

/**
 * Web Notifications API Integration
 */
export async function checkNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

export function showSystemNotification(
  title: string,
  options?: {
    body?: string;
    tag?: string;
    icon?: string;
  }
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }
  try {
    new Notification(title, {
      body: options?.body || 'Recordatorio de tarea programada',
      icon: options?.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>',
      tag: options?.tag || `task-${Date.now()}`,
    });
    return true;
  } catch (err) {
    console.warn('System notification error:', err);
    return false;
  }
}
