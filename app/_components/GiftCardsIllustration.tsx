interface GiftCardsIllustrationProps {
  className?: string;
}

export function GiftCardsIllustration({ className = '' }: GiftCardsIllustrationProps) {
  return (
    <div
      className={`relative mx-auto h-56 w-64 sm:h-72 sm:w-80 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute left-2 top-14 flex h-36 w-36 -rotate-[22deg] items-end rounded-[26px] bg-pine-700 p-5 shadow-2xl sm:h-44 sm:w-44">
        <span className="absolute inset-y-0 left-[58%] w-2.5 bg-gold" />
        <span className="absolute inset-x-0 top-[38%] h-2.5 bg-gold" />
        <span className="relative text-4xl font-extrabold text-snow sm:text-5xl">12</span>
      </div>

      <div className="absolute right-0 top-20 flex h-36 w-36 rotate-[16deg] items-end rounded-[26px] bg-gold p-5 shadow-2xl sm:h-44 sm:w-44">
        <span className="absolute inset-y-0 left-[46%] w-2.5 bg-cranberry" />
        <span className="absolute inset-x-0 top-[42%] h-2.5 bg-cranberry" />
        <span className="relative text-4xl font-extrabold text-pine-900 sm:text-5xl">3</span>
      </div>

      <div className="absolute left-1/2 top-2 flex h-44 w-44 -translate-x-1/2 items-end rounded-[30px] bg-cranberry p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:h-52 sm:w-52">
        <span className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-gold" />
        <span className="absolute inset-x-0 top-[36%] h-3 bg-gold" />
        <svg
          className="absolute left-1/2 top-[22%] h-12 w-12 -translate-x-1/2 text-gold"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9C9.5 4.5 4 6 6.5 10.5 8 13 12 12.5 12 12.5s4 .5 5.5-2C20 6 14.5 4.5 12 9Z" />
          <path d="M12 9v6" />
        </svg>
        <span className="relative text-6xl font-extrabold tracking-tight text-snow sm:text-7xl">
          7
        </span>
      </div>
    </div>
  );
}
