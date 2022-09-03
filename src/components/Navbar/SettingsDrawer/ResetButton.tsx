/* eslint-disable react-func/max-lines-per-function */
import { useContext } from 'react';

import { unwrapResult } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
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

  const onResetSettingsClicked = () => {
    logButtonClick('reset_settings');
    if (isLoggedIn()) {
      dispatch(persistDefaultSettings(lang))
        // @ts-ignore
        .then(unwrapResult)
        .then(() => {
          dispatch(resetSettings(lang));
          audioService.send({
            type: 'SET_INITIAL_CONTEXT',
            ...DEFAULT_XSTATE_INITIAL_STATE,
          });
        })
        .catch(() => {
          // TODO: show an error
        });
    } else {
      dispatch(resetSettings(lang));
      audioService.send({
        type: 'SET_INITIAL_CONTEXT',
        ...DEFAULT_XSTATE_INITIAL_STATE,
      });
    }
    let usingQueryParam = false;
    if (router.query[QueryParam.Translations]) {
      usingQueryParam = true;
      delete router.query[QueryParam.Translations];
    }
    if (router.query[QueryParam.Reciter]) {
      usingQueryParam = true;
      delete router.query[QueryParam.Reciter];
    }
    if (router.query[QueryParam.WBW_LOCALE]) {
      usingQueryParam = true;
      delete router.query[QueryParam.WBW_LOCALE];
    }
    if (usingQueryParam) {
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
