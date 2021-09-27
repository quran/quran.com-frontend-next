import { useState } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import RepeatIcon from '../../../public/icons/ic_repeat_24px 1.svg';

import RepeatAudioModal from './RepeatAudioModalProps';

import Button, { ButtonVariant, ButtonShape } from 'src/components/dls/Button/Button';
import { selectAudioFile } from 'src/redux/slices/AudioPlayer/state';

const RepeatAudioButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioFile = useSelector(selectAudioFile, shallowEqual);

  return (
    <>
      {audioFile && (
        <RepeatAudioModal
          chapterId={audioFile?.chapterId.toString()}
          isOpen={isModalOpen}
          onClickOutside={() => setIsModalOpen(false)}
        />
      )}
      <Button
        disabled={!audioFile}
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
