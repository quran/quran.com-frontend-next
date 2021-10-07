import { useDispatch } from 'react-redux';

import CloseIcon from '../../../../public/icons/close.svg';
import { triggerPauseAudio } from '../EventTriggers';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { resetAudioData } from 'src/redux/slices/AudioPlayer/state';

const CloseButton = () => {
  const dispatch = useDispatch();
  return (
    <PopoverMenu.Item
      onClick={() => {
        triggerPauseAudio();
        dispatch(resetAudioData());
      }}
      icon={<CloseIcon />}
    >
      Close Audio Player
    </PopoverMenu.Item>
  );
};

export default CloseButton;
