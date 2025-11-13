import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { updatePassword } from '@/utils/auth/authRequests';

type UpdatePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface UseUpdatePasswordReturn {
  updatePassword: (data: UpdatePasswordData) => Promise<{ errors?: Record<string, string> } | void>;
  isUpdating: boolean;
}

/**
 * Custom hook for updating user password
 * Handles the submission logic and toast notifications
 * @returns {UseUpdatePasswordReturn} Object containing updatePassword function and isUpdating state
 */
const useUpdatePassword = (): UseUpdatePasswordReturn => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePasswordHandler = async (
    data: UpdatePasswordData,
  ): Promise<{ errors?: Record<string, string> } | void> => {
    setIsUpdating(true);

    try {
      const { data: response, errors } = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (!response.success) {
        if (Object.keys(errors).length > 0) {
          return { errors };
        }
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
        return undefined;
      }

      toast(t('success.password'), {
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
    updatePassword: updatePasswordHandler,
    isUpdating,
  };
};

export default useUpdatePassword;
