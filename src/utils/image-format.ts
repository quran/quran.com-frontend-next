export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;
export const MAX_IMAGE_SIZE_MB = 5;

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

export const formatFileSize = (sizeInMB: number): string => {
  const sizeInBytes = sizeInMB * 1024 * 1024;

  if (sizeInBytes < KB) {
    return `${sizeInBytes} B`;
  }
  if (sizeInBytes < MB) {
    return `${Math.round(sizeInBytes / KB)} KB`;
  }
  if (sizeInBytes < GB) {
    return `${sizeInMB} MB`;
  }
  return `${(sizeInBytes / GB).toFixed(2)} GB`;
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
