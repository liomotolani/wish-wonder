const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.82;
const SKIP_IF_SMALLER_THAN_BYTES = 400_000;

/**
 * Shrinks a photo in the browser before upload. Wish lists show small
 * thumbnails, so sending a multi-megabyte camera file wastes storage, egress
 * and mobile data. Falls back to the original file if anything is unsupported.
 */
export async function compressPhoto(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      bitmap = await createImageBitmap(file);
    }
  } catch {
    return file;
  }

  try {
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_EDGE_PX / longestEdge);

    if (scale === 1 && file.size <= SKIP_IF_SMALLER_THAN_BYTES) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext('2d');

    if (!context) {
      return file;
    }

    // JPEG has no transparency; a white base avoids black edges on PNGs.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';

    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}
