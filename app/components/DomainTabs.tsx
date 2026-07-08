'use client';

import { useState, type ReactNode } from 'react';
import DomainCard from './DomainCard';
import type { DomainMock } from '../dashboardMock';

type DomainKey = 'sport' | 'uni' | 'sidehustle';

interface DomainTabsProps {
  sport: DomainMock;
  uni: DomainMock;
  sidehustle: DomainMock;
  icons: Record<DomainKey, ReactNode>;
}

const TAB_CONFIG: { key: DomainKey; label: string; activeClass: string; badgeClass: string }[] = [
  { key: 'sport', label: 'Sport', activeClass: 'border-orange-500 text-orange-300 bg-orange-500/10', badgeClass: 'bg-orange-500/10 text-orange-300' },
  { key: 'uni', label: 'Uni', activeClass: 'border-violet-500 text-violet-300 bg-violet-500/10', badgeClass: 'bg-violet-500/10 text-violet-300' },
  { key: 'sidehustle', label: 'Side Hustle', activeClass: 'border-emerald-500 text-emerald-300 bg-emerald-500/10', badgeClass: 'bg-emerald-500/10 text-emerald-300' },
];

export default function DomainTabs({ sport, uni, sidehustle, icons }: DomainTabsProps) {
  const [active, setActive] = useState<DomainKey>('sport');
  const domainData: Record<DomainKey, DomainMock> = { sport, uni, sidehustle };
  const activeConfig = TAB_CONFIG.find((t) => t.key === active)!;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-xl">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              active === tab.key ? tab.activeClass : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DomainCard domain={domainData[active]} icon={icons[active]} badgeClass={activeConfig.badgeClass} />
    </section>
  );
}