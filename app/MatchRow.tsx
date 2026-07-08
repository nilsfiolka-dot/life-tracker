import type { DailyLogRecord } from '../src/lib/supabaseClient';

function scoreOf(entry: DailyLogRecord) {
  return (entry.survive ? 300 : 0) + (entry.assist ? 200 : 0) + (entry.kill ? 500 : entry.trade ? 250 : 0);
}

function resultColor(score: number) {
  if (score >= 800) return '#22c55e'; // Top-Tag
  if (score >= 500) return '#38bdf8'; // solide
  if (score >= 250) return '#f2c94c'; // okay
  return '#64748b'; // Ruhetag / nichts erfasst
}

export default function MatchRow({ entry }: { entry: DailyLogRecord }) {
  const score = scoreOf(entry);
  const color = resultColor(score);
  const badges: { key: string; on: boolean; label: string }[] = [
    { key: 'S', on: entry.survive, label: 'Survive' },
    { key: 'A', on: entry.assist, label: 'Assist' },
    { key: 'K', on: entry.kill, label: 'Kill' },
    { key: 'T', on: entry.trade, label: 'Trade' },
  ];

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div>
        <p className="text-sm font-semibold text-slate-100">{entry.log_date}</p>
        <div className="mt-1 flex gap-1.5">
          {badges.map((b) => (
            <span
              key={b.key}
              title={b.label}
              className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                b.on ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-slate-600'
              }`}
            >
              {b.key}
            </span>
          ))}
        </div>
      </div>
      <p className="text-lg font-bold" style={{ color }}>
        {score}
      </p>
    </div>
  );
}
