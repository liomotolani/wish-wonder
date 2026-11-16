import { NextResponse } from 'next/server';
import {
  apiError,
  noStoreJson,
  requireApiViewer,
} from '@/lib/api';
import {
  MAX_GIFT_PHOTO_BYTES,
  isAllowedGiftPhotoType,
  uploadGiftPhoto,
} from '@/lib/db/gift-photos';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return apiError('Choose a photo and try again.', 400);
  }

  const file = formData.get('file');

  if (!(file instanceof File)) {
    return apiError('Choose a photo and try again.', 400);
  }

  if (!isAllowedGiftPhotoType(file.type)) {
    return apiError('Use a JPG, PNG or WebP photo.', 400);
  }

  if (file.size === 0) {
    return apiError('That photo is empty. Choose another one.', 400);
  }

  if (file.size > MAX_GIFT_PHOTO_BYTES) {
    return apiError('That photo is too big. Choose one under 5 MB.', 400);
  }

  try {
    const url = await uploadGiftPhoto(file, auth.viewer.member.id);
    return noStoreJson({ ok: true, url }, { status: 201 });
  } catch {
    console.error('Could not upload gift photo.');
    return apiError('We could not upload that photo just now. Please try again.', 500);
  }
}
