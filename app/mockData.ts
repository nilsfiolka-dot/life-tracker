import type { DailyLogRecord } from '../src/lib/supabaseClient';

// Einfacher seeded PRNG, damit die Demo-Daten bei jedem Rendern
// (und bei jedem Nutzer) gleich aussehen statt zu flackern.
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function generateMockMonthlyLogs(daysBack = 27): DailyLogRecord[] {
  const rand = seededRandom(42);
  const logs: DailyLogRecord[] = [];
  const now = new Date();

  for (let i = daysBack; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);

    // ~15% Fehltage, damit der Kalender nicht unrealistisch lückenlos wirkt
    if (rand() < 0.15) continue;

    const log_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

    const survive = rand() > 0.2;
    const assist = rand() > 0.3;
    const roll = rand();
    const kill = roll > 0.6;
    const trade = !kill && roll > 0.3;

    logs.push({ log_date, survive, assist, kill, trade, loggedAt: date.toISOString() });
  }

  return logs;
}

export const DEMO_PLAYER = {
  username: 'Playmaker#EU1',
  avatarInitials: 'PM',
};
