import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { addSentryBreadcrumb, logErrorToSentry } from '@/lib/sentry';
import UserProfile from '@/types/auth/UserProfile';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { updateUserProfile } from '@/utils/auth/authRequests';

interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  removeAvatar?: boolean;
}

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
    const updateData: Partial<UpdateUserProfileData> = {};

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
    const isAvatarChange = data.avatar !== undefined || data.removeAvatar;
    mutate(
      makeUserProfileUrl(),
      (currentProfileData: UserProfile | undefined) => {
        const current = currentProfileData || {};
        const updatedData: Partial<UserProfile> = {};
        if (data.firstName !== undefined) {
          updatedData.firstName = data.firstName.trim();
        }
        if (data.lastName !== undefined) {
          updatedData.lastName = data.lastName.trim();
        }
        if (isAvatarChange) {
          if (data.removeAvatar) {
            updatedData.photoUrl = null;
          } else if (data.avatar !== undefined) {
            updatedData.photoUrl = data.avatar;
          }
        }
        return {
          ...current,
          ...updatedData,
        };
      },
      {
        revalidate: isAvatarChange,
      },
    );
  };

  const getUpdateFields = (data: UpdateUserProfileData): string[] => {
    return Object.keys(data).filter(
      (key) => data[key as keyof UpdateUserProfileData] !== undefined,
    );
  };

  const handleUpdateError = (
    errors: Record<string, string> | undefined,
    updateFields: string[],
  ): { errors?: Record<string, string> } | void => {
    if (errors && Object.keys(errors).length > 0) {
      logErrorToSentry(new Error('Update profile failed with validation errors'), {
        transactionName: 'updateUserProfile',
        metadata: { errorType: 'validation', errors, updateFields },
      });
      addSentryBreadcrumb('profile.update', 'Update user profile failed', {
        errorType: 'validation',
        errorFields: Object.keys(errors),
      });
      return { errors };
    }

    toast(t('error.general'), { status: ToastStatus.Error });
    logErrorToSentry(new Error('Update profile failed with generic error'), {
      transactionName: 'updateUserProfile',
      metadata: { errorType: 'generic', updateFields },
    });
    addSentryBreadcrumb('profile.update', 'Update user profile failed', {
      errorType: 'generic',
    });
    return undefined;
  };

  const handleUpdateException = (error: unknown, updateFields: string[]) => {
    toast(t('error.general'), { status: ToastStatus.Error });
    logErrorToSentry(error, {
      transactionName: 'updateUserProfile',
      metadata: { errorType: 'exception', updateFields },
    });
    addSentryBreadcrumb('profile.update', 'Update user profile exception', {
      error: String(error),
      updateFields,
    });
  };

  const updateProfile = async (
    data: UpdateUserProfileData,
  ): Promise<{ errors?: Record<string, string> } | void> => {
    setIsUpdating(true);

    const updateFields = getUpdateFields(data);
    addSentryBreadcrumb('profile.update', 'Update user profile started', {
      fields: updateFields,
      hasAvatar: data.avatar !== undefined,
      removeAvatar: data.removeAvatar,
    });

    try {
      const updateData = buildUpdateData(data);
      const { data: response, errors } = await updateUserProfile(updateData);

      if (!response.success) {
        if (errors?.avatar) {
          return { errors: { avatar: response.message } };
        }
        return handleUpdateError(errors, updateFields);
      }

      updateUserProfileCache(data);
      toast(t('profile:success.details'), { status: ToastStatus.Success });
      addSentryBreadcrumb('profile.update', 'Update user profile succeeded', {
        updatedFields: updateFields,
      });
      return undefined;
    } catch (error) {
      handleUpdateException(error, updateFields);
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
