import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import { FiX } from 'react-icons/fi';
import { triggerPauseAudio } from '../EventTriggers';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { resetAudioData } from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick } from 'src/utils/eventLogger';

const CloseButton = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  return (
    <PopoverMenu.Item
      shouldCloseMenuAfterClick
      onClick={() => {
        logButtonClick(`audio_player_overflow_menu_close`);
        triggerPauseAudio();
        dispatch(resetAudioData(lang));
      }}
      icon={<FiX />}
    >
      {t('audio.player.close')}
    </PopoverMenu.Item>
  );
};

export default CloseButton;
