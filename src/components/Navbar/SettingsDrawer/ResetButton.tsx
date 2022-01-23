import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import styles from './ResetButton.module.scss';

import Button from 'src/components/dls/Button/Button';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import resetSettings from 'src/redux/slices/reset-settings';
import { logButtonClick } from 'src/utils/eventLogger';
import QueryParam from 'types/QueryParam';

// reset button will dispatch a `reset` action
// reducers will listen to this action
// for example, check slices/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t, lang } = useTranslation('common');
  const toast = useToast();

  const onResetSettingsClicked = () => {
    logButtonClick('reset_settings');
    dispatch(resetSettings(lang));
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
