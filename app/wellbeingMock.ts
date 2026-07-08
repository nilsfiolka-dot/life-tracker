import type { WellbeingLogRecord } from './wellbeingClient';

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function generateMockWellbeingLogs(daysBack = 20): WellbeingLogRecord[] {
  const rand = seededRandom(7);
  const logs: WellbeingLogRecord[] = [];
  const now = new Date();

  for (let i = daysBack; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    if (rand() < 0.1) continue; // vereinzelte Lücken, wie im echten Leben

    const log_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

    const sleep_hours = Math.round((5.5 + rand() * 3) * 10) / 10;
    const did_sport = rand() > 0.45;
    const deep_work = rand() > 0.35;
    const was_creative = rand() > 0.55;
    const did_read = rand() > 0.5;
    const social_media_hours = Math.round((0.5 + rand() * 4.5) * 10) / 10;

    const goodHabits = [did_sport, deep_work, was_creative, did_read].filter(Boolean).length;
    const moodBase =
      4 + goodHabits * 1.1 + (sleep_hours - 6) * 0.5 - Math.max(0, social_media_hours - 3) * 0.6;
    const mood = Math.min(10, Math.max(1, Math.round(moodBase + (rand() - 0.5) * 2)));

    logs.push({
      log_date,
      sleep_hours,
      did_sport,
      deep_work,
      was_creative,
      did_read,
      social_media_hours,
      mood,
      loggedAt: date.toISOString(),
    });
  }

  return logs;
}
