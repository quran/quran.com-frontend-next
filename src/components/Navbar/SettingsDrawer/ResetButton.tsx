import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './ResetButton.module.scss';

import Button from 'src/components/dls/Button/Button';
import resetSettings from 'src/redux/slices/reset-settings';

// reset button will dispatch a `reset` action
// reducers will listen to this action
// for example, check slices/theme.ts. it has extra reducer that listens to `reset` action
const ResetButton = () => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('common');
  return (
    <div className={styles.resetButtonContainer}>
      <Button onClick={() => dispatch(resetSettings(lang))}>{t('settings.reset-cta')}</Button>
    </div>
  );
};

export default ResetButton;
