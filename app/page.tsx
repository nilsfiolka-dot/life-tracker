'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchWellbeingLogs,
  goodHabitsCount,
  isBadHabitDay,
  logWellbeing,
  SOCIAL_MEDIA_BAD_HABIT_THRESHOLD,
  type WellbeingLogRecord,
} from './lib/wellbeingClient';
import { generateMockWellbeingLogs } from './lib/wellbeingMock';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { sportMock, uniMock, sidehustleMock } from './dashboardMock';
import CombinedTrendChart, { type TrendMetricConfig } from './components/CombinedTrendChart';
import DomainCard from './components/DomainCard';
import WellbeingRow from './components/WellbeingRow';
import { IconDumbbell, IconBook, IconBriefcase } from './components/domain-icons';
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  type TodoItem,
  type TodoDomain,
  type TodoPriority,
} from './lib/todosClient';
import TodoList from './components/TodoList';
import DomainTabs from './components/DomainTabs';
import RecommendationsPanel from './components/RecommendationsPanel';
import { generateRecommendations } from './lib/recommendations';

interface FormState {
  sleepHours: number;
  didSport: boolean;
  deepWork: boolean;
  wasCreative: boolean;
  didRead: boolean;
  socialMediaHours: number;
  mood: number;
}

const DEFAULT_FORM: FormState = {
  sleepHours: 7,
  didSport: false,
  deepWork: false,
  wasCreative: false,
  didRead: false,
  socialMediaHours: 1,
  mood: 5,
};

const DAYS_BACK = 20;

