import { useState } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import RepeatIcon from '../../../public/icons/repeat.svg';

import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonVariant, ButtonShape, ButtonType } from 'src/components/dls/Button/Button';
import Wrapper from 'src/components/Wrapper/Wrapper';
import {
  selectAudioFile,
  selectRemainingRangeRepeatCount,
  selectIsInRepeatMode,
} from 'src/redux/slices/AudioPlayer/state';

const RepeatAudioButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioFile = useSelector(selectAudioFile, shallowEqual);
  const isInRepeatMode = useSelector(selectIsInRepeatMode);
  const remainingRangeRepeatCount = useSelector(selectRemainingRangeRepeatCount);

  return (
    <>
      {audioFile && (
        <RepeatAudioModal
          defaultRepetitionMode={RepetitionMode.Range}
          chapterId={audioFile?.chapterId.toString()}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <Wrapper
        shouldWrap={isInRepeatMode}
        wrapper={(children) => <Badge content={remainingRangeRepeatCount}>{children}</Badge>}
      >
        <Button
          type={isInRepeatMode ? ButtonType.Success : ButtonType.Secondary}
          disabled={!audioFile}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          onClick={() => setIsModalOpen(true)}
        >
          <RepeatIcon />
        </Button>
      </Wrapper>
    </>
  );
};

export default RepeatAudioButton;
