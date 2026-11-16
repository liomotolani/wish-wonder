import 'server-only';
import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/db/client';

export const MAX_GIFT_PHOTO_BYTES = 5 * 1024 * 1024;
export const GIFT_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function isAllowedGiftPhotoType(type: string): boolean {
  return GIFT_PHOTO_TYPES.includes(type as (typeof GIFT_PHOTO_TYPES)[number]);
}

export async function uploadGiftPhoto(file: File, memberId: string): Promise<string> {
  const extension = EXTENSION_BY_TYPE[file.type];

  if (!extension) {
    throw new Error('Unsupported image type.');
  }

  const supabase = createAdminClient();
  const path = `${memberId}/${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from('gift-photos')
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return supabase.storage.from('gift-photos').getPublicUrl(path).data.publicUrl;
}
