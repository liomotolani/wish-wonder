/**
 * Deterministic seeded shuffle for the mystery picker. The same seed and gift
 * ids always produce the same number-to-gift mapping, so a Peeked box reveals
 * the same gift when it is reopened during a visit.
 */
export function shuffleGiftIds(giftIds: readonly string[], seed: number): string[] {
  const random = mulberry32(seed);
  const shuffled = [...giftIds];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const value = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = value;
  }

  return shuffled;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
