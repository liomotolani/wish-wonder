const SHOP_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  argos: 'Argos',
  boots: 'Boots',
  dunelm: 'Dunelm',
  etsy: 'Etsy',
  johnlewis: 'John Lewis',
  marksandspencer: 'M&S',
  next: 'Next',
  pandora: 'Pandora',
  selfridges: 'Selfridges',
  waterstones: 'Waterstones',
};

/** A short shop name from a product URL, for list view. */
export function shopNameFromUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const host = new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
    const base = host.split('.')[0];

    if (!base) {
      return null;
    }

    if (SHOP_LABELS[base]) {
      return SHOP_LABELS[base];
    }

    const words = base.replace(/-/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  } catch {
    return null;
  }
}
