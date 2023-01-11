import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
import { withStopPropagation } from '@/utils/event';
import { logButtonClick } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const CloseRadioButton = () => {
  const { t } = useTranslation('common');
  const audioService = useContext(AudioPlayerMachineContext);
  return (
    <Button
      tooltip={t('close')}
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      onClick={withStopPropagation(() => {
        logButtonClick('radio_player_close');
        audioService.send('CLOSE_RADIO');
      })}
      shouldFlipOnRTL={false}
    >
      <CloseIcon />
    </Button>
  );
};

export default CloseRadioButton;
