import { RefObject, useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import useImageUpload from '../useImageUpload';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useUpdateUserProfile from '@/hooks/auth/useUpdateUserProfile';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/image-format';

const useProfilePictureForm = (): {
  fileInputRef: RefObject<HTMLInputElement>;
  handleUploadPicture: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePicture: () => void;
  isProcessing: boolean;
  isRemoving: boolean;
  translationParams: { maxSize: string; allowedFormats: string };
} => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const { updateProfile, isUpdating } = useUpdateUserProfile();

  const uploadFunction = useCallback(
    async (base64String: string) => {
      const result = await updateProfile({ avatar: base64String });
      if (result && 'errors' in result && result.errors) {
        // Handle validation errors
        if (result.errors.avatar) {
          // Fallback to a generic message if translation fails
          const errorMessage = result.errors.avatar || t('errors.upload-avatar-failed');
          toast(errorMessage, {
            status: ToastStatus.Error,
          });
        } else {
          // Generic error if no specific field error
          toast(t('errors.upload-avatar-failed'), {
            status: ToastStatus.Error,
          });
        }
      }
    },
    [updateProfile, toast, t],
  );

  const removeFunction = useCallback(async () => {
    setIsRemoving(true);
    const result = await updateProfile({ removeAvatar: true });
    if (result && 'errors' in result && result.errors) {
      // Handle validation errors
      if (result.errors.removeAvatar) {
        // Fallback to a generic message if translation fails
        const errorMessage = result.errors.removeAvatar || t('errors.remove-avatar-failed');
        toast(errorMessage, {
          status: ToastStatus.Error,
        });
      } else {
        // Generic error if no specific field error
        toast(t('errors.remove-avatar-failed'), {
          status: ToastStatus.Error,
        });
      }
    }
    setIsRemoving(false);
  }, [updateProfile, toast, t]);

  const onImageUploadError = useCallback(
    (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast(errorMessage, { status: ToastStatus.Error });
    },
    [toast],
  );

  const {
    isLoading,
    fileInputRef,
    handleUploadPicture,
    handleFileSelect,
    handleRemovePicture,
    translationParams,
  } = useImageUpload({
    maxSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    allowedTypes: [...ALLOWED_IMAGE_TYPES],
    uploadFunction,
    sentryTransactionName: 'uploadProfilePicture',
    onError: onImageUploadError,
    removeFunction,
    validationErrorMessages: {
      fileExceedsLimit: t('errors.profile-pic-size-limit', { size: MAX_IMAGE_SIZE_MB }),
    },
  });

  const isProcessing = isLoading || isUpdating;

  return {
    fileInputRef,
    handleUploadPicture,
    handleFileSelect,
    handleRemovePicture,
    isProcessing,
    isRemoving,
    translationParams,
  };
};

export default useProfilePictureForm;
