import { useCallback, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useUpdateUserProfile from '@/hooks/auth/useUpdateUserProfile';
import useImageUpload from '@/hooks/useImageUpload';
import {
  ALLOWED_IMAGE_TYPES,
  getImageUploadTranslationParams,
  MAX_IMAGE_SIZE_MB,
} from '@/utils/imageFormats';

const useProfilePictureForm = () => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const translationParams = useMemo(() => getImageUploadTranslationParams(), []);

  const uploadErrorMessages = useMemo(
    () => ({
      invalidFileType: t('errors.invalid-file-format', {
        formats: translationParams.allowedFormats,
      }),
      fileTooLarge: t('errors.file-exceeds-limit'),
    }),
    [t, translationParams],
  );

  const { updateProfile, isUpdating } = useUpdateUserProfile();

  const uploadFunction = useCallback(
    async (base64String: string) => {
      try {
        const result = await updateProfile({ avatar: base64String });
        if (result && 'errors' in result && result.errors) {
          // Handle validation errors
          if (result.errors.avatar) {
            // Try to translate the error, fallback to a generic message if translation fails
            const errorMessage = t(result.errors.avatar, undefined, {
              fallback: t('errors.upload-failed'),
            });
            toast(errorMessage, {
              status: ToastStatus.Error,
            });
          } else {
            // Generic error if no specific field error
            toast(t('errors.upload-failed'), {
              status: ToastStatus.Error,
            });
          }
        }
      } catch {
        // Error is already handled by the useUpdateUserProfile hook
      }
    },
    [updateProfile, toast, t],
  );

  const removeFunction = useCallback(async () => {
    setIsRemoving(true);
    try {
      const result = await updateProfile({ removeAvatar: true });
      if (result && 'errors' in result && result.errors) {
        // Handle validation errors
        if (result.errors.avatar) {
          // Try to translate the error, fallback to a generic message if translation fails
          const errorMessage = t(result.errors.avatar, undefined, {
            fallback: t('errors.remove-failed'),
          });
          toast(errorMessage, {
            status: ToastStatus.Error,
          });
        } else {
          // Generic error if no specific field error
          toast(t('errors.remove-failed'), {
            status: ToastStatus.Error,
          });
        }
      }
    } catch {
      // Error is already handled by the useUpdateUserProfile hook
    } finally {
      setIsRemoving(false);
    }
  }, [updateProfile, toast, t]);

  const onImageUploadError = useCallback(
    (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast(errorMessage, { status: ToastStatus.Error });
    },
    [toast],
  );

  const {
    isUploading: isImageUploading,
    fileInputRef,
    handleUploadPicture,
    handleFileSelect,
  } = useImageUpload({
    maxSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    allowedTypes: [...ALLOWED_IMAGE_TYPES],
    errorMessages: uploadErrorMessages,
    uploadFunction,
    sentryTransactionName: 'uploadProfilePicture',
    onError: onImageUploadError,
  });

  const isProcessing = isImageUploading || isUpdating || isRemoving;

  return {
    fileInputRef,
    handleUploadPicture,
    handleFileSelect,
    removeFunction,
    isProcessing,
    translationParams,
    t,
  };
};

export default useProfilePictureForm;
