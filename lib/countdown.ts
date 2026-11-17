/**
 * The words and value sequence for the family dashboard countdown. Kept out of
 * the component so the milestones and the roll can be unit-tested.
 */

/** Values the split-flap board steps through, ending on the real day. */
export function rollSequence(value: number, steps = 5): number[] {
  const sequence: number[] = [];

  for (let step = steps - 1; step >= 1; step -= 1) {
    sequence.push(Math.max(value, 0) + step * 2 - 1);
  }

  sequence.push(value);

  return sequence;
}

export function countdownMilestone(days: number): string | null {
  if (days === 0) {
    return null;
  }

  if (days === 1) {
    return "It's Christmas Eve!";
  }

  if (days === 2) {
    return 'Christmas Eve tomorrow!';
  }

  if (days <= 7) {
    return 'One week to go!';
  }

  if (days <= 24) {
    return 'Advent is here';
  }

  return null;
}

export function countdownLabel(days: number): string {
  if (days === 0) {
    return "It's Christmas Day!";
  }

  return days === 1 ? 'day until Christmas Day' : 'days until Christmas Day';
}

export function countdownAccessibleLabel(days: number): string {
  if (days === 0) {
    return "It's Christmas Day";
  }

  if (days === 1) {
    return '1 day until Christmas';
  }

  return `${days} days until Christmas`;
}
