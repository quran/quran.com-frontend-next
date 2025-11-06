import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import UserProfile from '@/types/auth/UserProfile';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { updateUserProfile } from '@/utils/auth/authRequests';
import { formatFileSize, MAX_IMAGE_SIZE_MB } from '@/utils/imageFormats';

type UpdateUserProfileData = {
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  removeAvatar?: boolean;
};

interface UseUpdateUserProfileReturn {
  updateProfile: (
    data: UpdateUserProfileData,
  ) => Promise<{ errors?: Record<string, string> } | void>;
  isUpdating: boolean;
}

/**
 * Custom hook for updating user profile
 * Handles the submission logic, cache updates, and toast notifications
 * @returns {UseUpdateUserProfileReturn} Object containing updateProfile function and isUpdating state
 */
const useUpdateUserProfile = (): UseUpdateUserProfileReturn => {
  const { t } = useTranslation('profile');
  const { mutate } = useSWRConfig();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const buildUpdateData = (data: UpdateUserProfileData) => {
    const updateData: {
      firstName?: string;
      lastName?: string;
      photoUrl?: string;
      removeAvatar?: boolean;
    } = {};

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName.trim();
    }
    if (data.photoUrl !== undefined) {
      updateData.photoUrl = data.photoUrl;
    }
    if (data.removeAvatar !== undefined) {
      updateData.removeAvatar = data.removeAvatar;
    }

    return updateData;
  };

  const updateUserProfileCache = (data: UpdateUserProfileData) => {
    mutate(
      makeUserProfileUrl(),
      (currentProfileData: UserProfile) => {
        const updatedData: Partial<UserProfile> = {};
        if (data.firstName !== undefined) {
          updatedData.firstName = data.firstName.trim();
        }
        if (data.lastName !== undefined) {
          updatedData.lastName = data.lastName.trim();
        }
        if (data.photoUrl !== undefined) {
          updatedData.photoUrl = data.photoUrl;
        }
        if (data.removeAvatar) {
          updatedData.photoUrl = null;
        }
        return {
          ...currentProfileData,
          ...updatedData,
        };
      },
      {
        revalidate: false,
      },
    );
  };

  const updateProfile = async (
    data: UpdateUserProfileData,
  ): Promise<{ errors?: Record<string, string> } | void> => {
    setIsUpdating(true);

    try {
      const updateData = buildUpdateData(data);
      const { data: response, errors } = await updateUserProfile(updateData);

      if (!response.success) {
        // Return errors if they exist, otherwise show generic error toast
        if (errors.photoUrl) {
          return {
            errors: {
              photoUrl: t('errors.file-too-large', { size: formatFileSize(MAX_IMAGE_SIZE_MB) }),
            },
          };
        }
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
        return undefined;
      }

      updateUserProfileCache(data);

      toast(t('success.details'), {
        status: ToastStatus.Success,
      });
      return undefined;
    } catch (error) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
      return undefined;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    isUpdating,
  };
};

export default useUpdateUserProfile;
