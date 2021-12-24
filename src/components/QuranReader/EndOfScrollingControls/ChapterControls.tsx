import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfScrollingButton from './EndOfScrollingButton';

import useScrollToTop from 'src/hooks/useScrollToTop';
import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const ChapterControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const scrollToTop = useScrollToTop();
  const { chapterId } = lastVerse;
  const chapterNumber = Number(chapterId);
  return (
    <>
      {!isFirstSurah(chapterNumber) && (
        <EndOfScrollingButton
          text={t('prev-surah')}
          href={getSurahNavigationUrl(chapterNumber - 1)}
          onClick={() => {
            logButtonClick('chapter_control_prev_chapter');
          }}
        />
      )}
      <EndOfScrollingButton
        text={t('surah-beginning')}
        onClick={() => {
          logButtonClick('chapter_control_scroll_to_beginning');
          scrollToTop();
        }}
      />
      {!isLastSurah(chapterNumber) && (
        <EndOfScrollingButton
          text={t('next-surah')}
          href={getSurahNavigationUrl(chapterNumber + 1)}
          onClick={() => {
            logButtonClick('chapter_control_next_chapter');
          }}
        />
      )}
    </>
  );
};

export default ChapterControls;
