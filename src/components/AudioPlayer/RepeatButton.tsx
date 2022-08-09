/* eslint-disable react/no-multi-comp */
import { useContext, useState } from 'react';

import { useActor, useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import RepeatIcon from '../../../public/icons/repeat.svg';

import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Wrapper from 'src/components/Wrapper/Wrapper';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const RemainingRangeCount = ({ rangeActor }) => {
  const { lang } = useTranslation('common');
  const remainingCount = useSelector(rangeActor, (state) => {
    const { totalRangeCycle, currentRangeCycle } = (state as any).context;
    return totalRangeCycle - currentRangeCycle + 1; // +1 to include the current cycle
  });
  const localizedRemainingCount = toLocalizedNumber(remainingCount, lang);

  return <span>{localizedRemainingCount}</span>;
};

const RepeatAudioButton = () => {
  const audioService = useContext(AudioPlayerMachineContext);
  const [currentState] = useActor(audioService);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInRepeatMode = !!currentState.context.repeatActor;

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
        wrapper={(children) => (
          <Badge
            content={
              currentState.context.repeatActor && (
                <RemainingRangeCount
                  rangeActor={
                    currentState.context.repeatActor.getSnapshot().context.rangeCycleActor
                  }
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
