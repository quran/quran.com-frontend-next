import { unwrapResult } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import Button from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { persistCurrentSettings, resetDefaultSettings } from '@/redux/slices/defaultSettings';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import QueryParam from 'types/QueryParam';

// Reset button will dispatch the new resetDefaultSettings thunk
// which re-detects locale and fetches country preferences
const ResetButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t, lang } = useTranslation('common');
  const toast = useToast();

  const cleanupUrlAndShowSuccess = () => {
    const queryParams = [
      QueryParam.TRANSLATIONS,
      QueryParam.RECITER,
      QueryParam.WBW_LOCALE,
      QueryParam.FLOW,
    ];
    const shouldUpdateUrl = queryParams.some((param) => router.query[param]);
    if (shouldUpdateUrl) {
      queryParams.forEach((param) => delete router.query[param]);
      router.push(router, undefined, { shallow: true });
    }
    toast(t('settings.reset-notif'), { status: ToastStatus.Success });
  };

  const onResetSettingsClicked = async () => {
    logButtonClick('reset_settings');
    try {
      await dispatch(resetDefaultSettings(lang)).then(unwrapResult);

      // If logged in, persist the new defaults to the server
      if (isLoggedIn()) {
        await dispatch(persistCurrentSettings()).then(unwrapResult);
      }
      cleanupUrlAndShowSuccess();
    } catch (e) {
      logErrorToSentry(e);
      toast(t('error.general'), { status: ToastStatus.Error });
    }
  };

  return (
    <Button onClick={onResetSettingsClicked} data-testid="reset-settings-button">
      {t('settings.reset-cta')}
    </Button>
  );
};

export default ResetButton;
