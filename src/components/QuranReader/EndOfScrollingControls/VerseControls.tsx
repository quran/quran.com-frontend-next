import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import EndOfScrollingButton from './EndOfScrollingButton';

import { isFirstSurah, isLastSurah } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSurahNavigationUrl, getVerseToEndOfChapterNavigationUrl } from 'src/utils/navigation';
import { isLastVerseOfSurah as isLastVerse } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const VerseControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const { chapterId, verseNumber } = lastVerse;
  const chapterNumber = Number(chapterId);
  const isLastVerseOfSurah = isLastVerse(String(chapterId), verseNumber);
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
            href={getVerseToEndOfChapterNavigationUrl(`${chapterId}:${verseNumber}`)}
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
