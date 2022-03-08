import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { RepetitionMode } from '../AudioPlayer/RepeatAudioModal/SelectRepetitionMode';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import RepeatAudioModal from 'src/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal';
import { RepeatIcon } from 'src/components/Icons';
import { getChapterNumberFromKey } from 'src/utils/verse';

type VerseActionRepeatAudioProps = {
  verseKey: string;
};
const VerseActionRepeatAudio = ({ verseKey }: VerseActionRepeatAudioProps) => {
  const { t } = useTranslation('common');
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
        {t('audio.player.repeat-1-verse')}
      </PopoverMenu.Item>
    </>
  );
};

export default VerseActionRepeatAudio;
