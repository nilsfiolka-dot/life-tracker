import type { Recommendation } from '../lib/recommendations';

const TONE_CLASS: Record<Recommendation['tone'], string> = {
  high: 'border-rose-500/40 bg-rose-500/5 text-rose-200',
  medium: 'border-amber-500/40 bg-amber-500/5 text-amber-200',
  low: 'border-slate-700 bg-slate-950 text-slate-400',
};

export default function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-300">Nächste Schritte</h3>
      <p className="mb-4 text-xs text-slate-500">Priorisierte KI-Empfehlungen, basierend auf Daten & To-Dos.</p>
      <div className="flex flex-col gap-2">
        {recommendations.map((rec, index) => (
          <div key={rec.id} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${TONE_CLASS[rec.tone]}`}>
            <span className="mt-0.5 text-xs font-bold text-slate-500">{index + 1}.</span>
            <div className="flex-1">
              <p>{rec.text}</p>
              <span className="mt-1 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {rec.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}