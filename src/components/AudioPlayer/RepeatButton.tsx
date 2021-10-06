import { useState } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import RepeatIcon from '../../../public/icons/repeat.svg';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import RepeatAudioModal from './RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from './RepeatAudioModal/SelectRepetitionMode';

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
      <PopoverMenu.Item
        onClick={() => setIsModalOpen(true)}
        icon={<RepeatIcon />}
        isDisabled={!audioData}
      >
        Repeat settings
      </PopoverMenu.Item>
    </>
  );
};

export default RepeatAudioButton;
