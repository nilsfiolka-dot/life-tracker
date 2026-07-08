import type { ReactNode } from 'react';

interface StatTileProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent: string;
  icon: ReactNode;
}

export default function StatTile({ label, value, sublabel, accent, icon }: StatTileProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: accent }} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}
