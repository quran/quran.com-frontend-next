import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import CloseIcon from '../../../../public/icons/close.svg';
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
      icon={<CloseIcon />}
    >
      {t('audio.player.close')}
    </PopoverMenu.Item>
  );
};

export default CloseButton;
