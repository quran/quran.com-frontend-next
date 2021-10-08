import ForwardIcon from '../../../public/icons/forward_10.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';

import { triggerSeek } from './EventTriggers';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { withStopPropagation } from 'src/utils/event';

export enum SeekButtonType {
  FastForward = 'fastForward',
  Rewind = 'rewind',
}

type SeekButtonProps = {
  type: SeekButtonType;
  isLoading: boolean;
};
const SeekButton = ({ type, isLoading }: SeekButtonProps) => {
  return (
    <Button
      tooltip={type === SeekButtonType.Rewind ? 'Rewind 10 seconds' : 'Fast forward 10 seconds'}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      disabled={isLoading}
      onClick={withStopPropagation(() => triggerSeek(type === SeekButtonType.Rewind ? -10 : 10))}
    >
      {type === SeekButtonType.Rewind ? <ReplayIcon /> : <ForwardIcon />}
    </Button>
  );
};

export default SeekButton;
