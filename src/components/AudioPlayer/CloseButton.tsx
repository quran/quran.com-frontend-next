import { useDispatch } from 'react-redux';
import { resetAudioFile } from 'src/redux/slices/AudioPlayer/state';
import { withStopPropagation } from 'src/utils/event';
import Button, { ButtonShape, ButtonVariant } from '../dls/Button/Button';
import CloseIcon from '../../../public/icons/close.svg';
import { triggerPauseAudio } from './EventTriggers';

const CloseButton = () => {
  const dispatch = useDispatch();
  return (
    <Button
      tooltip="Close audio player"
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
