import { useState, useRef, useMemo, useCallback } from 'react';
import type React from 'react';

import useTranslation from 'next-translate/useTranslation';

import { logErrorToSentry } from '@/lib/sentry';
import { getImageUploadTranslationParams } from '@/utils/image-format';

interface UseImageUploadReturn {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleUploadPicture: () => void;
  handleRemovePicture: () => Promise<void>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  translationParams: { maxSize: string; allowedFormats: string };
}
interface ValidationErrorMessages {
  invalidFileType?: string;
  fileExceedsLimit?: string;
}
interface UploadImageOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  validationErrorMessages?: ValidationErrorMessages;
  uploadFunction?: (base64String: string) => Promise<void>;
  removeFunction?: () => Promise<void>;
  sentryTransactionName?: string;
}

const convertFileToBase64 = (
  file: File,
  readFileError: string,
  readFileAsBase64Error: string,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error(readFileAsBase64Error));
    };
    reader.onerror = () => reject(new Error(readFileError));
    reader.readAsDataURL(file);
  });

const useImageUpload = (options: UploadImageOptions = {}): UseImageUploadReturn => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    maxSize,
    allowedTypes,
    validationErrorMessages = {},
    uploadFunction,
    removeFunction,
    sentryTransactionName = 'imageUpload',
    onSuccess,
    onError,
  } = options;

  const translationParams = useMemo(() => getImageUploadTranslationParams(), []);

  const messages = useMemo(
    () => ({
      invalidFileType: t('errors.invalid-file-format', {
        formats: translationParams.allowedFormats,
      }),
      fileExceedsLimit: t('errors.file-exceeds-limit'),
      ...validationErrorMessages,
    }),
    [t, translationParams, validationErrorMessages],
  );

  const validateImageFile = useCallback(
    (file: File): string | null => {
      if (!file.type.startsWith('image/') || (allowedTypes && !allowedTypes.includes(file.type))) {
        return messages.invalidFileType;
      }
      if (maxSize && file.size > maxSize) {
        return messages.fileExceedsLimit;
      }
      return null;
    },
    [messages, maxSize, allowedTypes],
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!uploadFunction) throw new Error(t('errors.image-upload-failed'));
      const errorMessage = t('errors.image-upload-failed');
      const fileData = await convertFileToBase64(file, errorMessage, errorMessage);
      await uploadFunction(fileData);
      onSuccess?.();
    },
    [uploadFunction, onSuccess, t],
  );

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const validationError = validateImageFile(file);
      if (validationError) {
        onError?.(validationError);
        return;
      }
      setIsLoading(true);
      try {
        await uploadImage(file);
      } catch (error) {
        logErrorToSentry(error, {
          transactionName: sentryTransactionName,
          metadata: { fileName: file.name, fileSize: file.size, fileType: file.type },
        });
        onError?.(error);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [uploadImage, validateImageFile, onError, sentryTransactionName],
  );

  const handleUploadPicture = useCallback(() => fileInputRef.current?.click(), []);

  const handleRemovePicture = useCallback(async () => {
    if (!removeFunction) {
      onError?.(new Error(t('errors.image-remove-failed')));
      return;
    }
    setIsLoading(true);
    try {
      await removeFunction();
      onSuccess?.();
    } catch (error) {
      logErrorToSentry(error, { transactionName: `${sentryTransactionName}Remove` });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [removeFunction, onSuccess, onError, sentryTransactionName, t]);

  return {
    isLoading,
    fileInputRef,
    handleUploadPicture,
    handleRemovePicture,
    handleFileSelect,
    translationParams,
  };
};

export default useImageUpload;
