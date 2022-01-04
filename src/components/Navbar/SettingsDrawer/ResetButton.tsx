import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './ResetButton.module.scss';

import Button from 'src/components/dls/Button/Button';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import resetSettings from 'src/redux/slices/reset-settings';
import { logButtonClick } from 'src/utils/eventLogger';

// reset button will dispatch a `reset` action
// reducers will listen to this action
// for example, check slices/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('common');
  const toast = useToast();

  const onResetSettingsClicked = () => {
    logButtonClick('reset_settings');
    dispatch(resetSettings(lang));
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
