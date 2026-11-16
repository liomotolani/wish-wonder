/**
 * The four-point sparkle used by snow, reveal bursts and celebrations.
 * One shape, so every "magic" moment in the app matches.
 */
export function SparkleStar({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c.65 6.4 2.75 8.5 9 9-6.25.5-8.35 2.6-9 9-.65-6.4-2.75-8.5-9-9 6.25-.5 8.35-2.6 9-9Z" />
    </svg>
  );
}

/** A chunky six-point snowflake for bursts and the front snow layer. */
export function SnowflakeMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
    >
      <path d="M12 1 14.25 8.1 21.5 6.5 16.5 12 21.5 17.5 14.25 15.9 12 23 9.75 15.9 2.5 17.5 7.5 12 2.5 6.5 9.75 8.1Z" />
      <path d="M12 9.6 14.4 12 12 14.4 9.6 12Z" />
    </svg>
  );
}
