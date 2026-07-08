export type MetricItem = {
  label: string;
  value: string;
  help?: string;
  trend?: string;
};

export type DomainMock = {
  title: string;
  scoreLabel: string;
  subtitle: string;
  accent: string;
  metrics: MetricItem[];
  highlight: string;
};

export type SessionLogEntry = {
  date: string;
  category: string;
  icon: string;
  status: string;
  tag: string;
  ratio: string;
  note: string;
  tone: 'great' | 'good' | 'ok' | 'low';
};

export const lifeRankMock = {
  current: 'Diamond II',
  description: 'Konsistente Woche über alle Lebensbereiche hinweg – Sport, Uni und Sidehustle laufen synchron.',
  peak: 'Diamond III',
  score: 742,
  progress: '+38 Punkte seit letzter Woche',
  weeklyScore: 742,
  monthlyScore: 2860,
  theme: 'Deep Focus Season',
};

export const trackerScoreMock = {
  total: 742,
  max: 1000,
  comment: 'Zusammengesetzt aus Sport, Uni und Sidehustle – gewichtet nach Konsistenz.',
  breakdown: [
    { label: 'Sport', value: '86%', percentage: 86, color: 'from-orange-500 to-rose-500' },
    { label: 'Uni (Master)', value: '71%', percentage: 71, color: 'from-violet-500 to-indigo-500' },
    { label: 'Sidehustle', value: '64%', percentage: 64, color: 'from-emerald-500 to-teal-500' },
  ],
};

export const sportMock: DomainMock = {
  title: 'Trainingsblock Woche 14',
  scoreLabel: '86 / 100',
  subtitle: '5 von 6 geplanten Einheiten absolviert, Regeneration im grünen Bereich.',
  accent: '#f97316',
  metrics: [
    { label: 'Einheiten', value: '5 / 6', trend: '+1' },
    { label: 'Volumen', value: '18.400 kg', help: 'Gesamtlast diese Woche' },
    { label: 'Ruhepuls', value: '52 bpm', trend: '-2' },
    { label: 'Schlaf Ø', value: '7h 20m', help: 'Letzte 7 Nächte' },
  ],
  highlight: 'Beinpressen-PR geknackt: 180kg x 5 – stärkste Session seit 3 Monaten.',
};

export const uniMock: DomainMock = {
  title: 'Masterarbeit – Kapitel 3',
  scoreLabel: '71 / 100',
  subtitle: 'Literaturrecherche abgeschlossen, Methodikteil in Arbeit.',
  accent: '#8b5cf6',
  metrics: [
    { label: 'Deep Work', value: '11h 30m', help: 'Diese Woche' },
    { label: 'Kapitel', value: '3 / 6', trend: '+1' },
    { label: 'Quellen', value: '42 erfasst' },
    { label: 'Abgabe in', value: '46 Tagen' },
  ],
  highlight: 'Betreuer-Feedback zu Kapitel 2 eingearbeitet – grünes Licht für Kapitel 3.',
};

export const sidehustleMock: DomainMock = {
  title: 'Client-Projekte',
  scoreLabel: '64 / 100',
  subtitle: '2 aktive Projekte, ein Abschluss diese Woche.',
  accent: '#10b981',
  metrics: [
    { label: 'Umsatz MTD', value: '1.240 €', trend: '+180 €' },
    { label: 'Aktive Projekte', value: '2' },
    { label: 'Neue Leads', value: '4' },
    { label: 'Rechnungen offen', value: '1' },
  ],
  highlight: 'Landingpage-Projekt für Kunde B abgeschlossen und Rechnung gestellt.',
};

export const sessionLogMock: SessionLogEntry[] = [
  { date: 'Jul 6', category: 'Sport', icon: '🏋️', status: 'Erledigt', tag: 'Push Day', ratio: '5 / 5', note: 'Alle Sätze im Zielbereich.', tone: 'great' },
  { date: 'Jul 5', category: 'Uni', icon: '📚', status: 'Erledigt', tag: 'Kapitel 3', ratio: '3h / 3h', note: 'Methodik-Entwurf fertig.', tone: 'good' },
  { date: 'Jul 4', category: 'Sidehustle', icon: '💼', status: 'Teilweise', tag: 'Client B', ratio: '2 / 3', note: 'Review verschoben auf morgen.', tone: 'ok' },
  { date: 'Jul 3', category: 'Sport', icon: '🏋️', status: 'Verpasst', tag: 'Cardio', ratio: '0 / 1', note: 'Ausgefallen wegen Termin.', tone: 'low' },
  { date: 'Jul 2', category: 'Uni', icon: '📚', status: 'Erledigt', tag: 'Quellenarbeit', ratio: '2h / 2h', note: '8 neue Quellen erfasst.', tone: 'good' },
];
