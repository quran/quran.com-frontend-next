import React from 'react';

import EndOfScrollingButton from './EndOfScrollingButton';

import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { getSurahNavigationUrl, getVerseToEndOfChapterNavigationUrl } from 'src/utils/navigation';
import { isLastVerseOfSurah as isLastVerse } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const VerseControls: React.FC<Props> = ({ lastVerse }) => {
  const { chapterId, verseNumber } = lastVerse;
  const chapterNumber = Number(chapterId);
  const isLastVerseOfSurah = isLastVerse(String(chapterId), verseNumber);
  return (
    <>
      {isLastVerseOfSurah && !isFirstSurah(chapterNumber) && (
        <EndOfScrollingButton
          text="Previous Surah"
          href={getSurahNavigationUrl(chapterNumber - 1)}
        />
      )}
      {!isLastVerseOfSurah && (
        <>
          <EndOfScrollingButton
            text="Read full surah"
            href={getSurahNavigationUrl(chapterNumber)}
          />
          <EndOfScrollingButton
            text="Continue"
            href={getVerseToEndOfChapterNavigationUrl(`${chapterId}:${verseNumber}`)}
          />
        </>
      )}
      {isLastVerseOfSurah && (
        <EndOfScrollingButton
          text="Beginning of Surah"
          href={getSurahNavigationUrl(chapterNumber)}
        />
      )}
      {isLastVerseOfSurah && !isLastSurah(chapterNumber) && (
        <EndOfScrollingButton text="Next Surah" href={getSurahNavigationUrl(chapterNumber + 1)} />
      )}
    </>
  );
};

export default VerseControls;
