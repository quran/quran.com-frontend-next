import { useDispatch } from 'react-redux';

import CloseIcon from '../../../public/icons/close.svg';
import Button, { ButtonShape, ButtonVariant } from '../dls/Button/Button';

import { triggerPauseAudio } from './EventTriggers';

import { resetAudioFile } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';

const CloseButton = () => {
  const dispatch = useDispatch();
  return (
    <Button
      tooltip="Close"
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      onClick={withStopPropagation(() => {
        triggerPauseAudio();
        dispatch(resetAudioFile());
      })}
    >
      <CloseIcon />
    </Button>
  );
};

export default CloseButton;
