export type MetricDetail = {
  label: string;
  value: string;
  help?: string;
  trend?: string;
};

export type SectionData = {
  title: string;
  subtitle: string;
  scoreLabel: string;
  scoreValue: string;
  rankLabel: string;
  rankValue: string;
  metrics: MetricDetail[];
  highlight?: string;
};

export type SessionLogEntry = {
  date: string;
  category: 'Sport' | 'Uni' | 'Sidehustle' | 'Life';
  icon: string;
  status: string;
  tag: string;
  ratio: string;
  note: string;
};

export type TrackerScoreData = {
  total: number;
  max: number;
  comment: string;
  breakdown: Array<{ label: string; value: number; percentage: number; color: string }>;
};

export type LifeRankData = {
  current: string;
  peak: string;
  theme: string;
  score: number;
  progress: string;
  weeklyScore: number;
  monthlyScore: number;
  description: string;
};

export const lifeRankMock: LifeRankData = {
  current: 'Ascendant 2',
  peak: 'Immortal 1',
  theme: 'Bronze → Diamant',
  score: 691,
  progress: 'Dein Life Rank basiert auf Sport, Uni und Sidehustle.',
  weeklyScore: 720,
  monthlyScore: 685,
  description: 'Eine zusammengesetzte Bewertung, die deinen aktuellen Stand über deine drei Kernbereiche abbildet.',
};

export const sportMock: SectionData = {
  title: 'Sport',
  subtitle: 'Training, Pace & Konsistenz',
  scoreLabel: 'Life Rank Contribution',
  scoreValue: '72/100',
  rankLabel: 'Session-Woche',
  rankValue: '5 Sessions',
  metrics: [
    { label: 'Pace/Distanz-Trend', value: 'Ø 4:52 / 10km', help: 'Diese Woche +6% im Vergleich zum Vormonat', trend: '+6%' },
    { label: 'Konsistenz', value: '86%', help: 'Geplante Runs, die stattgefunden haben' },
    { label: 'Streak', value: '7 Tage', help: 'Tägliche Trainingsphase', trend: '+2' },
    { label: 'Clutch-Momente', value: '3', help: 'PRs, längste Distanz, schnellste Zeit' },
  ],
  highlight: 'Stabile Woche mit persönlichem Tempo-Rekord.',
};

export const uniMock: SectionData = {
  title: 'Uni (Master)',
  subtitle: 'Deadlines, Fokus & Abgaben',
  scoreLabel: 'Life Rank Contribution',
  scoreValue: '68/100',
  rankLabel: 'Deadline-Score',
  rankValue: '92%',
  metrics: [
    { label: 'Fokus-Stunden / Woche', value: '18.5h', help: 'Tatsächliche Lernzeit pro Woche' },
    { label: 'KAST-Äquivalent', value: '74%', help: 'Tage mit sinnvollem Uni-Beitrag' },
    { label: 'Abgaben-Streak', value: '6/6', help: 'Keine verpassten Deadlines' },
    { label: 'First Bloods', value: '4', help: 'Früh fertiggestellte Aufgaben' },
  ],
  highlight: 'Solide Fokuswoche mit hoher Deadline-Zuverlässigkeit.',
};

export const sidehustleMock: SectionData = {
  title: 'Sidehustle',
  subtitle: 'Umsatz, Output & Conversion',
  scoreLabel: 'Life Rank Contribution',
  scoreValue: '85/100',
  rankLabel: 'Revenue / Woche',
  rankValue: '425€',
  metrics: [
    { label: 'Shipped Features', value: '5', help: 'Abgeschlossene Arbeitspakete' },
    { label: 'Time Invested', value: '22h', help: 'Arbeitszeit dieser Woche' },
    { label: 'Conversion-Rate', value: '37%', help: 'Leads → Kunden / Ideen → Umsetzung' },
    { label: 'Aces', value: '2', help: 'Große Meilensteine erreicht' },
  ],
  highlight: 'Starker Monat mit ersten wiederkehrenden Einnahmen.',
};

export const trackerScoreMock: TrackerScoreData = {
  total: 691,
  max: 1000,
  comment: 'Dein Composite-Score setzt sich aus Sport, Uni und Sidehustle zusammen.',
  breakdown: [
    { label: 'Sport', value: 72, percentage: 26, color: 'from-cyan-500 to-cyan-400' },
    { label: 'Uni', value: 68, percentage: 24, color: 'from-violet-500 to-violet-400' },
    { label: 'Sidehustle', value: 85, percentage: 31, color: 'from-emerald-500 to-emerald-400' },
    { label: 'Reserve', value: 50, percentage: 19, color: 'from-slate-500 to-slate-400' },
  ],
};

export const sessionLogMock: SessionLogEntry[] = [
  { date: 'Jul 7', category: 'Sport', icon: '🏃', status: 'Erledigt', tag: 'MVP', ratio: '5.8 / 1.2', note: 'Langer Lauf, Pace verbessert' },
  { date: 'Jul 6', category: 'Uni', icon: '🎓', status: 'Erledigt', tag: 'Clutch', ratio: '4.5 / 0.8', note: 'Seminar + Deadline-Review' },
  { date: 'Jul 5', category: 'Sidehustle', icon: '💼', status: 'Erledigt', tag: 'Ace', ratio: '3.0 / 0.5', note: 'Erster Kunde angefragt' },
  { date: 'Jul 4', category: 'Sport', icon: '🏃', status: 'Geplant', tag: '0 W', ratio: '2.5 / 1.4', note: 'Regeneration + Technik' },
  { date: 'Jul 3', category: 'Uni', icon: '🎓', status: 'Erledigt', tag: 'First Blood', ratio: '6.0 / 1.0', note: 'Projektarbeit gestartet' },
];
