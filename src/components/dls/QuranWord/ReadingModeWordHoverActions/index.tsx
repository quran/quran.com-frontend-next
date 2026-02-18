import React, { ReactNode, useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import WordOptionsDropdown from './WordOptionsDropdown';

import RepeatAudioModal from '@/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from '@/components/AudioPlayer/RepeatAudioModal/SelectRepetitionMode';
import MobilePopover from '@/dls/Popover/HoverablePopover';
import { TooltipType } from '@/dls/Tooltip';
import ArrowIcon from '@/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterNumberFromKey } from '@/utils/verse';

type Props = {
  children: ReactNode;
  isTooltipVisible: boolean;
  tooltipContent: ReactNode;
  tooltipDelay: number;
  onOpenStudyMode: () => void;
  onPlayFromWord: () => void;
  verseKey: string;
};

const ReadingModeWordHoverActions: React.FC<Props> = ({
  children,
  isTooltipVisible,
  tooltipContent,
  tooltipDelay,
  onOpenStudyMode,
  onPlayFromWord,
  verseKey,
}) => {
  const { t } = useTranslation('common');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);

  const handleDropdownOpenChange = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
  }, []);

  const handleMore = useCallback(() => {
    logButtonClick('reading_word_3dots_more', { verseKey });
    onOpenStudyMode();
  }, [onOpenStudyMode, verseKey]);

  const handlePlayFromWord = useCallback(() => {
    logButtonClick('reading_word_3dots_play_from_word', { verseKey });
    onPlayFromWord();
  }, [onPlayFromWord, verseKey]);

  const handleRepeatVerse = useCallback(() => {
    logButtonClick('reading_word_3dots_repeat_verse', { verseKey });
    setIsRepeatModalOpen(true);
  }, [verseKey]);

  const handleTooltipClick = useCallback(() => {
    logButtonClick('reading_word_tooltip_open_study_mode', { verseKey });
    onOpenStudyMode();
  }, [onOpenStudyMode, verseKey]);

  const chapterId = getChapterNumberFromKey(verseKey);

  const dropdown = (
    <WordOptionsDropdown
      onOpenChange={handleDropdownOpenChange}
      onMore={handleMore}
      onPlayFromWord={handlePlayFromWord}
      onRepeatVerse={handleRepeatVerse}
    />
  );

  return (
    <>
      <MobilePopover
        content={isTooltipVisible ? tooltipContent : null}
        suffixContent={dropdown}
        tooltipType={isTooltipVisible ? TooltipType.SUCCESS : undefined}
        shouldContentBeClickable={isTooltipVisible}
        onIconClick={isTooltipVisible ? handleTooltipClick : undefined}
        icon={isTooltipVisible ? <ArrowIcon /> : undefined}
        iconAriaLabel={isTooltipVisible ? t('quran-reader:aria.open-study-mode') : undefined}
        defaultStyling={false}
        isContainerSpan
        tooltipDelay={tooltipDelay}
        isTooltipOpen={isDropdownOpen || undefined}
      >
        {children}
      </MobilePopover>

      <RepeatAudioModal
        defaultRepetitionMode={RepetitionMode.Single}
        selectedVerseKey={verseKey}
        chapterId={chapterId.toString()}
        isOpen={isRepeatModalOpen}
        onClose={() => setIsRepeatModalOpen(false)}
      />
    </>
  );
};

export default ReadingModeWordHoverActions;
