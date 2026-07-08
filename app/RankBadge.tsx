import type { RankTier } from './rank';

export default function RankBadge({ tier, size = 64 }: { tier: RankTier; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl border-2 font-black uppercase tracking-wide"
      style={{
        width: size,
        height: size,
        borderColor: tier.color,
        boxShadow: `0 0 24px ${tier.glow}`,
        color: tier.color,
        fontSize: size * 0.18,
      }}
    >
      {tier.name.slice(0, 2)}
    </div>
  );
}
