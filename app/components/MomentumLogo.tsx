import { playfairDisplay } from '../lib/fonts';

interface MomentumLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'white' = solid white wordmark (default). 'gradient' = the original multi-color version. */
  tone?: 'white' | 'gradient';
}

const SIZE_MAP: Record<NonNullable<MomentumLogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

const TONE_MAP: Record<NonNullable<MomentumLogoProps['tone']>, string> = {
  white: 'text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.15)]',
  gradient:
    'bg-gradient-to-r from-violet-300 via-slate-100 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(167,139,250,0.25)]',
};

/**
 * Elegant italic wordmark for the "Momentum" brand.
 * Uses Playfair Display italic. Defaults to a clean solid-white treatment;
 * pass tone="gradient" to restore the original multi-color version.
 */
export default function MomentumLogo({ className = '', size = 'md', tone = 'white' }: MomentumLogoProps) {
  return (
    <span
      className={`${playfairDisplay.className} ${SIZE_MAP[size]} inline-flex items-baseline italic font-semibold tracking-wide ${className}`}
    >
      <span className={TONE_MAP[tone]}>Momentum</span>
    </span>
  );
}
