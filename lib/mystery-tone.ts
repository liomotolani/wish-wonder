/**
 * The three wrapping-paper colours used by mystery boxes. The picker and the
 * reveal screen both read from here so a tapped box keeps its colour.
 */
export const MYSTERY_TONES = [
  {
    box: 'bg-pine-700',
    ribbon: 'bg-gold',
    bow: 'text-gold',
    number: 'text-snow',
    border: 'border border-transparent',
  },
  {
    box: 'bg-cranberry',
    ribbon: 'bg-gold',
    bow: 'text-gold',
    number: 'text-snow',
    border: 'border border-transparent',
  },
  {
    box: 'bg-gold',
    ribbon: 'bg-cranberry',
    bow: 'text-cranberry',
    number: 'text-pine-900',
    border: 'border border-transparent',
  },
] as const;

export type MysteryTone = (typeof MYSTERY_TONES)[number];

export function mysteryToneFor(number: number): MysteryTone {
  return MYSTERY_TONES[(number - 1) % MYSTERY_TONES.length];
}
