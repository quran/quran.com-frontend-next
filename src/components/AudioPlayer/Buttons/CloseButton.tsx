import { useContext } from 'react';

import { useTranslation } from 'next-i18next';

import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import CloseIcon from '@/icons/close.svg';
import { logButtonClick } from '@/utils/eventLogger';
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
