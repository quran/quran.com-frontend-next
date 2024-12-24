/* eslint-disable react-func/max-lines-per-function */
import { useContext } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './ResetButton.module.scss';

import Button from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import resetSettings from '@/redux/actions/reset-settings';
import { DEFAULT_XSTATE_INITIAL_STATE } from '@/redux/defaultSettings/defaultSettings';
import { persistDefaultSettings } from '@/redux/slices/defaultSettings';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import QueryParam from 'types/QueryParam';

// reset button will dispatch a `reset` action
// reducers will listen to this action
// for example, check slices/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t, lang } = useTranslation('common');
  const toast = useToast();
  const audioService = useContext(AudioPlayerMachineContext);

  const onResetSettingsClicked = async () => {
    logButtonClick('reset_settings');
    const resetAndSetInitialState = () => {
      dispatch(resetSettings(lang));
      audioService.send({
        type: 'SET_INITIAL_CONTEXT',
        ...DEFAULT_XSTATE_INITIAL_STATE,
      });
    };

    if (isLoggedIn()) {
      try {
        await dispatch(persistDefaultSettings(lang)).then(unwrapResult);
        resetAndSetInitialState();
      } catch {
        // TODO: show an error
      }
    } else {
      resetAndSetInitialState();
    }

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

  return (
    <>
      <div className={styles.resetButtonContainer}>
        <Button onClick={onResetSettingsClicked}>{t('settings.reset-cta')}</Button>
      </div>
    </>
  );
};

export default ResetButton;
