import type { ReactNode } from 'react';
import type { DomainMock } from '../dashboardMock';

interface DomainCardProps {
  domain: DomainMock;
  icon: ReactNode;
  badgeClass: string;
}

export default function DomainCard({ domain, icon, badgeClass }: DomainCardProps) {
  return (
    <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ color: domain.accent, backgroundColor: `${domain.accent}1a` }}
          >
            {icon}
          </span>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{domain.title}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${badgeClass}`}>
          {domain.scoreLabel}
        </div>
      </div>
      <p className="text-sm text-slate-400">{domain.subtitle}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {domain.metrics.map((metric) => (
          <div key={metric.label} className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: domain.accent }} />
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
              {metric.trend ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                  {metric.trend}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-lg font-semibold text-white">{metric.value}</p>
            {metric.help ? <p className="mt-2 text-xs text-slate-500">{metric.help}</p> : null}
          </div>
        ))}
      </div>
      <div
        className="mt-6 rounded-3xl border p-4 text-sm text-slate-300"
        style={{ borderColor: `${domain.accent}33`, backgroundColor: `${domain.accent}0d` }}
      >
        {domain.highlight}
      </div>
    </div>
  );
}
