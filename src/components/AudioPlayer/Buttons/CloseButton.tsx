import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import CloseIcon from '../../../../public/icons/close.svg';
import { triggerPauseAudio } from '../EventTriggers';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { resetAudioData } from 'src/redux/slices/AudioPlayer/state';

const CloseButton = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  return (
    <PopoverMenu.Item
      shouldCloseMenuAfterClick
      onClick={() => {
        triggerPauseAudio();
        dispatch(resetAudioData());
      }}
      icon={<CloseIcon />}
    >
      {t('audio.player.close')}
    </PopoverMenu.Item>
  );
};

export default CloseButton;
