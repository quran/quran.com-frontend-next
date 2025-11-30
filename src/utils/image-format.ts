export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;
export const MAX_IMAGE_SIZE_MB = 5;

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;
const BYTES_PER_GB = BYTES_PER_MB * 1024;

export const formatFileSize = (sizeInMB: number): string => {
  const sizeInBytes = sizeInMB * 1024 * 1024;

  if (sizeInBytes < BYTES_PER_KB) {
    return `${sizeInBytes} B`;
  }
  if (sizeInBytes < BYTES_PER_MB) {
    return `${Math.round(sizeInBytes / BYTES_PER_KB)} KB`;
  }
  if (sizeInBytes < BYTES_PER_GB) {
    return `${sizeInMB} MB`;
  }
  return `${(sizeInBytes / BYTES_PER_GB).toFixed(2)} GB`;
};

export const getAllowedImageFormats = (types: readonly string[]): string => {
  return types.map((type) => type.split('/')[1].toUpperCase()).join(', ');
};

export const getImageUploadTranslationParams = (): { maxSize: string; allowedFormats: string } => {
  return {
    maxSize: formatFileSize(MAX_IMAGE_SIZE_MB),
    allowedFormats: getAllowedImageFormats(ALLOWED_IMAGE_TYPES),
  };
};