export default function WellbeingPage() {
  const [logs, setLogs] = useState<WellbeingLogRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Korrigiert: State hält das strukturierte AI-Objekt für alle 3 Domänen
  const [aiDomains, setAiDomains] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [todos, setTodos] = useState<TodoItem[]>([]);

useEffect(() => {
  void (async () => setTodos(await fetchTodos()))();
}, []);

const handleAddTodo = async (text: string, domain: TodoDomain, priority: TodoPriority) => {
  const { todo } = await createTodo(text, domain, priority);
  if (todo) setTodos((prev) => [...prev, todo]);
};

const handleToggleTodo = async (id: string, completed: boolean) => {
  setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  await updateTodo(id, { completed });
};

const handleEditTodo = async (id: string, text: string) => {
  setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  await updateTodo(id, { text });
};

const handleDeleteTodo = async (id: string) => {
  setTodos((prev) => prev.filter((t) => t.id !== id));
  await deleteTodo(id);
};

const activeDomains = useMemo(
  () => ({
    sport: aiDomains ? aiDomains.sport : sportMock,
    uni: aiDomains ? aiDomains.uni : uniMock,
    sidehustle: aiDomains ? aiDomains.sidehustle : sidehustleMock,
  }),
  [aiDomains],
);

const recommendations = useMemo(
  () => generateRecommendations(activeDomains, todos),
  [activeDomains, todos],
);

  useEffect(() => {
    const load = async () => {
      setLoadingLogs(true);
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - DAYS_BACK);
      const toKey = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const data = await fetchWellbeingLogs(toKey(start), toKey(now));
      setLogs(data.sort((a, b) => a.log_date.localeCompare(b.log_date)));
      setLoadingLogs(false);
    };
    
    const loadCachedAiInsights = async () => {
      try {
        const res = await fetch('/api/analyze');
        if (res.ok) {
          const data = await res.json();
          // Überprüfen, ob gecashte Objektdaten für die Domänen existieren
          if (data && data.sport) {
            setAiDomains(data);
          }
        }
      } catch (err) {
        console.error('Fehler beim Laden der gespeicherten KI-Insights:', err);
      }
    };

    void load();
    void loadCachedAiInsights();
  }, []);

  const isDemo = !loadingLogs && logs.length === 0;
  const displayLogs = useMemo(() => (isDemo ? generateMockWellbeingLogs(DAYS_BACK) : logs), [isDemo, logs]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage('');

    const todayLocal = new Date().toLocaleDateString('sv');

    const payload = {
      log_date: todayLocal,
      sleep_hours: form.sleepHours,
      did_sport: form.didSport,
      deep_work: form.deepWork,
      was_creative: form.wasCreative,
      did_read: form.didRead,
      social_media_hours: form.socialMediaHours,
      mood: form.mood,
    };

    const { error } = await logWellbeing(payload);
    setSaving(false);

    if (error) {
      setStatusMessage(`Fehler beim Speichern: ${error.message}`);
      return;
    }

    setLogs((prev) => {
      const withoutToday = prev.filter((entry) => entry.log_date !== todayLocal);
      return [...withoutToday, { ...payload, loggedAt: new Date().toISOString() }].sort((a, b) =>
        a.log_date.localeCompare(b.log_date),
      );
    });

    setStatusMessage(
      isSupabaseConfigured ? 'Eintrag gespeichert.' : 'Lokal gespeichert – Supabase ist noch nicht konfiguriert.',
    );
  };

  // Verbessert: Fängt nun den exakten Server-Error ab und gibt ihn aus
  const handleTriggerAnalysis = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        if (data && data.sport) {
          setAiDomains(data);
          alert('KI-Performance-Analyse erfolgreich aktualisiert! ✨');
        } else {
          console.error('Unerwartetes Datenformat vom Server:', data);
        }
      } else {
        // Zeigt das echte Problem im Alert-Fenster an (z.B. "Keine Logdaten im Zeitraum vorhanden")
        const errMsg = data.error || `Server meldet Status ${res.status}`;
        console.error('Fehler bei der KI-Generierung:', errMsg);
        alert(`Analyse fehlgeschlagen: ${errMsg}`);
      }
    } catch (err: any) {
      console.error('Netzwerkfehler bei KI-Analyse:', err);
      alert(`Netzwerkfehler: ${err.message || err}`);
    } finally {
      setLoadingAi(false);
    }
  };

  const trendMetrics: TrendMetricConfig[] = useMemo(
    () => [
      {
        key: 'mood',
        label: 'Mood',
        color: '#a78bfa',
        min: 1,
        max: 10,
        data: displayLogs.map((e) => ({ date: e.log_date, value: e.mood })),
      },
      {
        key: 'sleep',
        label: 'Schlaf',
        color: '#38bdf8',
        unit: 'h',
        min: 0,
        max: 10,
        data: displayLogs.map((e) => ({ date: e.log_date, value: e.sleep_hours })),
      },
      {
        key: 'habits',
        label: 'Gute Habits',
        color: '#22c55e',
        min: 0,
        max: 4,
        data: displayLogs.map((e) => ({ date: e.log_date, value: goodHabitsCount(e) })),
      },
      {
        key: 'social',
        label: 'Social Media',
        color: '#f43f5e',
        unit: 'h',
        min: 0,
        max: 8,
        data: displayLogs.map((e) => ({ date: e.log_date, value: e.social_media_hours })),
      },
    ],
    [displayLogs],
  );

  const badHabitDays = displayLogs.filter(isBadHabitDay).length;
  const recentEntries = useMemo(
    () => [...displayLogs].sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 10),
    [displayLogs],
  );

  const isSocialMediaHigh = form.socialMediaHours > SOCIAL_MEDIA_BAD_HABIT_THRESHOLD;

  return (
    <main className="min-h-screen bg-[#0b0e14] p-4 text-slate-100 sm:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Wellbeing Tracker</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Mood, Schlaf & Habits im Blick</h1>
              <p className="mt-1 text-sm text-slate-400">
                Letzte {DAYS_BACK} Tage · {badHabitDays} Tage über {SOCIAL_MEDIA_BAD_HABIT_THRESHOLD}h Social Media
              </p>
            </div>
            
            {/* Interaktiver Steuerungs-Button für den AI Agenten */}
            <button
              onClick={handleTriggerAnalysis}
              disabled={loadingAi}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loadingAi ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Agent evaluiert...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.096.813zM18.75 5.25l-.45 2.25-.45-2.25L15.6 4.8l2.25-.45.45-2.25.45 2.25 2.25.45-2.25.45zM19.35 10.5l-.3 1.5-.3-1.5-1.5-.3 1.5-.3.3-1.5.3 1.5 1.5.3-1.5.3z" />
                  </svg>
                  Live Insights generieren
                </>
              )}
            </button>
          </div>
        </section>

        {/* Überlagerter Trend-Graph mit klickbarer Legende */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">Trends im Vergleich</h3>
          <CombinedTrendChart metrics={trendMetrics} />
        </section>

        {/* Domain-Bereiche: Schalten dynamisch auf echten Gemini-Agenten-Output um */}
        <DomainTabs
          sport={activeDomains.sport}
          uni={activeDomains.uni}
          sidehustle={activeDomains.sidehustle}
          icons={{ sport: <IconDumbbell />, uni: <IconBook />, sidehustle: <IconBriefcase /> }}
        />

        <RecommendationsPanel recommendations={recommendations} />

        <div className="grid gap-6 lg:grid-cols-2">
  <TodoList
    todos={todos}
    onAdd={handleAddTodo}
    onToggle={handleToggleTodo}
    onEdit={handleEditTodo}
    onDelete={handleDeleteTodo}
  />

  {/* Log-Formular */}
  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
    <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Heute eintragen</h2>
    <p className="mb-4 text-xs text-slate-400">Schlaf, Habits, Social-Media-Zeit und Mood für heute.</p>

    <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <span>Schlaf (Stunden)</span>
                  <span className="text-slate-200">{form.sleepHours}h</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={form.sleepHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, sleepHours: Number(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    { key: 'didSport', label: 'Sport' },
                    { key: 'deepWork', label: 'Deep Work' },
                    { key: 'wasCreative', label: 'Kreativ' },
                    { key: 'didRead', label: 'Lesen' },
                  ] as const
                ).map((habit) => (
                  <button
                    type="button"
                    key={habit.key}
                    onClick={() => setForm((prev) => ({ ...prev, [habit.key]: !prev[habit.key] }))}
                    className={`rounded-lg border px-3 py-3 text-xs font-bold uppercase tracking-wide transition-all ${
                      form[habit.key]
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {habit.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <span>Social Media (Stunden)</span>
                  <span className={isSocialMediaHigh ? 'font-semibold text-rose-300' : 'text-slate-200'}>
                    {form.socialMediaHours}h {isSocialMediaHigh ? '⚠️' : ''}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={0.5}
                  value={form.socialMediaHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, socialMediaHours: Number(e.target.value) }))}
                  className={`w-full ${isSocialMediaHigh ? 'accent-rose-500' : 'accent-cyan-500'}`}
                />
                {isSocialMediaHigh && (
                  <p className="mt-1 text-[11px] text-rose-300">
                    Über {SOCIAL_MEDIA_BAD_HABIT_THRESHOLD}h – wird als Bad Habit gezählt.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <span>Mood</span>
                  <span className="text-slate-200">{form.mood} / 10</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={form.mood}
                  onChange={(e) => setForm((prev) => ({ ...prev, mood: Number(e.target.value) }))}
                  className="w-full accent-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-cyan-500 px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 transition-colors hover:bg-cyan-600 active:bg-cyan-700 disabled:opacity-50"
              >
                {saving ? 'Wird gespeichert…' : 'Eintrag speichern'}
              </button>
            </form>

    {statusMessage && (
      <p className="mt-3 text-center text-xs font-semibold tracking-wide text-slate-300">{statusMessage}</p>
    )}
  </section>
</div>

{/* Letzte Einträge — volle Breite */}
<section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">Letzte Einträge</h3>
  <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
    {recentEntries.length > 0 ? (
      recentEntries.map((entry) => <WellbeingRow key={entry.log_date} entry={entry} />)
    ) : (
      <p className="text-sm text-slate-500">Noch keine Daten vorhanden.</p>
    )}
  </div>
</section>
        </div>
    </main>
  );
}