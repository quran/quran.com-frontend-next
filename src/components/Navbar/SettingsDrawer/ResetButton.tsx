/* eslint-disable react-func/max-lines-per-function */
import { useContext } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SettingsBody.module.scss';

import { getCountryLanguagePreference } from '@/api';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import resetSettings from '@/redux/actions/reset-settings';
import { DEFAULT_XSTATE_INITIAL_STATE } from '@/redux/defaultSettings/defaultSettings';
import {
  persistCurrentSettings,
  selectDetectedCountry,
  setDefaultsFromCountryPreference,
  setIsUsingDefaultSettings,
  setUserHasCustomised,
} from '@/redux/slices/defaultSettings';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { CountryLanguagePreferenceResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';

// reset button will dispatch a `reset` action
// reducers will listen to this action
// for example, check slices/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t, lang } = useTranslation('common');
  const toast = useToast();
  const detectedCountry = useSelector(selectDetectedCountry);
  const audioService = useContext(AudioPlayerMachineContext);

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

  const resetAndSetInitialState = async () => {
    dispatch(resetSettings(lang));
    let countryPreference: CountryLanguagePreferenceResponse | null = null;

    // Get default settings based on current country/language preference
    try {
      countryPreference = await getCountryLanguagePreference(lang, detectedCountry || 'US');
      await dispatch(setDefaultsFromCountryPreference({ countryPreference, locale: lang })).then(
        unwrapResult,
      );
    } catch (error) {
      countryPreference = null;
      logErrorToSentry('Failed to get country language preference', error);
    }

    const reciterId =
      countryPreference?.defaultReciter?.id ?? DEFAULT_XSTATE_INITIAL_STATE.reciterId;
    audioService.send({
      type: 'SET_INITIAL_CONTEXT',
      ...DEFAULT_XSTATE_INITIAL_STATE,
      reciterId,
    });
    audioService.send({
      type: 'CHANGE_RECITER',
      reciterId,
    });
    dispatch(setIsUsingDefaultSettings(true));
    dispatch(setUserHasCustomised(false));
  };

  const onResetSettingsClicked = async () => {
    logButtonClick('reset_settings');
    if (isLoggedIn()) {
      try {
        await resetAndSetInitialState();
        await dispatch(persistCurrentSettings()).then(unwrapResult);
        cleanupUrlAndShowSuccess();
      } catch {
        toast(t('error.general'), { status: ToastStatus.Error });
      }
    } else {
      await resetAndSetInitialState();
      cleanupUrlAndShowSuccess();
    }
  };

  return (
    <Button
      onClick={onResetSettingsClicked}
      data-testid="reset-settings-button"
      variant={ButtonVariant.Simplified}
      className={styles.resetButton}
    >
      {t('settings.reset')}
    </Button>
  );
};

export default ResetButton;
