import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfScrollingButton from './EndOfScrollingButton';

import DataContext from 'src/contexts/DataContext';
import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSurahNavigationUrl, getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import { isLastVerseOfSurah as isLastVerse } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const VerseControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const { chapterId, verseNumber, verseKey } = lastVerse;
  const chapterNumber = Number(chapterId);
  const isLastVerseOfSurah = isLastVerse(chaptersData, String(chapterId), verseNumber);
  return (
    <>
      {isLastVerseOfSurah && !isFirstSurah(chapterNumber) && (
        <EndOfScrollingButton
          text={t('prev-surah')}
          href={getSurahNavigationUrl(chapterNumber - 1)}
          onClick={() => {
            logButtonClick('verse_control_prev_chapter');
          }}
        />
      )}
      {!isLastVerseOfSurah && (
        <>
          <EndOfScrollingButton
            text={t('full-surah-cta')}
            href={getSurahNavigationUrl(chapterNumber)}
            onClick={() => {
              logButtonClick('verse_control_full_chapter');
            }}
          />
          <EndOfScrollingButton
            text={t('common:continue')}
            href={getChapterWithStartingVerseUrl(verseKey)}
            onClick={() => {
              logButtonClick('verse_control_continue');
            }}
          />
        </>
      )}
      {isLastVerseOfSurah && (
        <EndOfScrollingButton
          text={t('surah-beginning')}
          href={getSurahNavigationUrl(chapterNumber)}
          onClick={() => {
            logButtonClick('verse_control_chapter_beginning');
          }}
        />
      )}
      {isLastVerseOfSurah && !isLastSurah(chapterNumber) && (
        <EndOfScrollingButton
          text={t('next-surah')}
          href={getSurahNavigationUrl(chapterNumber + 1)}
          onClick={() => {
            logButtonClick('verse_control_next_chapter');
          }}
        />
      )}
    </>
  );
};

export default VerseControls;
