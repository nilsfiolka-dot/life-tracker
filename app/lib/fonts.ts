import { Playfair_Display } from 'next/font/google';

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['600', '700'],
  variable: '--font-playfair',
});
