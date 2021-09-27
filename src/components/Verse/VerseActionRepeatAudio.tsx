import { useState } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import RepeatIcon from '../../../public/icons/repeat.svg';

import VerseActionsMenuItem from './VerseActionsMenuItem';

import RepeatAudioModal, { RepeatType } from 'src/components/AudioPlayer/RepeatAudioModal';
import { selectAudioFile } from 'src/redux/slices/AudioPlayer/state';

type VerseActionRepeatAudioProps = {
  verseKey: string;
};
const VerseActionRepeatAudio = ({ verseKey }: VerseActionRepeatAudioProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioFile = useSelector(selectAudioFile, shallowEqual);

  return (
    <>
      {audioFile && (
        <RepeatAudioModal
          defaultRepeatType={RepeatType.Single}
          defaultSelectedVerse={verseKey}
          chapterId={audioFile?.chapterId.toString()}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <VerseActionsMenuItem
        title="Repeat Verse"
        icon={<RepeatIcon />}
        onClick={() => setIsModalOpen(true)}
      />
    </>
  );
};

export default VerseActionRepeatAudio;
