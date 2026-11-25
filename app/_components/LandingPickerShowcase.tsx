'use client';

import { useRef, useState } from 'react';
import { GiftIcon, ListIcon } from '@/app/_components/icons';
import { PickerStylePreview } from '@/app/_components/PickerStylePreview';

type PickerStyle = 'boxes' | 'list';

const OPTIONS: Record<
  PickerStyle,
  { label: string; eyebrow: string; heading: string; copy: string; points: string[] }
> = {
  boxes: {
    label: 'Boxes',
    eyebrow: 'Keep the surprise',
    heading: 'Numbers hide the gift.',
    copy: 'Buyers see what each gift costs before they peek, so they can stay within budget without spoiling the surprise.',
    points: ['A price on every box', 'The gift stays hidden', 'Buyers can switch to the list'],
  },
  list: {
    label: 'List',
    eyebrow: 'Keep it simple',
    heading: 'Everything in plain sight.',
    copy: 'Some groups just want to browse. Show every gift, photo and price at once, sorted from low to high.',
    points: ['Every gift at a glance', 'Sorted by price', 'No boxes, no peeking'],
  },
};

export function LandingPickerShowcase() {
  const [style, setStyle] = useState<PickerStyle>('boxes');
  const option = OPTIONS[style];
  const tabRefs = {
    boxes: useRef<HTMLButtonElement | null>(null),
    list: useRef<HTMLButtonElement | null>(null),
  };

  function remember(next: PickerStyle) {
    try {
      window.localStorage.setItem('ww-picker-default', next);
    } catch {
      // The create screen still offers both choices.
    }
  }

  function choose(next: PickerStyle) {
    setStyle(next);
    remember(next);
  }

  function move() {
    const next: PickerStyle = style === 'boxes' ? 'list' : 'boxes';
    choose(next);
    tabRefs[next].current?.focus();
  }

  return (
    <section aria-labelledby="picker-style-heading" className="mt-14 lg:mt-16">
      <div className="relative isolate overflow-hidden rounded-[30px] border border-snow/10 bg-gradient-to-br from-snow/[0.08] via-snow/[0.04] to-transparent p-5 sm:p-7 lg:p-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-gold/10 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-cranberry/10 blur-3xl"
        />

        <div className="relative grid gap-7 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              Choose their view
            </p>
            <h2
              id="picker-style-heading"
              className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
            >
              Boxes or a list?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-snow/65 sm:text-base">
              Either way, buyers always see the price. Choose how they browse.
            </p>

            <div
              role="tablist"
              aria-label="Picker style preview"
              className="mt-5 inline-flex rounded-full border border-snow/10 bg-pine-900/60 p-1"
            >
              {(['boxes', 'list'] as const).map((value) => {
                const active = style === value;
                const Icon = value === 'boxes' ? GiftIcon : ListIcon;

                return (
                  <button
                    key={value}
                    ref={tabRefs[value]}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="picker-style-preview"
                    tabIndex={active ? 0 : -1}
                    onClick={() => choose(value)}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                        event.preventDefault();
                        move();
                      }
                    }}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      active ? 'bg-snow text-ink' : 'text-snow/60 hover:text-snow'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {OPTIONS[value].label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold/80">
                {option.eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
                {option.heading}
              </h3>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-snow/60">
                {option.copy}
              </p>

              <ul className="mt-4 space-y-2">
                {option.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-sm font-semibold text-snow/75"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div
            id="picker-style-preview"
            role="tabpanel"
            className="relative"
          >
            <div className="rounded-[24px] border border-snow/10 bg-pine-900/70 p-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] sm:p-3">
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className="h-1.5 w-1.5 rounded-full bg-snow/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-snow/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-snow/20" />
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-snow/30">
                  {style === 'boxes' ? 'Boxes' : 'List'} view
                </span>
              </div>
              <PickerStylePreview variant={style} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
