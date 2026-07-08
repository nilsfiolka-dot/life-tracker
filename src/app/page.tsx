'use client';

import { type FormEvent, useState } from 'react';
import { isSupabaseConfigured, logDailyMatch } from '../lib/supabaseClient';
import {
  lifeRankMock,
  sportMock,
  uniMock,
  sidehustleMock,
  trackerScoreMock,
  sessionLogMock,
  type SessionLogEntry,
} from '../lib/dashboardMock';

type HabitState = {
  survive: boolean;
  assist: boolean;
  kill: boolean;
  trade: boolean;
};

type HabitConfig = {
  id: keyof HabitState;
  label: string;
  desc: string;
};

const renderMetric = (metric: { label: string; value: string; help?: string; trend?: string }) => (
  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
      {metric.trend ? (
        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">{metric.trend}</span>
      ) : null}
    </div>
    <p className="mt-3 text-lg font-semibold text-white">{metric.value}</p>
    {metric.help ? <p className="mt-2 text-xs text-slate-500">{metric.help}</p> : null}
  </div>
);

const formatScore = (value: number) => `${value}/1000`;

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitState>({
    survive: false,
    assist: false,
    kill: false,
    trade: false,
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>(sessionLogMock);

  const handleCheckboxChange = (type: keyof HabitState) => {
    setHabits((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    const todayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date());
    const todayLocal = new Date().toLocaleDateString('sv');

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
      return;
    }

    setSessionLog((prev) => [
      {
        date: todayLabel,
        category: 'Life',
        icon: '⚡',
        status: 'Erledigt',
        tag: 'MVP',
        ratio: '5 / 1',
        note: 'Tageslog hinzugefügt',
      },
      ...prev.slice(0, 4),
    ]);

    setHabits({ survive: false, assist: false, kill: false, trade: false });
    setStatusMessage(
      !isSupabaseConfigured
        ? '📝 Match performance saved locally. Configure Supabase to sync to your database.'
        : '🎯 Match performance successfully logged!'
    );
  };

  const habitConfig: HabitConfig[] = [
    { id: 'survive', label: 'Survive (S)', desc: 'Hit sleep & hydration baseline (+300)' },
    { id: 'assist', label: 'Assist (A)', desc: 'Prepped and set up for tomorrow (+200)' },
    { id: 'kill', label: 'Kill (K)', desc: 'Executed major workout/hustle task (+500)' },
    { id: 'trade', label: 'Trade (T)', desc: 'Saved a bad day with a fast pivot (+250)' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8 shadow-xl">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Life Rank</p>
                <h1 className="text-4xl font-semibold tracking-tight text-white">{lifeRankMock.current}</h1>
                <p className="max-w-xl text-sm text-slate-400">{lifeRankMock.description}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Peak Rating</p>
                <p className="mt-2 text-2xl font-bold text-cyan-300">{lifeRankMock.peak}</p>
                <p className="mt-1 text-xs text-slate-500">Best ever Woche</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-gradient-to-br from-cyan-500/15 to-slate-900 border border-cyan-500/20 p-5 shadow-inner">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Composite Score</p>
                <p className="mt-3 text-4xl font-semibold text-white">{formatScore(lifeRankMock.score)}</p>
                <p className="mt-2 text-sm text-slate-500">{lifeRankMock.progress}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Trend</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-white">
                  <div>
                    <p className="text-3xl font-semibold">{lifeRankMock.weeklyScore}</p>
                    <p className="text-xs text-slate-500">Woche</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-semibold">{lifeRankMock.monthlyScore}</p>
                    <p className="text-xs text-slate-500">Monat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tracker Score</p>
              <p className="mt-4 text-5xl font-semibold text-white">{trackerScoreMock.total}<span className="text-slate-500">/{trackerScoreMock.max}</span></p>
              <p className="mt-3 text-sm text-slate-500">{trackerScoreMock.comment}</p>
              <div className="mt-6 space-y-3">
                {trackerScoreMock.breakdown.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Top Card</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Life Rank Theme</p>
                  <p className="mt-3 text-xl font-semibold text-white">{lifeRankMock.theme}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Peak</p>
                  <p className="mt-3 text-xl font-semibold text-white">{lifeRankMock.peak}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sport</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{sportMock.title}</h2>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  {sportMock.scoreLabel}
                </div>
              </div>
              <p className="text-sm text-slate-400">{sportMock.subtitle}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {sportMock.metrics.map((metric) => renderMetric(metric))}
              </div>
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                {sportMock.highlight}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Uni (Master)</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{uniMock.title}</h2>
                </div>
                <div className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
                  {uniMock.scoreLabel}
                </div>
              </div>
              <p className="text-sm text-slate-400">{uniMock.subtitle}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {uniMock.metrics.map((metric) => renderMetric(metric))}
              </div>
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                {uniMock.highlight}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sidehustle</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{sidehustleMock.title}</h2>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  {sidehustleMock.scoreLabel}
                </div>
              </div>
              <p className="text-sm text-slate-400">{sidehustleMock.subtitle}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {sidehustleMock.metrics.map((metric) => renderMetric(metric))}
              </div>
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                {sidehustleMock.highlight}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tracker Score</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{trackerScoreMock.total}<span className="text-slate-500">/{trackerScoreMock.max}</span></h2>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">Composite</span>
              </div>
              <p className="mt-4 text-sm text-slate-400">{trackerScoreMock.comment}</p>
              <div className="mt-6 space-y-4">
                {trackerScoreMock.breakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Session Log</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Tägliche Übersicht</h3>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">Letzte 5 Tage</span>
              </div>

              <div className="space-y-3">
                {sessionLog.map((entry) => (
                  <div key={`${entry.date}-${entry.note}`} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{entry.icon}</span>
                        <span>{entry.date}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{entry.category}</span>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.status}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4 text-sm text-white">
                      <span className="font-semibold">{entry.tag}</span>
                      <span className="text-slate-400">{entry.ratio}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white">Tages-Log</h3>
              <p className="mt-2 text-sm text-slate-400">Fülle deinen täglichen Check-In aus und speichere ihn lokal oder per Supabase.</p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {habitConfig.map((habit) => (
                  <label
                    key={habit.id}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                      habits[habit.id] ? 'border-cyan-500 bg-slate-950' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={habits[habit.id]}
                      onChange={() => handleCheckboxChange(habit.id)}
                      className="h-4 w-4 accent-cyan-500"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{habit.label}</p>
                      <p className="text-xs text-slate-500">{habit.desc}</p>
                    </div>
                  </label>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-600 disabled:opacity-50"
                >
                  {loading ? 'Speichern…' : 'Logeintrag speichern'}
                </button>
              </form>
              {statusMessage ? <p className="mt-4 text-sm text-slate-300">{statusMessage}</p> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
