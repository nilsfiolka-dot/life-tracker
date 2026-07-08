import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export interface WellbeingLogPayload {
  log_date: string;
  sleep_hours: number;
  did_sport: boolean;
  deep_work: boolean;
  was_creative: boolean;
  did_read: boolean;
  social_media_hours: number;
  mood: number; // 1–10
}

export type WellbeingLogRecord = WellbeingLogPayload & { loggedAt?: string };

const STORAGE_KEY = 'life-tracker-local-wellbeing-logs';

export const SOCIAL_MEDIA_BAD_HABIT_THRESHOLD = 3;

export function goodHabitsCount(entry: WellbeingLogRecord): number {
  return [entry.did_sport, entry.deep_work, entry.was_creative, entry.did_read].filter(Boolean).length;
}

export function isBadHabitDay(entry: WellbeingLogRecord): boolean {
  return entry.social_media_hours > SOCIAL_MEDIA_BAD_HABIT_THRESHOLD;
}

export const logWellbeing = async (payload: WellbeingLogPayload) => {
  if (!isSupabaseConfigured) {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as WellbeingLogRecord[];
      const withoutToday = existing.filter((entry) => entry.log_date !== payload.log_date);
      withoutToday.push({ ...payload, loggedAt: new Date().toISOString() });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutToday));
    }
    return { data: null, error: null };
  }

  return supabase.from('wellbeing_logs').upsert(payload, { onConflict: 'log_date' });
};

export const fetchWellbeingLogs = async (start?: string, end?: string) => {
  if (!isSupabaseConfigured) {
    if (typeof window === 'undefined') return [] as WellbeingLogRecord[];
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as WellbeingLogRecord[];
    if (!start || !end) return stored;
    return stored.filter((entry) => entry.log_date >= start && entry.log_date <= end);
  }

  let query = supabase.from('wellbeing_logs').select('*').order('log_date');
  if (start) query = query.gte('log_date', start);
  if (end) query = query.lte('log_date', end);

  const { data, error } = await query;
  if (error) return [] as WellbeingLogRecord[];
  return (data ?? []) as WellbeingLogRecord[];
};
