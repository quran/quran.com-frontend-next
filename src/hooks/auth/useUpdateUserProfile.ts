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
  ) => Promise<{ errors?: Record<string, string>; success?: boolean } | void>;
  isUpdating: boolean;
}

const enum ProfileUpdateTelemetry {
  TransactionName = 'updateUserProfile',
  BreadcrumbCategory = 'profile.update',
}

/**
 * Custom hook for updating user profile
 * Handles the submission logic, cache updates, and toast notifications
 * @returns {UseUpdateUserProfileReturn} Object containing:
 *   - updateProfile: Function to update user profile data.
 *     Accepts UpdateUserProfileData parameter with optional fields:
 *     - firstName?: string - User's first name
 *     - lastName?: string - User's last name
 *     - avatar?: string - Avatar image URL
 *     - removeAvatar?: boolean - Flag to remove the current avatar
 *     Returns Promise<{ errors?: Record<string, string>; success?: boolean } | void>:
 *     - Resolves to { errors?: Record<string, string> } if validation fails
 *     - Resolves to { success: true } if update succeeds
 *     - Resolves to undefined if generic error or exception occurs
 *   - isUpdating: boolean - Indicates whether a profile update is currently in progress
 */
const useUpdateUserProfile = (): UseUpdateUserProfileReturn => {
  const { t } = useTranslation('common');
  const { mutate } = useSWRConfig();
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const buildUpdateData = (data: UpdateUserProfileData): Partial<UpdateUserProfileData> => {
    const updateData: Partial<UpdateUserProfileData> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.removeAvatar !== undefined) updateData.removeAvatar = data.removeAvatar;
    return updateData;
  };

  const updateUserProfileCache = (data: UpdateUserProfileData) => {
    const isAvatarUpdate = data.avatar !== undefined || data.removeAvatar !== undefined;
    mutate(
      makeUserProfileUrl(),
      (currentProfileData: UserProfile | undefined) => {
        const current = currentProfileData || {};
        const updatedData: Partial<UserProfile> = {};
        if (data.firstName !== undefined) updatedData.firstName = data.firstName.trim();
        if (data.lastName !== undefined) updatedData.lastName = data.lastName.trim();
        if (isAvatarUpdate) {
          updatedData.photoUrl = data.removeAvatar ? null : data.avatar;
          updatedData.avatars = undefined;
        }
        return { ...current, ...updatedData };
      },
      { revalidate: isAvatarUpdate },
    );
  };

  const getUpdateFields = (data: UpdateUserProfileData): string[] =>
    Object.keys(data).filter((key) => data[key as keyof UpdateUserProfileData] !== undefined);

  const handleUpdateError = (
    errors: Record<string, string> | undefined,
    updateFields: string[],
  ): { errors?: Record<string, string> } | void => {
    const hasErrors = errors && Object.keys(errors).length > 0;
    const errorType = hasErrors ? 'validation' : 'generic';
    const errorMessage = hasErrors
      ? 'Update profile failed with validation errors'
      : 'Update profile failed with generic error';
    logErrorToSentry(new Error(errorMessage), {
      transactionName: ProfileUpdateTelemetry.TransactionName,
      metadata: { errorType, errors, updateFields },
    });
    addSentryBreadcrumb(ProfileUpdateTelemetry.BreadcrumbCategory, 'Update user profile failed', {
      errorType,
      ...(hasErrors && { errorFields: Object.keys(errors) }),
    });
    if (hasErrors) return { errors };
    toast(t('error.general'), { status: ToastStatus.Error });
    return undefined;
  };

  const handleUpdateException = (error: unknown, updateFields: string[]) => {
    toast(t('error.general'), { status: ToastStatus.Error });
    logErrorToSentry(error, {
      transactionName: ProfileUpdateTelemetry.TransactionName,
      metadata: { errorType: 'exception', updateFields },
    });
    addSentryBreadcrumb(
      ProfileUpdateTelemetry.BreadcrumbCategory,
      'Update user profile exception',
      {
        error: String(error),
        updateFields,
      },
    );
  };

  const handleUpdateSuccess = (data: UpdateUserProfileData, updateFields: string[]) => {
    updateUserProfileCache(data);
    toast(t('profile:success.details'), { status: ToastStatus.Success });
    addSentryBreadcrumb(
      ProfileUpdateTelemetry.BreadcrumbCategory,
      'Update user profile succeeded',
      {
        updatedFields: updateFields,
      },
    );
  };

  const processUpdateResponse = (
    response: { success: boolean; message?: string },
    errors: Record<string, string> | undefined,
    updateFields: string[],
  ): { errors?: Record<string, string>; success?: boolean } | void => {
    if (!response.success) {
      return errors?.avatar
        ? { errors: { avatar: response.message || t('errors.upload-avatar-failed') } }
        : handleUpdateError(errors, updateFields);
    }
    return { success: response.success };
  };

  const updateProfile = async (
    data: UpdateUserProfileData,
  ): Promise<{ errors?: Record<string, string>; success?: boolean } | void> => {
    setIsUpdating(true);
    const updateFields = getUpdateFields(data);
    addSentryBreadcrumb(ProfileUpdateTelemetry.BreadcrumbCategory, 'Update user profile started', {
      fields: updateFields,
      hasAvatar: data.avatar !== undefined,
      removeAvatar: data.removeAvatar,
    });

    try {
      const updateData = buildUpdateData(data);
      const { data: response, errors } = await updateUserProfile(updateData);
      const result = processUpdateResponse(response, errors, updateFields);
      if (result && result.errors) {
        return result;
      }

      handleUpdateSuccess(data, updateFields);
      return { success: response.success };
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
