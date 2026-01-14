import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import Button from '@/dls/Button/Button';
import { setIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';

const DoneButton = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('quran-reader');

  const onDoneClicked = () => {
    logButtonClick('done_settings');
    dispatch(setIsSettingsDrawerOpen(false));
  };

  return (
    <Button onClick={onDoneClicked} data-testid="done-settings-button">
      {t('done')}
    </Button>
  );
};

export default DoneButton;
