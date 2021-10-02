import { useState } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import RepeatIcon from '../../../public/icons/repeat.svg';

import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

import Button, { ButtonVariant, ButtonShape } from 'src/components/dls/Button/Button';
import { selectAudioData } from 'src/redux/slices/AudioPlayer/state';

const RepeatAudioButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioData = useSelector(selectAudioData, shallowEqual);

  return (
    <>
      {audioData && (
        <RepeatAudioModal
          defaultRepetitionMode={RepetitionMode.Range}
          chapterId={audioData?.chapterId.toString()}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <Button
        disabled={!audioData}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        onClick={() => setIsModalOpen(true)}
      >
        <RepeatIcon />
      </Button>
    </>
  );
};

export default RepeatAudioButton;
