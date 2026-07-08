import Sparkline from './Sparkline';

interface StatTrendCardProps {
  label: string;
  data: { date: string; value: number }[];
  color: string;
  unit?: string;
  min?: number;
  max?: number;
  badgeText?: string;
  badgeTone?: 'warn' | 'ok';
}

export default function StatTrendCard({
  label,
  data,
  color,
  unit = '',
  min,
  max,
  badgeText,
  badgeTone = 'ok',
}: StatTrendCardProps) {
  const latest = data.length ? data[data.length - 1].value : 0;
  const avg = data.length ? Math.round((data.reduce((sum, d) => sum + d.value, 0) / data.length) * 10) / 10 : 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</span>
        {badgeText && (
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              badgeTone === 'warn' ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-white">
          {latest}
          {unit}
        </p>
        <p className="text-xs text-slate-500">
          Ø {avg}
          {unit}
        </p>
      </div>
      <div className="mt-3 h-16">
        <Sparkline data={data} color={color} min={min} max={max} />
      </div>
    </div>
  );
}
