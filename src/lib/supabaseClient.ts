import { createClient, SupabaseClient } from '@supabase/supabase-js';

type DailyLogPayload = {
  log_date: string;
  survive: boolean;
  assist: boolean;
  kill: boolean;
  trade: boolean;
};

export type DailyLogRecord = DailyLogPayload & {
  loggedAt?: string;
  daily_score?: number;
  tier?: string;
};

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const createFallbackSupabaseClient = () => ({
  from: () => ({
    upsert: async () => ({
      data: null,
      error: new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'),
    }),
  }),
});

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createFallbackSupabaseClient() as unknown as SupabaseClient);

export const logDailyMatch = async (payload: DailyLogPayload) => {
  if (!isSupabaseConfigured) {
    if (typeof window !== 'undefined') {
      const storageKey = 'life-tracker-local-daily-logs';
      const existing = JSON.parse(window.localStorage.getItem(storageKey) || '[]') as Array<DailyLogPayload & { loggedAt: string }>;
      existing.push({ ...payload, loggedAt: new Date().toISOString() });
      window.localStorage.setItem(storageKey, JSON.stringify(existing));
    }

    return { data: null, error: null };
  }

  return supabase.from('daily_logs').upsert(payload, { onConflict: 'log_date' });
};

export const fetchMonthlyLogs = async (monthStart?: string, monthEnd?: string) => {
  if (!isSupabaseConfigured) {
    if (typeof window === 'undefined') {
      return [] as DailyLogRecord[];
    }

    const storageKey = 'life-tracker-local-daily-logs';
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || '[]') as DailyLogRecord[];

    if (!monthStart || !monthEnd) {
      return stored;
    }

    return stored.filter((entry) => entry.log_date >= monthStart && entry.log_date <= monthEnd);
  }

  const now = new Date();
  const start = monthStart ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const end = monthEnd ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

  const { data, error } = await supabase.from('daily_logs').select('*').gte('log_date', start).lte('log_date', end).order('log_date');

  if (error) {
    return [] as DailyLogRecord[];
  }

  return (data ?? []) as DailyLogRecord[];
};

export { isSupabaseConfigured };