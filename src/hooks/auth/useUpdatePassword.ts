import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { addSentryBreadcrumb, logErrorToSentry } from '@/lib/sentry';
import { updatePassword } from '@/utils/auth/authRequests';

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UseUpdatePasswordReturn {
  updatePassword: (
    data: UpdatePasswordData,
  ) => Promise<{ errors?: Record<string, string>; success?: boolean } | void>;
  isUpdating: boolean;
}

const enum PasswordUpdateTelemetry {
  TransactionName = 'updatePassword',
  BreadcrumbCategory = 'password.update',
}

/**
 * Custom hook for updating user password
 * Handles the submission logic and toast notifications
 * @returns {UseUpdatePasswordReturn} Object containing:
 *   - updatePassword: Function to update user password.
 *     Accepts UpdatePasswordData parameter with required fields:
 *     - currentPassword: string - User's current password
 *     - newPassword: string - New password to set
 *     - confirmPassword: string - Confirmation of new password
 *     Returns Promise<{ errors?: Record<string, string>; success?: boolean } | void>:
 *     - Resolves to { errors?: Record<string, string> } if validation fails
 *     - Resolves to { success: true } if update succeeds
 *     - Resolves to undefined if generic error or exception occurs
 *   - isUpdating: boolean - Indicates whether a password update is currently in progress
 */
const useUpdatePassword = (): UseUpdatePasswordReturn => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateError = (
    errors: Record<string, string> | undefined,
  ): { errors?: Record<string, string> } | void => {
    const hasErrors = errors && Object.keys(errors).length > 0;
    const errorType = hasErrors ? 'validation' : 'generic';
    const errorMessage = hasErrors
      ? 'Update password failed with validation errors'
      : 'Update password failed with generic error';
    logErrorToSentry(new Error(errorMessage), {
      transactionName: PasswordUpdateTelemetry.TransactionName,
      metadata: { errorType, errors },
    });
    addSentryBreadcrumb(PasswordUpdateTelemetry.BreadcrumbCategory, 'Update password failed', {
      errorType,
      ...(hasErrors && { errorFields: Object.keys(errors) }),
    });
    if (hasErrors) return { errors };
    toast(t('error.general'), { status: ToastStatus.Error });
    return undefined;
  };

  const handleUpdateException = (error: unknown): void => {
    toast(t('error.general'), { status: ToastStatus.Error });
    logErrorToSentry(error, {
      transactionName: PasswordUpdateTelemetry.TransactionName,
      metadata: { errorType: 'exception' },
    });
    addSentryBreadcrumb(PasswordUpdateTelemetry.BreadcrumbCategory, 'Update password exception', {
      error: String(error),
    });
  };

  const handleUpdateSuccess = (): void => {
    toast(t('profile:success.password'), { status: ToastStatus.Success });
    addSentryBreadcrumb(
      PasswordUpdateTelemetry.BreadcrumbCategory,
      'Update password succeeded',
      {},
    );
  };

  const processUpdateResponse = (
    response: { success: boolean; message?: string },
    errors: Record<string, string> | undefined,
  ): { errors?: Record<string, string>; success?: boolean } | void => {
    if (!response.success) {
      return handleUpdateError(errors);
    }
    return { success: response.success };
  };

  const updatePasswordHandler = async (
    data: UpdatePasswordData,
  ): Promise<{ errors?: Record<string, string>; success?: boolean } | void> => {
    setIsUpdating(true);
    addSentryBreadcrumb(PasswordUpdateTelemetry.BreadcrumbCategory, 'Update password started', {});

    try {
      const { data: response, errors } = await updatePassword(data);
      const result = processUpdateResponse(response, errors);
      if (result && result.errors) {
        return result;
      }

      handleUpdateSuccess();
      return { success: true };
    } catch (error) {
      handleUpdateException(error);
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
