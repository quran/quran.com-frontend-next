import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfScrollingButton from './EndOfScrollingButton';

import useScrollToTop from 'src/hooks/useScrollToTop';
import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
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
        />
      )}
      <EndOfScrollingButton text={t('surah-beginning')} onClick={scrollToTop} />
      {!isLastSurah(chapterNumber) && (
        <EndOfScrollingButton
          text={t('next-surah')}
          href={getSurahNavigationUrl(chapterNumber + 1)}
        />
      )}
    </>
  );
};

export default ChapterControls;
