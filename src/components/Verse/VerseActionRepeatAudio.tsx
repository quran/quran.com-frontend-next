import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { RepetitionMode } from '../AudioPlayer/RepeatAudioModal/SelectRepetitionMode';

import RepeatAudioModal from '@/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import RepeatIcon from '@/icons/repeat-new.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterNumberFromKey } from '@/utils/verse';

type VerseActionRepeatAudioProps = {
  verseKey: string;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
};
const VerseActionRepeatAudio = ({
  verseKey,
  isTranslationView,
  onActionTriggered,
}: VerseActionRepeatAudioProps) => {
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chapterId = getChapterNumberFromKey(verseKey);

  const onItemClicked = () => {
    if (isTranslationView) {
      logButtonClick('translation_view_verse_actions_menu_repeat');
    } else {
      logButtonClick('reading_view_verse_actions_menu_repeat');
    }
    setIsModalOpen(true);
    onActionTriggered?.();
  };

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
        icon={
          <IconContainer
            icon={<RepeatIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onItemClicked}
      >
        {t('audio.player.repeat-1-verse')}
      </PopoverMenu.Item>
    </>
  );
};

export default VerseActionRepeatAudio;
