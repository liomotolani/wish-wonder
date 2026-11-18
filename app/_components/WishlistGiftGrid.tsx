import Link from 'next/link';
import { StaggerItem, StaggerList } from '@/app/_components/motion';
import { GiftThumbnail } from '@/app/_components/GiftThumbnail';
import { formatPrice } from '@/lib/format';
import { PRIORITY_REALLY_WANT } from '@/lib/validation';
import { StarIcon } from '@/app/_components/icons';
import type { OwnGiftView } from '@/lib/types';

interface WishlistGiftGridProps {
  gifts: OwnGiftView[];
  editHref: (giftId: string) => string;
}

export function WishlistGiftGrid({ gifts, editHref }: WishlistGiftGridProps) {
  return (
    <StaggerList className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {gifts.map((gift, index) => {
        const price = formatPrice(gift.pricePence, gift.currency);
        const isPriority = gift.priority === PRIORITY_REALLY_WANT;

        return (
          <StaggerItem key={gift.id}>
            <Link
              href={editHref(gift.id)}
              className="group flex h-full gap-3 rounded-2xl border border-pine-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 lg:flex-col lg:gap-0 lg:p-3.5"
            >
              <GiftThumbnail
                giftId={gift.id}
                imageUrl={gift.imageUrl}
                toneIndex={index}
                className="h-[72px] w-[72px] rounded-xl lg:aspect-[4/3] lg:h-auto lg:w-full lg:rounded-2xl"
              />

              <div className="min-w-0 flex-1 lg:mt-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-extrabold leading-snug text-ink">
                    {gift.name}
                  </h2>
                  {price ? (
                    <span className="shrink-0 text-base font-extrabold text-pine-700">
                      {price}
                    </span>
                  ) : null}
                </div>

                {gift.description || gift.preferences ? (
                  <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted">
                    {gift.description ?? gift.preferences}
                  </p>
                ) : null}

                {isPriority ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-cranberry/10 px-2.5 py-0.5 text-xs font-bold text-cranberry-ink">
                    <StarIcon className="h-3 w-3" />
                    Really want this
                  </span>
                ) : null}

                <span className="mt-2 hidden w-fit text-sm font-bold text-pine-700 underline underline-offset-4 group-hover:text-pine-900 lg:block">
                  Edit
                </span>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}
