import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import UserProfile from '@/types/auth/UserProfile';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { updateUserProfile } from '@/utils/auth/authRequests';

type UpdateUserProfileData = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
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
  const { t } = useTranslation('common');
  const { mutate } = useSWRConfig();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const buildUpdateData = (data: UpdateUserProfileData) => {
    const updateData: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      removeAvatar?: boolean;
    } = {};

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName.trim();
    }
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
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
        if (data.avatar !== undefined || data.removeAvatar) {
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
        if (errors.avatar) {
          return {
            errors: {
              avatar: t('errors.file-exceeds-limit'),
            },
          };
        }
        toast(t('error.general'), {
          status: ToastStatus.Error,
        });
        return undefined;
      }

      updateUserProfileCache(data);

      toast(t('profile:success.details'), {
        status: ToastStatus.Success,
      });
      return undefined;
    } catch (error) {
      toast(t('error.general'), {
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
