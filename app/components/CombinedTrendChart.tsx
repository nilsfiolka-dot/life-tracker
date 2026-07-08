'use client';

import { useState } from 'react';

export interface TrendMetricConfig {
  key: string;
  label: string;
  color: string;
  unit?: string;
  min: number;
  max: number;
  data: { date: string; value: number }[];
}

interface CombinedTrendChartProps {
  metrics: TrendMetricConfig[];
  height?: number;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}

export default function CombinedTrendChart({ metrics, height = 220 }: CombinedTrendChartProps) {
  const [visible, setVisible] = useState<Set<string>>(new Set(metrics.map((m) => m.key)));

  const toggle = (key: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const width = 100;
  const dateCount = metrics[0]?.data.length ?? 0;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-56 w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={width} y1={height * f} y2={height * f} stroke="#1e293b" strokeWidth={0.3} />
        ))}
        {metrics.map((metric) => {
          if (!visible.has(metric.key) || metric.data.length === 0) return null;
          const range = metric.max - metric.min || 1;
          const points = metric.data.map((d, i) => {
            const x = dateCount > 1 ? (i / (dateCount - 1)) * width : width / 2;
            const y = height - ((d.value - metric.min) / range) * height;
            return `${x},${y}`;
          });
          return (
            <polyline
              key={metric.key}
              points={points.join(' ')}
              fill="none"
              stroke={metric.color}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Klickbare Legende – toggelt die jeweilige Linie */}
      <div className="mt-4 flex flex-wrap gap-2">
        {metrics.map((metric) => {
          const isVisible = visible.has(metric.key);
          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => toggle(metric.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                isVisible ? 'border-slate-700 bg-slate-800/80 text-slate-100' : 'border-slate-800 bg-slate-950 text-slate-600'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isVisible ? metric.color : '#475569' }} />
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* Detail-Karten nur für aktuell sichtbare Metriken */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics
          .filter((m) => visible.has(m.key))
          .map((metric) => {
            const values = metric.data.map((d) => d.value);
            const latest = values[values.length - 1] ?? 0;
            const last7 = values.slice(-7);
            const prev7 = values.slice(-14, -7);
            const weekAvg = average(last7);
            const prevWeekAvg = average(prev7);
            const delta = Math.round((weekAvg - prevWeekAvg) * 10) / 10;
            const trendLabel = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0';

            return (
              <div key={metric.key} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: metric.color }} />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{metric.label}</p>
                </div>
                <p className="mt-2 text-xl font-bold text-white">
                  {latest}
                  {metric.unit ?? ''}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Ø Woche: {weekAvg}
                  {metric.unit ?? ''} ({trendLabel} ggü. Vorwoche)
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
