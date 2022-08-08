/* eslint-disable react/no-multi-comp */
import { useContext, useState } from 'react';

import { useActor } from '@xstate/react';

import RepeatIcon from '../../../public/icons/repeat.svg';

import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Wrapper from 'src/components/Wrapper/Wrapper';
import { logButtonClick } from 'src/utils/eventLogger';
// import { toLocalizedNumber } from 'src/utils/locale';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

// TODO: get remaing repeat count
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RemainingRangeCount = ({ repeatActor }) => {
  // const { lang } = useTranslation('common');
  // const [currentState] = useActor(repeatActor);
  // const remainingRangeRepeatCount = toLocalizedNumber(
  //   useSelector(selectRemainingRangeRepeatCount),
  //   lang,
  // );

  return null;
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
          <Badge content={<RemainingRangeCount repeatActor={currentState.context.repeatActor} />}>
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
