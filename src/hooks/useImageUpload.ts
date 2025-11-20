import { useState, useRef } from 'react';

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
  uploadFunction?: (base64String: string, file: File) => Promise<void>;
  removeFunction?: () => Promise<void>;
  sentryTransactionName?: string;
  convertToBase64?: boolean; // default: true
}

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
    convertToBase64 = true,
    onSuccess,
    onError,
  } = options;

  const defaultErrorMessages: Required<ValidationErrorMessages> = {
    invalidFileType: 'Please select a valid image file',
    fileExceedsLimit: `Image size exceeds the limit`,
  };

  const messages = { ...defaultErrorMessages, ...errorMessages };

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

  const validateImageFile = (file: File): string | null => {
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
  };

  const uploadImage = async (file: File) => {
    if (!uploadFunction) {
      throw new Error('Upload function is required');
    }

    let fileData: string | File = file;
    if (convertToBase64) {
      fileData = await convertFileToBase64(file);
    }

    await uploadFunction(fileData as string, file);
    onSuccess?.();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleUploadPicture = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePicture = async () => {
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
  };

  return {
    isLoading,
    fileInputRef,
    handleUploadPicture,
    handleRemovePicture,
    handleFileSelect,
  };
};

export default useImageUpload;
