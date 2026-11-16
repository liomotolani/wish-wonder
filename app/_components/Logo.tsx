import Link from 'next/link';
import { GiftIcon } from '@/app/_components/icons';

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
        className={`inline-flex items-center justify-center rounded-xl bg-gold text-pine-900 ${
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
        }`}
      >
        <GiftIcon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      </span>
      <span
        className={`font-extrabold tracking-tight ${
          size === 'sm' ? 'text-base' : 'text-lg sm:text-xl'
        } ${isDark ? 'text-snow' : 'text-pine-900'}`}
      >
        Wish &amp; Wonder
      </span>
    </Link>
  );
}
