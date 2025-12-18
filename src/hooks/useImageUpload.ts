import { useState, useRef, useMemo, useCallback } from 'react';
import type React from 'react';

import { logErrorToSentry } from '@/lib/sentry';

interface UseImageUploadReturn {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleUploadPicture: () => void;
  handleRemovePicture: () => Promise<void>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
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
  errorMessages?: ValidationErrorMessages;
  uploadFunction?: (base64String: string) => Promise<void>;
  removeFunction?: () => Promise<void>;
  sentryTransactionName?: string;
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const useImageUpload = (options: UploadImageOptions = {}): UseImageUploadReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    maxSize,
    allowedTypes,
    errorMessages = {},
    uploadFunction,
    removeFunction,
    sentryTransactionName = 'imageUpload',
    onSuccess,
    onError,
  } = options;

  const messages = useMemo(() => {
    const defaultErrorMessages: Required<ValidationErrorMessages> = {
      invalidFileType: 'Please select a valid image file',
      fileExceedsLimit: `Image size exceeds the limit`,
    };
    return { ...defaultErrorMessages, ...errorMessages };
  }, [errorMessages]);

  const validateImageFile = useCallback(
    (file: File): string | null => {
      if (!file.type.startsWith('image/')) {
        return messages.invalidFileType;
      }

      if (maxSize && file.size > maxSize) {
        return messages.fileExceedsLimit;
      }

      if (allowedTypes && !allowedTypes.includes(file.type)) {
        return messages.invalidFileType;
      }

      return null;
    },
    [messages, maxSize, allowedTypes],
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!uploadFunction) {
        throw new Error('Upload function is required');
      }

      const fileData = await convertFileToBase64(file);
      await uploadFunction(fileData);
      onSuccess?.();
    },
    [uploadFunction, onSuccess],
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
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        });
        onError?.(error);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [uploadImage, validateImageFile, onError, sentryTransactionName],
  );

  const handleUploadPicture = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemovePicture = useCallback(async () => {
    if (!removeFunction) {
      onError?.(new Error('Remove function is required'));
      return;
    }

    setIsLoading(true);

    try {
      await removeFunction();
      onSuccess?.();
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: `${sentryTransactionName}Remove`,
      });

      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [removeFunction, onSuccess, onError, sentryTransactionName]);

  return {
    isLoading,
    fileInputRef,
    handleUploadPicture,
    handleRemovePicture,
    handleFileSelect,
  };
};

export default useImageUpload;
