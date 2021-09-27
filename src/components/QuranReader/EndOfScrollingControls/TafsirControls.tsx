import React from 'react';

import EndOfScrollingButton from './EndOfScrollingButton';

import { getVerseNavigationUrl, getVerseTafsirNavigationUrl } from 'src/utils/navigation';
import { isFirstVerseOfSurah, isLastVerseOfSurah } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const TafsirControls: React.FC<Props> = ({ lastVerse }) => {
  const { chapterId, verseNumber } = lastVerse;
  return (
    <>
      {!isFirstVerseOfSurah(verseNumber) && (
        <EndOfScrollingButton
          text="Previous Ayah"
          href={getVerseTafsirNavigationUrl(chapterId, verseNumber - 1)}
        />
      )}
      <EndOfScrollingButton
        text="Back to Ayah"
        href={getVerseNavigationUrl(`${chapterId}:${verseNumber}`)}
      />
      {!isLastVerseOfSurah(String(chapterId), verseNumber) && (
        <EndOfScrollingButton
          text="Next Ayah"
          href={getVerseTafsirNavigationUrl(chapterId, verseNumber + 1)}
        />
      )}
    </>
  );
};

export default TafsirControls;
