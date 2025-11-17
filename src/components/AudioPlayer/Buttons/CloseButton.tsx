import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
import { withStopPropagation } from '@/utils/event';
import { logButtonClick } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const CloseButton = () => {
  const { t } = useTranslation('common');
  const audioService = useContext(AudioPlayerMachineContext);
  return (
    <Button
      tooltip={t('audio.player.close-audio-player')}
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      onClick={withStopPropagation(() => {
        logButtonClick(`audio_player_overflow_menu_close`);
        audioService.send({ type: 'CLOSE' });
      })}
      shouldFlipOnRTL={false}
    >
      <CloseIcon />
    </Button>
  );
};

export default CloseButton;
