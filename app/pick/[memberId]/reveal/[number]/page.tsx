import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { requireViewer } from '@/lib/session';
import { groupWording } from '@/lib/groupWording';
import { RevealExperience } from '@/app/_components/RevealExperience';

export const metadata: Metadata = {
  title: 'Mystery gift',
  robots: { index: false, follow: false },
};

interface RevealPageProps {
  params: Promise<{ memberId: string; number: string }>;
  searchParams: Promise<{ visit?: string | string[] }>;
}

export default async function RevealPage({ params, searchParams }: RevealPageProps) {
  const viewer = await requireViewer();
  const wording = groupWording(viewer.family.groupType);

  const { memberId, number: numberParam } = await params;

  if (!viewer.family.mysteryBoxes) {
    redirect(`/pick/${memberId}?view=list`);
  }

  const search = await searchParams;
  const visitId = typeof search.visit === 'string' ? search.visit : '';
  const number = Number(numberParam);

  if (!Number.isInteger(number) || number < 1 || number > 500) {
    notFound();
  }

  if (!visitId) {
    redirect(`/pick/${memberId}`);
  }

  return (
    <RevealExperience
      memberId={memberId}
      number={number}
      visitId={visitId}
      groupWord={wording.groupWord}
    />
  );
}
