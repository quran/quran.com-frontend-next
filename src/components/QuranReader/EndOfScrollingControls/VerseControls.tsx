import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonType } from '@/dls/Button/Button';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { isFirstSurah, isLastSurah } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahNavigationUrl, getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { isLastVerseOfSurah as isLastVerse } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
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
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getSurahNavigationUrl(chapterNumber - 1)}
          onClick={() => {
            logButtonClick('verse_control_prev_chapter');
          }}
        >
          {t('prev-surah')}
        </Button>
      )}
      {!isLastVerseOfSurah && (
        <>
          <Button
            type={ButtonType.Secondary}
            href={getSurahNavigationUrl(chapterNumber)}
            onClick={() => {
              logButtonClick('verse_control_full_chapter');
            }}
          >
            {t('full-surah-cta')}
          </Button>
          <Button
            href={getChapterWithStartingVerseUrl(verseKey)}
            onClick={() => {
              logButtonClick('verse_control_continue');
            }}
          >
            {t('common:continue')}
          </Button>
        </>
      )}
      {isLastVerseOfSurah && (
        <Button
          type={ButtonType.Secondary}
          href={getSurahNavigationUrl(chapterNumber)}
          onClick={() => {
            logButtonClick('verse_control_chapter_beginning');
          }}
        >
          {t('surah-beginning')}
        </Button>
      )}
      {isLastVerseOfSurah && !isLastSurah(chapterNumber) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getSurahNavigationUrl(chapterNumber + 1)}
          onClick={() => {
            logButtonClick('verse_control_next_chapter');
          }}
        >
          {t('next-surah')}
        </Button>
      )}
    </>
  );
};

export default VerseControls;
