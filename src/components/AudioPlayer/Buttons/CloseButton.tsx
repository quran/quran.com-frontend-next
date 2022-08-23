import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import CloseIcon from '../../../../public/icons/close.svg';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { logButtonClick } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const CloseButton = () => {
  const { t } = useTranslation('common');
  const audioService = useContext(AudioPlayerMachineContext);
  return (
    <PopoverMenu.Item
      shouldCloseMenuAfterClick
      onClick={() => {
        logButtonClick(`audio_player_overflow_menu_close`);
        audioService.send({ type: 'CLOSE' });
      }}
      icon={<CloseIcon />}
    >
      {t('audio.player.close')}
    </PopoverMenu.Item>
  );
};

export default CloseButton;
