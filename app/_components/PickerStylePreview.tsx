import { GiftIcon } from '@/app/_components/icons';

/**
 * Small illustrative previews of the two picker views. Decorative only; the
 * surrounding label carries the meaning for screen readers.
 */
export function PickerStylePreview({
  variant,
  className = '',
  size = 'md',
}: {
  variant: 'boxes' | 'list';
  className?: string;
  size?: 'md' | 'lg';
}) {
  const height = size === 'lg' ? 'h-56 sm:h-64' : 'h-40';

  if (variant === 'list') {
    return (
      <div
        aria-hidden="true"
        className={`${height} overflow-hidden rounded-2xl bg-pine-900 p-2 ${className}`}
      >
        <div className="flex h-full flex-col justify-between gap-1.5">
          {[
            { name: 'Fluffy slippers', price: '£12', tone: 'bg-gold-100 text-gold-ink' },
            { name: 'Baking book', price: '£18', tone: 'bg-pine-100 text-pine-700' },
            { name: 'Candle set', price: '£22', tone: 'bg-cranberry/15 text-cranberry-ink' },
          ].map((row) => (
            <div
              key={row.name}
              className="flex min-h-0 flex-1 items-center gap-2 rounded-xl border border-snow/10 bg-snow/[0.06] p-1.5"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${row.tone}`}
              >
                <GiftIcon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[9px] font-bold text-snow">
                  {row.name}
                </span>
                <span className="block text-[8px] text-snow/60">{row.price}</span>
              </span>
              <span className="rounded-full bg-cranberry px-2 py-1 text-[8px] font-bold text-white">
                Buy
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tiles = [
    {
      number: 1,
      price: '£25',
      box: 'bg-pine-700',
      ribbon: 'bg-gold',
      bow: 'text-gold',
      text: 'text-snow',
    },
    {
      number: 2,
      price: '£79',
      box: 'bg-pine-900',
      ribbon: 'bg-gold',
      bow: 'text-gold',
      text: 'text-gold',
    },
    {
      number: 3,
      price: '£18',
      box: 'bg-cranberry',
      ribbon: 'bg-gold',
      bow: 'text-gold',
      text: 'text-snow',
    },
    {
      number: 4,
      price: '£45',
      box: 'bg-gold',
      ribbon: 'bg-cranberry',
      bow: 'text-cranberry',
      text: 'text-pine-900',
    },
    {
      number: 5,
      price: '£22',
      box: 'bg-pine-700',
      ribbon: 'bg-gold',
      bow: 'text-gold',
      text: 'text-snow',
    },
    {
      number: 6,
      price: '£12',
      box: 'bg-cranberry',
      ribbon: 'bg-gold',
      bow: 'text-gold',
      text: 'text-snow',
    },
  ];

  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-2xl bg-pine-900 p-2 ${className}`}
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.number}
            className={`relative aspect-square overflow-hidden rounded-xl ${tile.box}`}
          >
            <span className="absolute left-1 top-1 z-10 rounded-full bg-pine-900/80 px-1.5 py-0.5 text-[7px] font-bold text-snow">
              {tile.price}
            </span>
            <span
              className={`absolute inset-y-0 left-[58%] w-1.5 ${tile.ribbon}`}
            />
            <span
              className={`absolute inset-x-0 top-[38%] h-1.5 ${tile.ribbon}`}
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`absolute left-[40%] top-[24%] h-[20%] w-[20%] ${tile.bow}`}
            >
              <path d="M12 9C9.5 4.5 4 6 6.5 10.5 8 13 12 12.5 12 12.5s4 .5 5.5-2C20 6 14.5 4.5 12 9Z" />
              <path d="M12 9v6" />
            </svg>
            <span
              className={`absolute bottom-1.5 left-2 text-2xl font-extrabold leading-none sm:text-3xl ${tile.text}`}
            >
              {tile.number}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
