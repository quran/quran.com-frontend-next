/* eslint-disable react/no-multi-comp */
import { useContext, useState } from 'react';

import { useSelector } from '@xstate/react';

import RemainingRangeCount from './RemainingRangeCount';
import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

import RepeatIcon from '@/icons/repeat.svg';
import Badge from '@/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Wrapper from 'src/components/Wrapper/Wrapper';
import { logButtonClick } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const RepeatAudioButton = ({ isLoading }) => {
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
      {!isLoading && (
        <RepeatAudioModal
          defaultRepetitionMode={RepetitionMode.Range}
          chapterId={currentSurah.toString()}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

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
        <Button
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          onClick={onButtonClicked}
          isDisabled={isLoading}
        >
          <RepeatIcon />
        </Button>
      </Wrapper>
    </>
  );
};

export default RepeatAudioButton;
