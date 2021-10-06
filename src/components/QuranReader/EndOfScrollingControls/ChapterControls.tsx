import React from 'react';

import EndOfScrollingButton from './EndOfScrollingButton';

import useScrollToTop from 'src/hooks/useScrollToTop';
import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const ChapterControls: React.FC<Props> = ({ lastVerse }) => {
  const scrollToTop = useScrollToTop();
  const { chapterId } = lastVerse;
  const chapterNumber = Number(chapterId);
  return (
    <>
      {!isFirstSurah(chapterNumber) && (
        <EndOfScrollingButton
          text="Previous Surah"
          href={getSurahNavigationUrl(chapterNumber - 1)}
        />
      )}
      <EndOfScrollingButton text="Beginning of Surah" onClick={scrollToTop} />
      {!isLastSurah(chapterNumber) && (
        <EndOfScrollingButton text="Next Surah" href={getSurahNavigationUrl(chapterNumber + 1)} />
      )}
    </>
  );
};

export default ChapterControls;
