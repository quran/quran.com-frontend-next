/* eslint-disable react/no-multi-comp */
import { useContext, useState } from 'react';

import { useSelector } from '@xstate/react';

import RepeatIcon from '../../../public/icons/repeat.svg';

import RemainingRangeCount from './RemainingRangeCount';
import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Wrapper from 'src/components/Wrapper/Wrapper';
import { logButtonClick } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const RepeatAudioButton = () => {
  const audioService = useContext(AudioPlayerMachineContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentSurah = useSelector(audioService, (state) => state.context.surah);
  const repeatActor = useSelector(audioService, (state) => state.context.repeatActor);
  const isInRepeatMode = !!repeatActor;

  const onButtonClicked = () => {
    logButtonClick('audio_player_repeat');
    setIsModalOpen(true);
  };

  return (
    <>
      <RepeatAudioModal
        defaultRepetitionMode={RepetitionMode.Range}
        chapterId={currentSurah.toString()}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Wrapper
        shouldWrap={isInRepeatMode}
        wrapper={(children) => (
          <Badge
            content={
              isInRepeatMode && (
                <RemainingRangeCount
                  rangeActor={repeatActor.getSnapshot().context.rangeCycleActor}
                />
              )
            }
          >
            {children}
          </Badge>
        )}
      >
        <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} onClick={onButtonClicked}>
          <RepeatIcon />
        </Button>
      </Wrapper>
    </>
  );
};

export default RepeatAudioButton;
