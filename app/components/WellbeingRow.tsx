import { goodHabitsCount, isBadHabitDay, type WellbeingLogRecord } from '../lib/wellbeingClient';

const MOOD_EMOJI = ['😞', '😕', '😐', '🙂', '😄'];

function moodEmoji(mood: number) {
  const idx = Math.min(MOOD_EMOJI.length - 1, Math.max(0, Math.round((mood / 10) * (MOOD_EMOJI.length - 1))));
  return MOOD_EMOJI[idx];
}

export default function WellbeingRow({ entry }: { entry: WellbeingLogRecord }) {
  const habits = goodHabitsCount(entry);
  const badHabit = isBadHabitDay(entry);
  const badges: { key: string; on: boolean; label: string }[] = [
    { key: 'Sport', on: entry.did_sport, label: 'Sport' },
    { key: 'Deep Work', on: entry.deep_work, label: 'Deep Work' },
    { key: 'Kreativ', on: entry.was_creative, label: 'Kreativ' },
    { key: 'Lesen', on: entry.did_read, label: 'Lesen' },
  ];

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
      style={{ borderLeft: `3px solid ${badHabit ? '#f43f5e' : '#22c55e'}` }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{moodEmoji(entry.mood)}</span>
        <div>
          <p className="text-sm font-semibold text-slate-100">{entry.log_date}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b.key}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  b.on ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-slate-600'
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right text-xs text-slate-400">
        <p>{entry.sleep_hours}h Schlaf</p>
        <p className={badHabit ? 'font-semibold text-rose-300' : ''}>{entry.social_media_hours}h Social Media</p>
        <p className="text-slate-500">{habits}/4 Habits</p>
      </div>
    </div>
  );
}
