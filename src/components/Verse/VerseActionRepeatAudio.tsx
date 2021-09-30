import { useState } from 'react';

import RepeatIcon from '../../../public/icons/repeat.svg';
import { RepetitionMode } from '../AudioPlayer/RepeatAudioModal/SelectRepetitionMode';

import VerseActionsMenuItem from './VerseActionsMenuItem';

import RepeatAudioModal from 'src/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal';
import { getChapterNumberFromKey } from 'src/utils/verse';

type VerseActionRepeatAudioProps = {
  verseKey: string;
};
const VerseActionRepeatAudio = ({ verseKey }: VerseActionRepeatAudioProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chapterId = getChapterNumberFromKey(verseKey);

  return (
    <>
      <RepeatAudioModal
        defaultRepetitionMode={RepetitionMode.Single}
        selectedVerseKey={verseKey}
        chapterId={chapterId.toString()}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <VerseActionsMenuItem
        title="Repeat Verse"
        icon={<RepeatIcon />}
        onClick={() => setIsModalOpen(true)}
      />
    </>
  );
};

export default VerseActionRepeatAudio;
