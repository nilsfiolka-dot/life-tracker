// src/lib/quotes.ts

export type QuoteDomain = 'sport' | 'uni' | 'sidehustle' | 'mindset';

export interface MotivationalQuote {
  text: string;
  author: string;
  domain: QuoteDomain;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", domain: "sidehustle" },
  { text: "Atomic Habits: Small habits make a big difference.", author: "James Clear", domain: "mindset" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca", domain: "mindset" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", domain: "sidehustle" },
  { text: "Simplify, then add lightness.", author: "Colin Chapman", domain: "sidehustle" },
  { text: "Details matter, it's worth waiting to get it right.", author: "Steve Jobs", domain: "sidehustle" },
  { text: "Make each day your masterpiece.", author: "John Wooden", domain: "sport" },
  { text: "Well begun is half done.", author: "Aristotle", domain: "uni" },
];

/**
 * Returns a random quote, optionally filtered by domain.
 * Falls back to the full pool if no quote exists for the given domain.
 */
export function getRandomQuote(domain?: QuoteDomain): MotivationalQuote {
  const pool = domain
    ? MOTIVATIONAL_QUOTES.filter((q) => q.domain === domain)
    : MOTIVATIONAL_QUOTES;

  const source = pool.length > 0 ? pool : MOTIVATIONAL_QUOTES;
  return source[Math.floor(Math.random() * source.length)];
}