
import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'product-images';

type ImageFormat = {
  extension: string;
  mimeType: string;
};

async function detectImageFormat(file: File): Promise<ImageFormat> {
  const buffer = await file.slice(0, 32).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { extension: 'png', mimeType: 'image/png' };
  }

  // JPEG
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }

  // GIF
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return { extension: 'gif', mimeType: 'image/gif' };
  }

  // WEBP
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return { extension: 'webp', mimeType: 'image/webp' };
  }

  // AVIF
  if (
    String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' &&
    ['avif', 'avis'].includes(
      String.fromCharCode(...bytes.slice(8, 12))
    )
  ) {
    return { extension: 'avif', mimeType: 'image/avif' };
  }

  throw new Error(
    'Unsupported image. Please upload PNG, JPG, JPEG, WEBP, GIF, or AVIF.'
  );
}

export async function uploadProductImage(
  sku: string,
  file: File
): Promise<string> {
  if (!file) {
    throw new Error('Please select a product image.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must not exceed 5 MB.');
  }

  const safeSKU = sku.replace(/[^a-zA-Z0-9_-]/g, '');

  if (!safeSKU) {
    throw new Error('Invalid product SKU.');
  }

  const format = await detectImageFormat(file);

  const filePath = `${safeSKU}.${format.extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: format.mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return filePath;
}

export function getProductImageUrl(
  imagePath: string | null | undefined
): string {
  if (!imagePath) {
    return '';
  }

  if (/^(https?:|\/|data:)/i.test(imagePath)) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}
