'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchMonthlyLogs, isSupabaseConfigured, logDailyMatch, type DailyLogRecord } from '../src/lib/supabaseClient';

// 1. Define the strictly-typed state for your KAST metrics
interface HabitState {
  survive: boolean;
  assist: boolean;
  kill: boolean;
  trade: boolean;
}

// 2. Define the structural configuration for mapping your UI elements
interface HabitConfig {
  id: keyof HabitState;
  label: string;
  desc: string;
}

export default function MatchReviewPage() {
  const [habits, setHabits] = useState<HabitState>({
    survive: false,
    assist: false,
    kill: false,
    trade: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [monthlyLogs, setMonthlyLogs] = useState<DailyLogRecord[]>([]);
  const [loadingMonth, setLoadingMonth] = useState<boolean>(true);

  const handleCheckboxChange = (type: keyof HabitState): void => {
    setHabits((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  useEffect(() => {
    const loadMonthlyLogs = async () => {
      setLoadingMonth(true);
      const now = new Date();
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
      const logs = await fetchMonthlyLogs(start, end);
      setMonthlyLogs(logs);
      setLoadingMonth(false);
    };

    void loadMonthlyLogs();
  }, []);

  // Explicitly type the form submission event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    // Formats local calendar date precisely to 'YYYY-MM-DD'
    const todayLocal: string = new Date().toLocaleDateString('sv'); 

    const { error } = await logDailyMatch({
      log_date: todayLocal,
      survive: habits.survive,
      assist: habits.assist,
      kill: habits.kill,
      trade: habits.trade,
    });

    setLoading(false);
    if (error) {
      setStatusMessage(`❌ Error logging match: ${error.message}`);
    } else {
      const nextEntry: DailyLogRecord = {
        log_date: todayLocal,
        survive: habits.survive,
        assist: habits.assist,
        kill: habits.kill,
        trade: habits.trade,
        loggedAt: new Date().toISOString(),
      };

      setMonthlyLogs((prev) => {
        const withoutToday = prev.filter((entry) => entry.log_date !== todayLocal);
        return [...withoutToday, nextEntry].sort((a, b) => a.log_date.localeCompare(b.log_date));
      });

      setHabits({ survive: false, assist: false, kill: false, trade: false });

      if (!isSupabaseConfigured) {
        setStatusMessage('📝 Match performance saved locally. Configure Supabase to sync to your database.');
      } else {
        setStatusMessage('🎯 Match performance successfully logged!');
      }
    }
  };

  const habitConfig: HabitConfig[] = [
    { id: 'survive', label: 'Survive (S)', desc: 'Hit sleep & hydration baseline (+300)' },
    { id: 'assist', label: 'Assist (A)', desc: 'Prepped and set up for tomorrow (+200)' },
    { id: 'kill', label: 'Kill (K)', desc: 'Executed major workout/hustle task (+500)' },
    { id: 'trade', label: 'Trade (T)', desc: 'Saved a bad day with a fast pivot (+250)' },
  ];

  const calculateScore = (entry: DailyLogRecord) => {
    return (entry.survive ? 300 : 0) + (entry.assist ? 200 : 0) + (entry.kill ? 500 : entry.trade ? 250 : 0);
  };

  const monthlyStats = useMemo(() => {
    const totalScore = monthlyLogs.reduce((sum, entry) => sum + calculateScore(entry), 0);
    const averageScore = monthlyLogs.length > 0 ? Math.round(totalScore / monthlyLogs.length) : 0;
    const bestDay = monthlyLogs.reduce<DailyLogRecord | null>((best, entry) => {
      if (!best) {
        return entry;
      }
      return calculateScore(entry) > calculateScore(best) ? entry : best;
    }, null);

    const sortedDates = [...monthlyLogs].sort((a, b) => a.log_date.localeCompare(b.log_date));
    let streak = 0;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (let offset = 0; offset < 31; offset += 1) {
      const checkDate = new Date(currentYear, currentMonth, today.getDate() - offset);
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const exists = sortedDates.some((entry) => entry.log_date === key);

      if (!exists) {
        break;
      }

      streak += 1;
    }

    return {
      totalScore,
      averageScore,
      bestDay,
      streak,
      loggedDays: monthlyLogs.length,
    };
  }, [monthlyLogs]);

  const monthLabel = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date());
  const monthDays = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const current = new Date(now.getFullYear(), now.getMonth(), index + 1);
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      const log = monthlyLogs.find((entry) => entry.log_date === key);
      return {
        key,
        day: current.getDate(),
        score: log ? calculateScore(log) : 0,
        hasLog: Boolean(log),
        isToday: current.toDateString() === now.toDateString(),
      };
    });
  }, [monthlyLogs]);

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Monatsübersicht</p>
              <h3 className="text-2xl font-semibold text-white">{monthLabel}</h3>
            </div>
            <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
              {loadingMonth ? 'Lädt…' : `${monthlyStats.loggedDays} Tage erfasst`}
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Gesamt</p>
              <p className="mt-2 text-2xl font-semibold text-white">{monthlyStats.totalScore}</p>
              <p className="text-xs text-slate-500">Punkte in diesem Monat</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ø/Tag</p>
              <p className="mt-2 text-2xl font-semibold text-white">{monthlyStats.averageScore}</p>
              <p className="text-xs text-slate-500">Durchschnittliche Leistung</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Streak</p>
              <p className="mt-2 text-2xl font-semibold text-white">{monthlyStats.streak} Tage</p>
              <p className="text-xs text-slate-500">Konsekutive Einträge</p>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-slate-200">Beste Leistung</p>
            {monthlyStats.bestDay ? (
              <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                <span>{monthlyStats.bestDay.log_date}</span>
                <span className="font-semibold text-cyan-300">{calculateScore(monthlyStats.bestDay)} Punkte</span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Noch keine Einträge für diesen Monat.</p>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => (
              <div
                key={day.key}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-sm ${
                  day.hasLog
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
                    : day.isToday
                      ? 'border-slate-700 bg-slate-800 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <span className="text-xs uppercase tracking-wider">{day.day}</span>
                <span className="mt-1 text-[10px]">{day.hasLog ? `${day.score}` : '—'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-bold uppercase tracking-wider text-cyan-400">Daily Match Review</h2>
          <p className="mb-6 text-xs text-slate-400">Lock in today's performance metrics.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {habitConfig.map((habit) => (
              <label
                key={habit.id}
                className={`flex items-start rounded-lg border p-4 transition-all ${
                  habits[habit.id] ? 'border-cyan-500 bg-slate-900/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={habits[habit.id]}
                  onChange={() => handleCheckboxChange(habit.id)}
                  className="mt-1 mr-4 h-4 w-4 rounded accent-cyan-500"
                />
                <div>
                  <span className="block text-sm font-semibold tracking-wide">{habit.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{habit.desc}</span>
                </div>
              </label>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-cyan-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 transition-colors hover:bg-cyan-600 active:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? 'Submitting Log...' : 'Lock In Performance'}
            </button>
          </form>

          {statusMessage && (
            <p className="mt-4 text-center text-xs font-semibold tracking-wide text-slate-300">{statusMessage}</p>
          )}
        </section>
      </div>
    </main>
  );
}