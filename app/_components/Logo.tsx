import Link from 'next/link';

interface LogoProps {
  href?: string;
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md';
}

export function Logo({ href = '/', tone = 'dark', size = 'md' }: LogoProps) {
  const isDark = tone === 'dark';

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    >
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 ${size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'}`}
      >
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <rect width="64" height="64" rx="14" className="fill-cranberry" />
          <rect x="42" y="0" width="8" height="64" className="fill-gold" />
          <rect x="0" y="18" width="64" height="8" className="fill-gold" />
          <path
            d="M13.5 38.5c0-6 4-9.5 8.5-9.5s8.5 3.2 8.5 8.4c0 5.6-6.6 6.4-8.5 10.6v1.4"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="57" r="3.5" fill="#FFFFFF" />
        </svg>
      </span>
      <span
        className={`whitespace-nowrap font-extrabold tracking-tight ${
          size === 'sm' ? 'text-base' : 'text-lg sm:text-xl'
        } ${isDark ? 'text-snow' : 'text-pine-900'}`}
      >
        Wish &amp; Wonder
      </span>
    </Link>
  );
}
