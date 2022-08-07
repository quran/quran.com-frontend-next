import { useContext, useState } from 'react';

import { useActor } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import RepeatIcon from '../../../public/icons/repeat.svg';

import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Wrapper from 'src/components/Wrapper/Wrapper';
import {
  selectIsInRepeatMode,
  selectRemainingRangeRepeatCount,
} from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const RepeatAudioButton = () => {
  const { lang } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState] = useActor(audioService);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInRepeatMode = useSelector(selectIsInRepeatMode);
  const remainingRangeRepeatCount = toLocalizedNumber(
    useSelector(selectRemainingRangeRepeatCount),
    lang,
  );

  const onButtonClicked = () => {
    logButtonClick('audio_player_repeat');
    setIsModalOpen(true);
  };

  return (
    <>
      <RepeatAudioModal
        defaultRepetitionMode={RepetitionMode.Range}
        chapterId={currentState.context.surah.toString()}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Wrapper
        shouldWrap={isInRepeatMode}
        wrapper={(children) => <Badge content={remainingRangeRepeatCount}>{children}</Badge>}
      >
        <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} onClick={onButtonClicked}>
          <RepeatIcon />
        </Button>
      </Wrapper>
    </>
  );
};

export default RepeatAudioButton;
