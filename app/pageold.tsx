'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchMonthlyLogs,
  isSupabaseConfigured,
  logDailyMatch,
  type DailyLogRecord,
} from '../src/lib/supabaseClient';
import { generateMockMonthlyLogs, DEMO_PLAYER } from './mockData';
import { getRankForScore, getRankProgress } from './rank';
import StatTile from './StatTile';
import RankBadge from './RankBadge';
import MatchRow from './MatchRow';
import { IconTrophy, IconTarget, IconFlame, IconCalendar } from './icons';

interface HabitState {
  survive: boolean;
  assist: boolean;
  kill: boolean;
  trade: boolean;
}

interface HabitConfig {
  id: keyof HabitState;
  label: string;
  desc: string;
}

function calculateScore(entry: DailyLogRecord) {
  return (entry.survive ? 300 : 0) + (entry.assist ? 200 : 0) + (entry.kill ? 500 : entry.trade ? 250 : 0);
}

export default function MatchReviewPage() {
  const [habits, setHabits] = useState<HabitState>({
    survive: false,
    assist: false,
    kill: false,
    trade: false,
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [monthlyLogs, setMonthlyLogs] = useState<DailyLogRecord[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(true);

  const handleCheckboxChange = (type: keyof HabitState): void => {
    setHabits((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  useEffect(() => {
    const loadMonthlyLogs = async () => {
      setLoadingMonth(true);
      const now = new Date();
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
      ).padStart(2, '0')}`;
      const logs = await fetchMonthlyLogs(start, end);
      setMonthlyLogs(logs);
      setLoadingMonth(false);
    };

    void loadMonthlyLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

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
      setStatusMessage(`Fehler beim Speichern: ${error.message}`);
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
      setStatusMessage(
        isSupabaseConfigured ? 'Match gespeichert.' : 'Lokal gespeichert – Supabase ist noch nicht konfiguriert.',
      );
    }
  };

  const habitConfig: HabitConfig[] = [
    { id: 'survive', label: 'Survive', desc: 'Schlaf & Hydration Baseline (+300)' },
    { id: 'assist', label: 'Assist', desc: 'Für morgen vorbereitet (+200)' },
    { id: 'kill', label: 'Kill', desc: 'Großes Workout/Hustle erledigt (+500)' },
    { id: 'trade', label: 'Trade', desc: 'Schlechten Tag gerettet (+250)' },
  ];

  // Solange keine echten Einträge vorhanden sind, zeigen Demo-Daten das
  // volle Layout – analog zu tracker.gg, wo ein Profil nie "leer" wirkt.
  const displayLogs = useMemo(() => {
    if (!loadingMonth && monthlyLogs.length === 0) {
      return generateMockMonthlyLogs();
    }
    return monthlyLogs;
  }, [monthlyLogs, loadingMonth]);

  const isDemo = !loadingMonth && monthlyLogs.length === 0;

  const monthlyStats = useMemo(() => {
    const totalScore = displayLogs.reduce((sum, entry) => sum + calculateScore(entry), 0);
    const averageScore = displayLogs.length > 0 ? Math.round(totalScore / displayLogs.length) : 0;
    const bestDay = displayLogs.reduce<DailyLogRecord | null>((best, entry) => {
      if (!best) return entry;
      return calculateScore(entry) > calculateScore(best) ? entry : best;
    }, null);

    const sortedDates = [...displayLogs].sort((a, b) => a.log_date.localeCompare(b.log_date));
    let streak = 0;
    const today = new Date();
    for (let offset = 0; offset < 31; offset += 1) {
      const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(
        checkDate.getDate(),
      ).padStart(2, '0')}`;
      if (!sortedDates.some((entry) => entry.log_date === key)) break;
      streak += 1;
    }

    return { totalScore, averageScore, bestDay, streak, loggedDays: displayLogs.length };
  }, [displayLogs]);

  const rank = getRankForScore(monthlyStats.totalScore);
  const rankProgress = getRankProgress(monthlyStats.totalScore);

  const monthLabel = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date());

  const recentMatches = useMemo(
    () => [...displayLogs].sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 10),
    [displayLogs],
  );

  return (
    <main className="min-h-screen bg-[#0b0e14] p-4 text-slate-100 sm:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Player Header */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
            style={{ backgroundColor: rank.glow }}
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-xl font-black text-slate-200">
                {DEMO_PLAYER.avatarInitials}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{DEMO_PLAYER.username}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{monthLabel}</p>
                {isDemo && (
                  <span className="mt-1 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Demo-Daten
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <RankBadge tier={rank} />
              <div className="min-w-[160px]">
                <p className="text-sm font-bold" style={{ color: rank.color }}>
                  {rank.name}
                </p>
                {rankProgress.next ? (
                  <>
                    <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${rankProgress.progress * 100}%`, backgroundColor: rank.color }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Nächster Rang: {rankProgress.next.name}</p>
                  </>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">Höchster Rang erreicht</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stat Tiles */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Score"
            value={monthlyStats.totalScore}
            accent={rank.color}
            icon={<IconTrophy />}
            sublabel="Gesamt diesen Monat"
          />
          <StatTile
            label="Ø / Tag"
            value={monthlyStats.averageScore}
            accent="#38bdf8"
            icon={<IconTarget />}
            sublabel="Durchschnittsleistung"
          />
          <StatTile label="Streak" value={monthlyStats.streak} accent="#f2725c" icon={<IconFlame />} sublabel="Tage in Folge" />
          <StatTile
            label="Logged"
            value={monthlyStats.loggedDays}
            accent="#a78bfa"
            icon={<IconCalendar />}
            sublabel="Erfasste Tage"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Left column: heatmap + best day */}
          <section className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">Monatsverlauf</h3>
              <MonthHeatmap logs={displayLogs} />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <p className="text-sm font-semibold text-slate-200">Beste Leistung</p>
              {monthlyStats.bestDay ? (
                <div className="mt-3">
                  <MatchRow entry={monthlyStats.bestDay} />
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Noch keine Einträge für diesen Monat.</p>
              )}
            </div>
          </section>

          {/* Right column: match history + log form */}
          <section className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">Letzte Einträge</h3>
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                {recentMatches.length > 0 ? (
                  recentMatches.map((entry) => <MatchRow key={entry.log_date} entry={entry} />)
                ) : (
                  <p className="text-sm text-slate-500">Noch keine Daten vorhanden.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Heutiges Match loggen</h2>
              <p className="mb-4 text-xs text-slate-400">Trage deine heutigen KAST-Metriken ein.</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {habitConfig.map((habit) => (
                    <button
                      type="button"
                      key={habit.id}
                      onClick={() => handleCheckboxChange(habit.id)}
                      title={habit.desc}
                      className={`rounded-lg border px-3 py-3 text-left transition-all ${
                        habits[habit.id]
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-bold uppercase tracking-wide">{habit.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-cyan-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 transition-colors hover:bg-cyan-600 active:bg-cyan-700 disabled:opacity-50"
                >
                  {loading ? 'Wird gespeichert…' : 'Match eintragen'}
                </button>
              </form>

              {statusMessage && (
                <p className="mt-3 text-center text-xs font-semibold tracking-wide text-slate-300">{statusMessage}</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MonthHeatmap({ logs }: { logs: DailyLogRecord[] }) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const current = new Date(now.getFullYear(), now.getMonth(), index + 1);
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(
      current.getDate(),
    ).padStart(2, '0')}`;
    const log = logs.find((entry) => entry.log_date === key);
    return {
      key,
      day: current.getDate(),
      score: log ? calculateScore(log) : 0,
      hasLog: Boolean(log),
      isToday: current.toDateString() === now.toDateString(),
    };
  });

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
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
  );
}
