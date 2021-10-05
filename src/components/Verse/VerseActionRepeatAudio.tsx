import { useState } from 'react';

import RepeatIcon from '../../../public/icons/repeat.svg';
import { RepetitionMode } from '../AudioPlayer/RepeatAudioModal/SelectRepetitionMode';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

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
      <PopoverMenu.Item
        icon={<RepeatIcon />}
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Repeat Verse
      </PopoverMenu.Item>
    </>
  );
};

export default VerseActionRepeatAudio;
