export interface RankTier {
  name: string;
  color: string;
  glow: string;
  min: number;
}

// Score-Schwellen sind an die bestehende Punktelogik angelehnt
// (Survive 300 / Assist 200 / Kill 500 / Trade 250 pro Tag).
export const RANK_TIERS: RankTier[] = [
  { name: 'Bronze', color: '#cd7f32', glow: 'rgba(205,127,50,0.35)', min: 0 },
  { name: 'Silver', color: '#c7d0d8', glow: 'rgba(199,208,216,0.35)', min: 4000 },
  { name: 'Gold', color: '#f2c94c', glow: 'rgba(242,201,76,0.35)', min: 8000 },
  { name: 'Platinum', color: '#4fd1c5', glow: 'rgba(79,209,197,0.35)', min: 14000 },
  { name: 'Diamond', color: '#b565f5', glow: 'rgba(181,101,245,0.35)', min: 20000 },
  { name: 'Immortal', color: '#ff5c7a', glow: 'rgba(255,92,122,0.4)', min: 28000 },
];

export function getRankForScore(totalScore: number): RankTier {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (totalScore >= tier.min) current = tier;
  }
  return current;
}

export function getRankProgress(totalScore: number): {
  tier: RankTier;
  next: RankTier | null;
  progress: number;
} {
  const idx = RANK_TIERS.findIndex((t) => t.name === getRankForScore(totalScore).name);
  const tier = RANK_TIERS[idx];
  const next = RANK_TIERS[idx + 1] ?? null;
  if (!next) return { tier, next: null, progress: 1 };
  const progress = (totalScore - tier.min) / (next.min - tier.min);
  return { tier, next, progress: Math.min(Math.max(progress, 0), 1) };
}
